/* Joohansson 2019 */
import React from 'react';
import { Chirp } from 'chirpsdk'
import SimpleCrypto from "simple-crypto-js";
import { InputGroup, FormControl, Button} from 'react-bootstrap'
import * as helpers from '../helpers'
import {toast } from 'react-toastify'
const toolParam = 'msg'

class MessengerTool extends React.Component {
  constructor(props) {
    super(props)
    this.sdk = null
    this.state = {
      started: false,
      received: "", //received data as string
      receivedData: new Uint8Array([]), //received in Uint8Array format
      disabled: true, //send button disabled
      decryptDisabled: true, //decrypt button disabled
      downloadDisabled: true, //download button disabled
      message: "", //messeage to be sent
      password: "", //encryption password
      payload: new Uint8Array([]),
      sendButtonTxt: "SEND 1/1", //label of send button
      nextPart: false, //if scheduler is allowed to send next part
      autoSend: true, //if send button is automatic
    }
    this.payloadChunks = [] //send payload divided into parts
    this.payloadCount = 0 //current payload
    this.payloadCountMax = 1 //maxium parts to be sent
    this.maxFileSize = 1000000 //max bytes to be dropped
    this.decryptedResult = new Uint8Array([]) //for downloads

    //Bindings
    this.handleFileSelect = this.handleFileSelect.bind(this)
    this.handleMessageChange = this.handleMessageChange.bind(this)
    this.downloadByteArray = this.downloadByteArray.bind(this)
    this.tick = this.tick.bind(this)
    this.handleAutoCheck = this.handleAutoCheck.bind(this)
    this.startSDK = this.startSDK.bind(this)
    this.clearText = this.clearText.bind(this)

    this.concatTypedArray = require('concat-typed-array');

    this.audioError = `Failed to open web audio stream.
    This may happen if your browser doesn't support Web Audio or have a mic and speaker.`
  }

  componentDidMount() {
    if (!('WebAssembly' in window)) {
      toast("WebAssembly is not supported in this browser", helpers.getToast(helpers.toastType.ERROR))
    }
    //Start timer for automatic sending
    else {
      this.timerID = setInterval(
      () => this.tick(),
        100
      )
    }

    // Read URL params from parent and construct new quick path
    this.setParams()
  }

  // Defines the url params
  setParams() {
    helpers.setURLParams('?tool='+toolParam)
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  //Clear text from input field
  clearText(event) {
    switch(event.target.value) {
      case 'messageInput':
      this.setState({
        message: '',
      },
      function() {
        this.handleMessageChange(this.state.message, this.state.password)
      })
      break

      case 'pswInput':
      this.setState({
        password: '',
      },
      function() {
        this.handleMessageChange(this.state.message, this.state.password)
      })
      break
      default:
        break
    }
  }

  tick() {
    if (this.state.nextPart) {
      this.setState({
        nextPart: false, //disable state to disallow double sending
      }, () => {
        //After set state if finished, send next part
        if (this.payloadCount !== 0 && this.payloadCount < this.payloadChunks.length && this.state.autoSend) {
          this.sdk.send(this.payloadChunks[this.payloadCount])
        }
      })
    }
  }

  /**
  * Returns an array with arrays of the given size.
  *
  * @param myArray {Array} array to split
  * @param chunk_size {Integer} Size of every group
  */
  chunkArray(myArray, chunk_size) {
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];

    for (index = 0; index < arrayLength; index += chunk_size) {
      var myChunk = myArray.slice(index, index+chunk_size);
      tempArray.push(myChunk);
    }

    return tempArray;
  }

  // Show/hide how-to section
  collapse() {
    var content = document.getElementsByClassName("collapse-content")[0];
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  }

  //Check if all chars in a string is pure hex (not currently used but would cut the payload by 50%)
  checkIfHex(str) {
    const regexp = /^[0-9a-fA-F]+$/
    for (var i = 0; i < str.length; i++) {
      if (!regexp.test(str.charAt(i)))
        {
          return false
        }
    }
    return true
  }

  /*
  uint8ToBase64(u8) {
    var base64 = ""
    try {
      base64 = btoa(String.fromCharCode.apply(null, u8))
    }
    catch(error) {
      console.error("Bad data. Could not make base64.")
      return ""
    }
    return base64
  }
  */

  uint8ToBase64(u8Arr){
    var CHUNK_SIZE = 0x8000; //arbitrary number
    var index = 0;
    var length = u8Arr.length;
    var result = '';
    var slice;
    while (index < length) {
      slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
      result += String.fromCharCode.apply(null, slice);
      index += CHUNK_SIZE;
    }
    return btoa(result);
  }

  fromBase64(str) {
    var uint8
    try {
      uint8 = atob(str).split('').map(function (c) { return c.charCodeAt(0); })
    }
    catch(error) {
      //console.error("Bad data. Check received format.")
      return new Uint8Array([])
    }
    return new Uint8Array(uint8)
  }

  handleMessageChange(message, password) {
    if (message !== this.state.message) {
      this.setState({
        message: message,
      })
    }
    this.setState({
      password: password,
    })

    const key = password
    const result = this.state.received

    if (key.length > 0 && result.length > 0) {
      this.setState({ decryptDisabled: false })
    }
    else {
      this.setState({ decryptDisabled: true })
    }

    var payload = new Uint8Array(["Unknown"])
    var simpleCrypto = new SimpleCrypto(key)

    //If file imported, convert to base64 because UTF8 is not enough for non-text files
    if (this.state.payload.length > 0) {
      payload = this.state.payload
      message = this.uint8ToBase64(payload)
    }
    //Encrypt message if key is given
    if (key.length > 0 && message.length > 0) {
      message = simpleCrypto.encrypt(message)
    }

    //Valid message
    if (message.length > 0) {
      payload = new TextEncoder('utf-8').encode(message)
      this.setState({ disabled: false })

      //Divide payload into several 32 byte payloads and calculate parts needed
      this.payloadChunks = this.chunkArray(payload, 32)
      this.payloadCountMax = this.payloadChunks.length
      if (this.payloadCountMax === 0) {
        this.payloadCountMax = 1
      }
    }
    else {
      this.setState({
        disabled: true,
      })
      this.payloadCountMax = 1
    }

    this.payloadCount = 0
    this.setState({
      sendButtonTxt: "SEND "+(this.payloadCount+1)+"/"+this.payloadCountMax
    })
  }

  //When file is dropped
  handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    const scope = this

    var files = evt.dataTransfer.files; // fileList object

    var reader = new FileReader();

    reader.onload = function(theFile) {
      const data = reader.result
      var uint8 = new Uint8Array(data);
      if (uint8.length > 0) {
        scope.setState({
          payload: uint8,
          disabled: false
        }, () => {
          //After set state if finished
          scope.handleMessageChange("Loaded File: "+files[0].name, this.state.password)
        })
      }
    }.bind(this)

    //Read file (only if below max file size)
    const size = files[0].size
    if (size <= this.maxFileSize) {
      //reader.readAsBinaryString(files[0])
      reader.readAsArrayBuffer(files[0])
    }
    else {
      toast("Max file size allowed: 1 MB", helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
    }
  }

  //File drag over drop zone
  handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

  //For file download link
  destroyClickedElement(event)
  {
    document.body.removeChild(event.target);
  }

  handleAutoCheck(e) {
    this.setState({
      autoSend: !this.state.autoSend,
    });
  }

  //Download a file from given filename and byteArray
  downloadByteArray() {
    var data = this.decryptedResult

    //Try decode base64 string to uint8array (if it fails, then it was not base64 ie not a file but normal text)
    let dataString = new TextDecoder('utf-8').decode(data)
    let dataTemp = this.fromBase64(dataString)
    if (dataTemp.length > 0) {
      data = dataTemp
    }

    //Try get the file type from magic numbers
    let bytes = []
    data.forEach((byte) => {
      bytes.push(byte.toString(16))
    })
    const hex = bytes.join('').toUpperCase()
    let ext = this.getMimetypeExt(hex.substring(0,8))
    let fileName = "message."+ext

    //Back to base64 encoding for file download
    var base64 = "QmFkIGRhdGEuIFRyeSB0byBjaGFuZ2UgdGhlIHJlY2VpdmUgZm9ybWF0Lg=="
    if (data.length > 0) {
      base64 = this.uint8ToBase64(data)
    }

    var downloadLink = document.createElement("a")
    downloadLink.download = fileName
    downloadLink.innerHTML = "Download File"
    if (window.webkitURL != null)
    {
        // Chrome allows the link to be clicked
        // without actually adding it to the DOM.
        //downloadLink.href = window.webkitURL.createObjectURL(blob)
        downloadLink.href = 'data:application/octet-stream;base64,' + base64
    }
    else
    {
        // Firefox requires the link to be added to the DOM
        // before it can be clicked.
        //downloadLink.href = window.URL.createObjectURL(blob)
        downloadLink.href = 'data:application/octet-stream;base64,' + base64
        downloadLink.onclick = this.destroyClickedElement
        downloadLink.style.display = "none"
        document.body.appendChild(downloadLink)
    }

    downloadLink.click();
  }

  //Guess file type
  getMimetypeExt(signature) {
    switch (signature) {
      case '89504E47':
          return 'png'
      case '47494638':
          return 'gif'
      case '25504446':
          return 'pdf'
      case 'FFD8FFDB':
      case 'FFD8FFE0':
          return 'jpg'
      case '49492A00':
          return 'tif'
      case '4D4D002A':
          return 'tif'
      case '504B0304':
          return 'zip'
      case '52617221':
          return 'rar'
      case '52494646':
          return 'wav'
      case '504D4F43':
          return 'dat'
      case '75737461':
          return 'tar'
      case '377ABCAF':
          return '7z'
      case '000001BA':
      case '000001B3':
          return 'mpg'
      default:
          return ''
    }
  }

  //Initialize the Chirp SDK
  startSDK() {
    Chirp({
      key: 'b2c2e7ed5Acebf8842C1f3F5F',
      onSending: data => {
        console.log("Sending")
        this.setState({
          disabled: true,
          sendButtonTxt: "Sending "+(this.payloadCount+1)+"/"+this.payloadCountMax+"..."
        })
      },
      onSent: data => {
        console.log("Data sent")
        //Check if there is more data to send
        this.payloadCount++
        if (this.payloadCount >= this.payloadChunks.length) {
          this.payloadCount = 0
        }

        this.setState({
          disabled: false,
          sendButtonTxt: "SEND "+(this.payloadCount+1)+"/"+this.payloadCountMax
        })

        this.setState({
          disabled: false,
          sendButtonTxt: "SEND "+(this.payloadCount+1)+"/"+this.payloadCountMax
        }, () => {
          //After set state if finished
          if (this.payloadCount < this.payloadChunks.length) {
            this.setState({
              nextPart: true
            })
          }
        })
      },
      onReceiving: () => {
        console.log("Receiving...")
        this.payloadCount = 0 //Reset any sending parts
        this.setState({
          disabled: true,
          sendButtonTxt: "Incoming..."
        })
      },
      onReceived: data => {
        console.log("Data received")
        this.setState({
          sendButtonTxt: "SEND "+(this.payloadCount+1)+"/"+this.payloadCountMax
        })
        if (data.length > 0) {
          let combinedData = this.concatTypedArray(Uint8Array,this.state.receivedData,data)
          let result = new TextDecoder('utf-8').decode(data)

          this.setState({
            receivedData: combinedData,
            received: this.state.received+result,
          })

          this.decryptedResult = combinedData //for downloads

          //Enable decrypt button
          const key = document.getElementById('pswInput').value
          if (key !== "") {
            this.setState({ decryptDisabled: false })
          }
          else {
            this.setState({ decryptDisabled: true })
          }
          this.setState({ downloadDisabled: false })
        }
        else {
          alert("Missed data. Try increase the volume.")
        }
      }
    }).then(sdk => {
      this.sdk = sdk
      sdk.start().then(() => {
        this.setState({ started: true })
      }).catch(console.error)
    }).catch(err => console.error(err) && err.message.includes('WebAssembly') ?
        toast(err, helpers.getToast(helpers.toastType.ERROR_AUTO_LONG)) : toast(this.audioError, helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
      )
  }

  render() {
    return (
      <div>
        <p>Secure Audio Transmitter / Receiver</p>

        {/* AREA BEFORE STARTED */}
        <div className={this.state.started ? "hidden":""}>
            <ul>
                <li>Send a message or file using encrypted audio between two devices</li>
                <li>Speaker and Mic is required and you will be asked to accept</li>
            </ul>

            <InputGroup size="sm" className="mb-3">
              <Button variant="primary" onClick={this.startSDK}>Start</Button>
            </InputGroup>
        </div>

        <div className={this.state.started ? "":"hidden"}>
          <ul>
              <li>Use optional encryption to avoid anyone to intercept the audio.</li>
              <li>If they are far apart you can use a recorder for example a phone app.</li>
              <li>Each part is 32 chars and split automatically. Encryption makes it longer.</li>
              <li>Decryption needs to be done before downloading.</li>
          </ul>

          {/* MESSAGE INPUT */}
          <InputGroup size="sm" className='mb-3'>
            <InputGroup.Prepend>
              <InputGroup.Text id="messageInput">
                Message
              </InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl id="messageInput" aria-describedby="messageInput" value={this.state.message} title="Message to be sent over audio channel." placeholder="" autocomplete="off"
              onChange={(event) => {
                if (event.target.value.length === 0) {
                  //Reset file payload before calculating the rest
                  this.setState({
                    payload: new Uint8Array([])
                  }, () => {
                    //After set state if finished
                    this.handleMessageChange("", this.state.password)
                  })
                }
                else {
                  this.handleMessageChange(event.target.value, this.state.password)
                }
              }}/>
            <InputGroup.Append>
              <Button variant="outline-secondary" className="fas fa-times-circle" value='messageInput' onClick={this.clearText}></Button>
            </InputGroup.Append>
          </InputGroup>

          {/* FILE DROPZONE */}
          <div
            id="drop_zone"
            onDragOver={this.handleDragOver}
            onDrop={this.handleFileSelect}>
            ...or drop a file here
          </div>

          {/* ENCRYPTION INPUT */}
          <InputGroup size="sm" className='mb-3'>
            <InputGroup.Prepend>
              <InputGroup.Text id="encryption">
                Encryption Key
              </InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl id="pswInput" aria-describedby="encryption" value={this.state.password} title="Encrypt message to avoid audio interception." placeholder="Optional" autocomplete="off"
              onChange={(event) => {
                this.handleMessageChange(this.state.message, event.target.value)
              }}/>
            <InputGroup.Append>
              <Button variant="outline-secondary" className="fas fa-times-circle" value='pswInput' onClick={this.clearText}></Button>
            </InputGroup.Append>
          </InputGroup>

          {/* AUTO TICKER */}
          <InputGroup size="sm" className="mb-3">
            <div className="form-check form-check-inline index-checkbox">
              <input className="form-check-input" type="checkbox" id="autoSend" value="autoSend" checked={this.state.autoSend}
                onChange={(event) => {
                  this.handleAutoCheck()
              }}/>
              <label className="form-check-label" htmlFor="autoSend">Auto Send</label>
            </div>
          </InputGroup>

          {/* SEND BUTTON */}
          <InputGroup size="sm" className="mb-3">
            <Button variant="primary" disabled={this.state.disabled}
              onClick={() => {
                if (this.payloadCount === 0 || this.payloadCount >= this.payloadChunks.length) {
                  this.sdk.send(this.payloadChunks[0])
                }
                else {
                  this.sdk.send(this.payloadChunks[this.payloadCount])
                }
              }}>{this.state.sendButtonTxt}</Button>

          {/* RETRY BUTTON */}
              <Button variant="primary" disabled={this.state.disabled || this.state.autoSend || this.payloadCount === 0}
                onClick={() => {
                  if (this.payloadCount > 0) {
                    this.payloadCount--
                    this.setState({
                      sendButtonTxt: "SEND "+(this.payloadCount+1)+"/"+this.payloadCountMax
                    })
                  }
                }}>REDO LAST</Button>
          </InputGroup>

          {/* RESULT AREA */}
          <InputGroup size="sm" className="mb-3">
            <InputGroup.Prepend className="narrow-prepend">
              <InputGroup.Text id="output">
                Data
              </InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl id="output-area" aria-describedby="output" as="textarea" rows="6" value={this.state.received} placeholder="Listening for message..." readOnly/>
            <InputGroup.Append>
              <Button variant="outline-secondary" className="fas fa-copy" onClick={helpers.copyOutput}></Button>
            </InputGroup.Append>
          </InputGroup>

          {/* DECRYPTION BUTTON */}
          <Button variant="primary" disabled={this.state.decryptDisabled}
            onClick={() => {
                //Decrypt message
                //var result = document.getElementById("resultTxt").value
                const key = document.getElementById('pswInput')
                const result = new TextDecoder('utf-8').decode(this.state.receivedData)

                var decrypted = ""
                try {
                  var simpleCrypto = new SimpleCrypto(key.value)
                  decrypted = simpleCrypto.decrypt(result)
                }
                catch(error) {
                  console.error("Could not decrypt data.")
                }

                if (decrypted.length === 0) {
                  decrypted = "Failed to decrypt"
                }

                //Update the original data (if downloadings)
                this.setState({
                  received: decrypted
                })
                this.decryptedResult = new TextEncoder('utf-8').encode(decrypted)
            }}>DECRYPT
          </Button>

          {/* DOWNLOAD BUTTON */}
          <Button variant="primary" disabled={this.state.decryptDisabled}
            onClick={() => {
              //Download the bytes shown in text textarea
              this.downloadByteArray()
            }}>DOWNLOAD
          </Button>

          {/* RESET BUTTON */}
          <Button variant="primary"
            onClick={() => {
              //Reset textarea
              this.setState({
                received: "",
                receivedData: new Uint8Array([]),
                message: "",
                payload: new Uint8Array([]),
                sendButtonTxt: "SEND 1/1",
                decryptDisabled: true,
                downloadDisabled: true,
              })
              this.payloadCount = 0
              this.payloadCountMax = 1
              this.payloadChunks = []
              }
            }>RESET
          </Button>
        </div>
      </div>
    )
  }
}

export default MessengerTool;
