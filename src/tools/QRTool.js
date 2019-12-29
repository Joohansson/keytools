import React, { Component } from 'react'
import { InputGroup, FormControl, Button} from 'react-bootstrap'
import * as helpers from '../helpers'
import jsQR from 'jsqr'
import {toast } from 'react-toastify'
import QrImageStyle from './components/qrImageStyle'
const toolParam = 'qr'

class QRTool extends Component {
  constructor(props) {
    super(props)

    // READER
    this.video = null
    this.canvasElement = null
    this.canvas = null
    this.loadingMessage = null

    this.state = {
      input: '😉whatever😉',
      qrContent: '😉whatever😉',
      qrState: 0, //qr size
      qrSize: 1024,
      selectedOption: '0',
      output: "",
      outputFound: false, //found qr code from webcam,
    }

    this.handleInputChange = this.handleInputChange.bind(this)
    this.clearText = this.clearText.bind(this)
    this.updateQR = this.updateQR.bind(this)
    this.double = this.double.bind(this)
    this.startReader = this.startReader.bind(this)
    this.drawLine = this.drawLine.bind(this)
    this.tick = this.tick.bind(this)
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

  // main checkboxes
  handleOptionChange = changeEvent => {
    this.optionChange(changeEvent.target.value)
  }

  optionChange(val) {
    //Init webcam
    if (val === "1") {
      this.startReader()
    }

    this.setState({
      selectedOption: val,
    },function() {
      this.setParams()
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
  drawLine(begin, end, color) {
    this.canvas.beginPath()
    this.canvas.moveTo(begin.x, begin.y)
    this.canvas.lineTo(end.x, end.y)
    this.canvas.lineWidth = 2
    this.canvas.strokeStyle = color
    this.canvas.stroke()
  }

  // Webcam reader and qr detector
  tick() {
    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      this.canvasElement.hidden = false
      this.canvasElement.height = this.video.videoHeight
      this.canvasElement.width = this.video.videoWidth
      this.canvas.drawImage(this.video, 0, 0, this.canvasElement.width, this.canvasElement.height)
      var imageData = this.canvas.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height)
      var code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      })
      if (code) {
        // draw line around the QR
        this.drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#f9ae42")
        this.drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#f9ae42")
        this.drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#f9ae42")
        this.drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#f9ae42")

        if (!this.state.outputFound) {
          toast("Found QR data", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
          this.setState({
            output: code.data,
            outputFound: true,
          })
        }
      }
    }

    // only run video stream as long as reader is active
    if (this.state.selectedOption === "1" && !this.state.outputFound) {
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
      outputFound: false,
    })
    this.video = document.createElement("video")
    this.canvasElement = document.getElementById("qr-canvas")
    this.canvas = this.canvasElement.getContext("2d")

    // Use facingMode: environment to attemt to get the front camera on phones
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", audio: false, video: true } }).then(function(stream) {
      this.video.srcObject = stream
      this.video.setAttribute("playsinline", true) // required to tell iOS safari we don't want fullscreen
      this.video.play()
      requestAnimationFrame(this.tick)
    }.bind(this)).catch(function(err) {
      console.log(err)
      toast("Failed to load video device. Make sure it's connected.", helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
    })
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
              <label className="form-check-label" htmlFor="reader-check">QR READER</label>
            </div>
          </InputGroup>

          <ul className={this.state.selectedOption !== '0' ? "hidden":""}>
            <li>Click on QR to toggle size, if using large data</li>
          </ul>

          <div className={this.state.selectedOption==='1' ? 'hidden':''}>
            <InputGroup size="sm" className="mb-3">
              <InputGroup.Prepend className="narrow-prepend">
                <InputGroup.Text id="input">
                  QR Text
                </InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl id="input" aria-describedby="input" as="textarea" rows="6" value={this.state.input} placeholder="" maxLength="2500" onChange={this.handleInputChange}/>
              <InputGroup.Append>
                <Button variant="outline-secondary" className="fas fa-times-circle" value='input' onClick={this.clearText}></Button>
                <Button variant="outline-secondary" className="fas fa-copy" value={this.state.input} onClick={helpers.copyText}></Button>
              </InputGroup.Append>
            </InputGroup>

            <Button variant="primary" onClick={this.print}>Print QR</Button>
          </div>
        </div>

        <div className={this.state.selectedOption==='1' ? 'hidden':''}>
        <div className={helpers.qrClassesContainer[this.state.qrState]}>
          <QrImageStyle className={helpers.qrClassesImg[this.state.qrState]} content={this.state.qrContent} onClick={this.double} title="Click to toggle size" size={this.state.qrSize} />
        </div>
        </div>

        <div className={this.state.selectedOption==='0' ? 'hidden':'qr-reader-wrapper'}>
          <canvas id="qr-canvas" hidden></canvas>
          <InputGroup size="sm" className="mb-3">
            <InputGroup.Prepend className="narrow-prepend">
              <InputGroup.Text id="output">
                QR Data
              </InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl id="output" aria-describedby="output" as="textarea" rows="6" value={this.state.output} placeholder="Waiting for QR data..." readOnly/>
            <InputGroup.Append>
              <Button variant="outline-secondary" className="fas fa-copy" value={this.state.output} onClick={helpers.copyText}></Button>
            </InputGroup.Append>
          </InputGroup>
          <Button variant="primary" onClick={this.startReader}>Reset</Button>
        </div>
      </div>
    )
  }
}
export default QRTool
