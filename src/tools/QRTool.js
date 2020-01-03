import React, { Component } from 'react'
import { InputGroup, FormControl, Button} from 'react-bootstrap'
import * as helpers from '../helpers'
import jsQR from 'jsqr'
import {toast } from 'react-toastify'
import QrImageStyle from './components/qrImageStyle'
import ImageFilters from 'canvas-filters'
const toolParam = 'qr'

class QRTool extends Component {
  constructor(props) {
    super(props)

    // READER
    this.video = null
    this.videoCanvas = null
    this.videoCtx = null
    this.loadingMessage = null
    this.outputFound = false

    this.state = {
      input: '',
      qrContent: '',
      qrState: 0, //qr size
      qrSize: 1024,
      selectedOption: '0',
      output: "",
      selectedFile: null,
      saturation: '0%',
    }

    this.handleInputChange = this.handleInputChange.bind(this)
    this.clearText = this.clearText.bind(this)
    this.updateQR = this.updateQR.bind(this)
    this.double = this.double.bind(this)
    this.startReader = this.startReader.bind(this)
    this.drawRect = this.drawRect.bind(this)
    this.tick = this.tick.bind(this)
    this.reset = this.reset.bind(this)
  }

  componentDidMount = () => {
    // Read URL params from parent and construct new quick path
    var type = this.props.state.type

    if (typeof type !== 'undefined') {
      this.optionChange(type)
    }
    if(!type) {
      this.setParams()
    }
  }

  // Defines the url params
  setParams() {
    helpers.setURLParams('?tool='+toolParam + '&type='+this.state.selectedOption)
  }

  //Clear text from input field
  clearText(event) {
    switch(event.target.value) {
      case 'input':
        this.setState({
          input: '',
        },
        function() {
          this.updateQR()
          this.setParams()
        })
        break
      default:
        break
    }
  }

  handleInputChange(event) {
    this.inputChange(event.target.value)
  }

  inputChange(input) {
    this.setState({
      input: input,
    },
    function() {
      this.updateQR()
    })
  }

  updateQR() {
    this.setState({
      qrContent: this.state.input
    })
  }

  print() {
    window.print()
  }

  reset() {
    switch (this.state.selectedOption) {
      case '1':
      this.startReader()
      break

      case '2':
      this.setState({
        output: '',
        selectedFile: null,
      })
      this.outputFound = false
      const canvas = this.refs.fileCanvas
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.hidden = true
      break

      default:
      break
    }

  }

  // main checkboxes
  handleOptionChange = changeEvent => {
    this.optionChange(changeEvent.target.value)
  }

  optionChange(val) {
    this.setState({
      selectedOption: val,
    },function() {
      this.setParams()
      //Init webcam
      if (val === "1") {
        this.startReader()
      }
      if (val === "2") {
        this.setState({
          output: '',
          selectedFile: null,
        })
        this.outputFound = false
      }
    })
  }

  // loop qr state 1x, 2x, 4x
  double() {
    var state = this.state.qrState
    state = state + 1
    if (state >= helpers.qrClassesContainer.length) {
      state = 0
    }
    this.setState({
      qrState: state
    })
  }

  //READER CODE
  // Draws border around video canvas
  drawLine(canvas, begin, end, color, width) {
    canvas.beginPath()
    canvas.moveTo(begin.x, begin.y)
    canvas.lineTo(end.x, end.y)
    canvas.lineWidth = width
    canvas.strokeStyle = color
    canvas.stroke()
  }

  drawRect(canvas, height, code, color) {
    const lineWidth = Math.ceil(Math.max(height / 100, 3))
    this.drawLine(canvas, code.location.topLeftCorner, code.location.topRightCorner, color, lineWidth)
    this.drawLine(canvas, code.location.topRightCorner, code.location.bottomRightCorner, color, lineWidth)
    this.drawLine(canvas, code.location.bottomRightCorner, code.location.bottomLeftCorner, color, lineWidth)
    this.drawLine(canvas, code.location.bottomLeftCorner, code.location.topLeftCorner, color, lineWidth)
  }

  // Upload a file
  onFileHandler = event => {
    let reader = new FileReader()
    let file = event.target.files[0]
    let fileName = event.target.value

    reader.onloadend = () => {
      this.outputFound = false
      this.setState({
        selectedFile: fileName.replace(/.*[\\]/, ''),
      },function() {
        const fileCanvas = this.refs.fileCanvas
        const fileCtx = fileCanvas.getContext('2d')
        fileCanvas.hidden = false

        var qrImage = new Image()
        qrImage.src = reader.result
        qrImage.onload = function() {
          var newWidth = qrImage.width
          var newHeight = qrImage.height
          // Scale down if image too large
          fileCanvas.width = newWidth
          fileCanvas.height = newHeight
          if (newWidth > 1500 && qrImage.height > 0) {
            let ratio = qrImage.height / qrImage.width
            newWidth = 1500
            newHeight = Math.ceil(newWidth * ratio)
          }
          fileCanvas.width = newWidth
          fileCanvas.height = newHeight
          fileCtx.drawImage(qrImage,0,0, newWidth, newHeight)
          var imageData = fileCtx.getImageData(0, 0, newWidth, newHeight)

          // increase the chances to succeed on poor images
          var filtered = ImageFilters.GrayScale(imageData)
          filtered = ImageFilters.BrightnessContrastPhotoshop(filtered, 0, 40)
          fileCtx.putImageData(filtered, 0, 0) // put back the filtered image

          var code = jsQR(imageData.data, newWidth, newHeight)

          if (code) {
            // draw line around the QR
            this.drawRect(fileCtx, imageData.height, code, "#ff0000")

            if (!this.outputFound) {
              this.outputFound = true
              toast("Found QR data", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
              this.setState({
                output: code.data,
              })
              this.outputFound = true
            }
          }
          else {
            toast("Did not find a QR in the uploaded image", helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
            this.setState({
              output: '',
            })
            this.outputFound = false
          }
        }.bind(this)
      }.bind(this))
    }

    if (file instanceof Blob) {
      reader.readAsDataURL(file)
    }
  }

  // Webcam reader and qr detector
  tick() {
    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      this.videoCanvas.hidden = false
      this.videoCanvas.height = this.video.videoHeight
      this.videoCanvas.width = this.video.videoWidth
      this.videoCtx.drawImage(this.video, 0, 0, this.videoCanvas.width, this.videoCanvas.height)
      var imageData = this.videoCtx.getImageData(0, 0, this.videoCanvas.width, this.videoCanvas.height)

      // increase the chances to succeed on poor images
      var filtered = ImageFilters.GrayScale(imageData)
      filtered = ImageFilters.BrightnessContrastPhotoshop(filtered, 0, 40)
      this.videoCtx.putImageData(filtered, 0, 0) // put back the filtered image

      var code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      })
      if (code) {
        // draw line around the QR
        this.drawRect(this.videoCtx, imageData.height, code, "#ff0000")

        if (!this.outputFound) {
          this.outputFound = true
          toast("Found QR data", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
          this.setState({
            output: code.data,
          })
        }
      }
    }

    // only run video stream as long as reader is active
    if (this.state.selectedOption === "1" && !this.outputFound) {
      requestAnimationFrame(this.tick)
    }
    else {
      // stop video stream when QR found
      this.video.srcObject.getTracks()[0].stop()
    }
  }

  // Init video component
  startReader() {
    this.setState({
      output: '',
    })
    this.outputFound = false
    this.video = document.createElement("video")
    this.videoCanvas = this.refs.videoCanvas
    this.videoCtx = this.videoCanvas.getContext('2d')

    // Use facingMode: environment to attemt to get the front camera on phones
    try {
      let device = navigator.mediaDevices
      if (device) {
        device.getUserMedia({ video: { facingMode: "environment", audio: false, video: true } }).then(async function(stream) {
          this.video.srcObject = stream
          this.video.setAttribute("playsinline", true) // required to tell iOS safari we don't want fullscreen
          this.video.setAttribute('autoplay', '');
          this.video.setAttribute('muted', '');
          await this.video.play()
          requestAnimationFrame(this.tick)
        }.bind(this)).catch(function(err) {
          console.log(err)
          toast("Failed to load video device. Make sure it's connected.", helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
        })
      }
    }
    catch(error) {
      console.log(error)
    }
  }

  render() {
    return (
      <div>
        <div className="noprint">
          <InputGroup size="sm" className="mb-3">
            <div className="form-check form-check-inline index-checkbox header-radio">
              <input className="form-check-input" type="radio" id="generator-check" value="0" checked={this.state.selectedOption === "0"} onChange={this.handleOptionChange}/>
              <label className="form-check-label" htmlFor="generator-check">QR GENERATOR</label>
            </div>
            <div className="form-check form-check-inline index-checkbox header-radio">
              <input className="form-check-input" type="radio" id="reader-check" value="1" checked={this.state.selectedOption === "1"} onChange={this.handleOptionChange}/>
              <label className="form-check-label" htmlFor="reader-check">QR VIDEO READER</label>
            </div>
            <div className="form-check form-check-inline index-checkbox header-radio">
              <input className="form-check-input" type="radio" id="file-check" value="2" checked={this.state.selectedOption === "2"} onChange={this.handleOptionChange}/>
              <label className="form-check-label" htmlFor="file-check">QR FILE READER</label>
            </div>
          </InputGroup>

          <ul className={this.state.selectedOption !== '0' ? "hidden":""}>
            <li>Click on QR to toggle size, if using large data</li>
          </ul>

          <div className={this.state.selectedOption!=='0' ? 'hidden':''}>
            <InputGroup size="sm" className="mb-3">
              <InputGroup.Prepend className="narrow-prepend">
                <InputGroup.Text id="input">
                  QR Text
                </InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl id="input" aria-describedby="input" as="textarea" rows="6" value={this.state.input} placeholder="" maxLength="2500" onChange={this.handleInputChange} autoComplete="off"/>
              <InputGroup.Append>
                <Button variant="outline-secondary" className="fas fa-times-circle" value='input' onClick={this.clearText}></Button>
                <Button variant="outline-secondary" className="fas fa-copy" value={this.state.input} onClick={helpers.copyText}></Button>
              </InputGroup.Append>
            </InputGroup>

            <Button variant="primary" onClick={this.print}>Print QR</Button>
          </div>
        </div>

        <div className={this.state.selectedOption!=='0' ? 'hidden':''}>
        <div className={helpers.qrClassesContainer[this.state.qrState]}>
          <QrImageStyle className={helpers.qrClassesImg[this.state.qrState]} content={this.state.qrContent} onClick={this.double} title="Click to toggle size" size={this.state.qrSize} />
        </div>
        </div>

        <div className={this.state.selectedOption!=='1' ? 'hidden':'qr-reader-wrapper'}>
          <ul>
            <li>If the cam stream is not visible or QR data not fetched, try use another device/browser</li>
          </ul>
          <canvas ref="videoCanvas" className="qr-canvas" hidden></canvas>
          <InputGroup size="sm" className="mb-3">
            <InputGroup.Prepend className="narrow-prepend">
              <InputGroup.Text id="output">
                QR Data
              </InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl id="output-area" aria-describedby="output" as="textarea" rows="6" value={this.state.output} placeholder="Waiting for QR video data..." readOnly/>
            <InputGroup.Append>
              <Button variant="outline-secondary" className="fas fa-copy" onClick={helpers.copyOutput}></Button>
            </InputGroup.Append>
          </InputGroup>
          <Button variant="primary" onClick={this.reset}>Reset</Button>
        </div>

        <div className={this.state.selectedOption!=='2' ? 'hidden':'qr-reader-wrapper'}>
          <ul>
            <li>No image data is stored other than in device RAM until page is reloaded or reset</li>
          </ul>
          <InputGroup size="sm" className="mb-3">
            <InputGroup.Prepend className="narrow-prepend">
              <InputGroup.Text id="output">
                Upload
              </InputGroup.Text>
            </InputGroup.Prepend>
            <div className="custom-file">
              <input
                type="file"
                name="file"
                className="custom-file-input"
                id="inputGroupFile01"
                aria-describedby="inputGroupFileAddon01"
                onChange={this.onFileHandler}
              />
              <label className="custom-file-label" htmlFor="inputGroupFile01">
                {this.state.selectedFile ? this.state.selectedFile: "Choose an image file containing a QR code"}
              </label>
            </div>
          </InputGroup>

          <canvas ref="fileCanvas" className="qr-canvas" hidden></canvas>
          <InputGroup size="sm" className="mb-3">
            <InputGroup.Prepend className="narrow-prepend">
              <InputGroup.Text id="output">
                QR Data
              </InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl id="output-area" aria-describedby="output" as="textarea" rows="6" value={this.state.output} placeholder="Waiting for QR image file..." readOnly/>
            <InputGroup.Append>
              <Button variant="outline-secondary" className="fas fa-copy" onClick={helpers.copyOutput}></Button>
            </InputGroup.Append>
          </InputGroup>
          <Button variant="primary" onClick={this.reset}>Reset</Button>
        </div>
      </div>
    )
  }
}
export default QRTool
