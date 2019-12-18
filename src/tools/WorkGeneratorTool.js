import React, { Component } from 'react'
import * as nano from 'nanocurrency'
import { InputGroup, FormControl, Button} from 'react-bootstrap'
import * as helpers from '../helpers'
import MainPage from '../mainPage'
import QrImageStyle from '../modules/qrImageStyle'
import {toast } from 'react-toastify'

class WorkGeneratorTool extends Component {
  constructor(props) {
    super(props)

    this.state = {
      workHash: '',
      work: '',
      qrContent: '',
      qrSize: 512,
      activeQR: false,
      qrHidden: true,
      validWorkHash: false,
      validWork: false,
      generating: false,
      output: '',
      savedOutput: '',
    }

    this.handleWorkHashChange = this.handleWorkHashChange.bind(this)
    this.sample = this.sample.bind(this)
    this.generateWork = this.generateWork.bind(this)
    this.updateQR = this.updateQR.bind(this)
    this.clearText = this.clearText.bind(this)
  }

  //Clear text from input field
  clearText(event) {
    switch(event.target.value) {
      case 'workHash':
        this.setState({
          workHash: '',
          validWorkHash: false
        },
        function() {
          this.updateQR()
        })
        break

        case 'work':
          this.setState({
            work: '',
            validWork: false
          },
          function() {
            this.updateQR()
          })
          break
      default:
        break
    }
  }

  // Any QR button is pressed. Handle active button.
  // Any QR button is pressed
  handleQRChange = changeEvent => {
    let val = changeEvent.target.value
    // deselect button if clicking on the same button
    if (this.state.qrActive === val) {
      this.setState({
        qrActive: '',
        qrHidden: true
      })
    }
    else {
      this.setState({
        qrActive: val,
        qrHidden: false,
      },
      function() {
        this.updateQR()
      })
    }
  }

  updateQR() {
    switch(this.state.qrActive) {
      case 'workHash':
        this.setState({
          qrContent: this.state.workHash,
        })
        break
        case 'work':
          this.setState({
            qrContent: this.state.work,
          })
          break
      default:
        this.setState({
          qrContent: '',
          qrHidden: true,
        })
        break
    }
  }

  sample() {
    this.setState({
      workHash: '4E5004CA14899B8F9AABA7A76D010F73E6BAE54948912588B8C4FE0A3B558CA5',
      validWorkHash: true,
    },
    function() {
      this.updateQR()
    })
  }

  handleWorkHashChange(event) {
    this.workHashChange(event.target.value)
  }

  workHashChange(hash) {
    if (!nano.checkHash(hash)) {
      this.setState({
        workHash: hash,
        validWorkHash: false,
      },
      function() {
        this.updateQR()
      })
      if (hash !== '') {
        new MainPage().notifyInvalidFormat()
      }
      return
    }
    this.setState({
      workHash: hash,
      validWorkHash: true,
    },
    function() {
      this.updateQR()
    })
  }

  generateWork() {
    this.setState({
      generating: true
    })

    if (this.state.validWorkHash) {
      try {
        toast("Started generating PoW...", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
        window.NanoWebglPow(this.state.workHash,
          (work, n) => {
              toast("Successfully generated PoW!", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
              this.setState({
                generating: false
              })
              this.workChange(work)
          },
          n => {
            toast("Calculated " + helpers.addCommas(n*window.NanoWebglPow.width * window.NanoWebglPow.height) + " hashes...", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
          }
        )
      }
      catch(error) {
        if(error.message === 'webgl2_required') {
          toast("WebGL 2 is required to generate work.", helpers.getToast(helpers.toastType.ERROR))
        }
        else if(error.message === 'invalid_hash') {
          toast("Block hash must be 64 character hex string", helpers.getToast(helpers.toastType.ERROR))
        }
        else {
          toast("An unknown error occurred while generating PoW", helpers.getToast(helpers.toastType.ERROR))
          console.log("An unknown error occurred while generating PoW" + error)
        }
        this.setState({
          generating: false
        })
        return
      }
    }
    else {
      toast("Need a valid input hash to generate work", helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
    }
  }

  workChange(hash) {
    if (!nano.validateWork({blockHash:this.state.workHash, work:hash})) {
      toast("The output work did not validate against input hash.", helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
      this.setState({
        work: '',
        validWork: false
      })
      return
    }
    this.setState({
      work: hash,
      validWork: true
    },
    function() {
      this.updateQR()
      this.appendOutput()
    })
  }

  // add a new line to output text field
  appendOutput() {
    let output = this.state.savedOutput + this.state.workHash + ',' + this.state.work + '\r'
    this.setState({
      output: output,
      savedOutput: output
    })
  }

  render() {
    return (
      <div>
        <p>Generate Proof of Work (PoW) from Input Hash</p>
        <ul>
          <li>Output format is INPUT HASH, WORK</li>
          <li>The generator is using the GPU via webGL which is not supported in all browsers</li>
        </ul>

        <InputGroup size="sm" className='mb-3'>
          <InputGroup.Prepend>
            <InputGroup.Text id="workHash">
              Input Hash
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="workHash" aria-describedby="workHash" value={this.state.workHash} disabled={this.state.generating} title="64 char hex hash for generating work." placeholder="ABC123... or abc123..." maxLength="64" onChange={this.handleWorkHashChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='workHash' disabled={this.state.generating} onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.workHash} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'workHash' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='workHash' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>
        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="work">
              PoW
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="work" aria-describedby="work" value={this.state.work} disabled title="The generated proof of work for given input." placeholder="ABC123... or abc123..." maxLength="16"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='work' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.work} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'work' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='work' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <Button variant="primary" onClick={this.generateWork} disabled={!this.state.validWorkHash || this.state.generating}>Generate PoW</Button>
          <Button variant="primary" onClick={this.sample}>Sample</Button>
        </InputGroup>

        <InputGroup size="sm" className='mb-3'>
          <InputGroup.Prepend className='narrow-prepend'>
            <InputGroup.Text id="output">
              Output
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="output-area" aria-describedby="output" as="textarea" rows="6" placeholder="" value={this.state.output} readOnly/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-copy" onClick={helpers.copyOutput}></Button>
          </InputGroup.Append>
        </InputGroup>

        <div className={ this.state.qrHidden ? "hidden" : "QR-container"}>
          <QrImageStyle className="QR-img" content={this.state.qrContent} size={this.state.qrSize} />
        </div>
      </div>
    )
  }
}
export default WorkGeneratorTool
