import React, { Component } from 'react'
import { InputGroup, FormControl, Button} from 'react-bootstrap'
import QrImageStyle from '../modules/qrImageStyle'
import * as helpers from '../helpers'
import './QRTool.css';

class QRTool extends Component {
  constructor(props) {
    super(props)

    this.qrClassesContainer = ["QR-container-general-1x", "QR-container-general-2x", "QR-container-general-4x"]
    this.qrClassesImg = ["QR-img-general-1x", "QR-img-general-2x", "QR-img-general-4x"]
    this.qrStateNames = ["2x Size", "4x Size", "1x Size"]

    this.state = {
      input: '😉whatever😉',
      qrContent: '😉whatever😉',
      qrState: 0,
      qrSize: 1024,
      selectedOption: '0'
    }

    this.handleInputChange = this.handleInputChange.bind(this)
    this.clearText = this.clearText.bind(this)
    this.updateQR = this.updateQR.bind(this)
    this.double = this.double.bind(this)
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

  // loop qr state 1x, 2x, 4x
  double() {
    var state = this.state.qrState
    state = state + 1
    if (state >= this.qrClassesContainer.length) {
      state = 0
    }
    this.setState({
      qrState: state
    })
  }

  // main checkboxes
  handleOptionChange = changeEvent => {
    let val = changeEvent.target.value
    this.setState({
      selectedOption: val,
    })
  }

  render() {
    return (
      <div>
        <div className="noprint">
          <InputGroup size="sm" className="mb-3">
            <div className="form-check form-check-inline index-checkbox">
              <input className="form-check-input" type="radio" id="generator-check" value="0" checked={this.state.selectedOption === "0"} onChange={this.handleOptionChange}/>
              <label className="form-check-label" htmlFor="generator-check">QR GENERATOR</label>
            </div>
            <div className="form-check form-check-inline index-checkbox">
              <input className="form-check-input" type="radio" id="reader-check" value="1" checked={this.state.selectedOption === "1"} onChange={this.handleOptionChange}/>
              <label className="form-check-label" htmlFor="reader-check">QR READER</label>
            </div>
          </InputGroup>
          <InputGroup size="sm" className="mb-3">
            <InputGroup.Prepend className="narrow-prepend">
              <InputGroup.Text id="input">
                QR Text
              </InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl id="input" aria-describedby="input" as="textarea" rows="6" value={this.state.input} title="Payment address. xrb_ or nano_ prefix." placeholder="" maxLength="2500" onChange={this.handleInputChange}/>
            <InputGroup.Append>
              <Button variant="outline-secondary" className="fas fa-times-circle" value='input' onClick={this.clearText}></Button>
              <Button variant="outline-secondary" className="fas fa-copy" value={this.state.input} onClick={helpers.copyText}></Button>
            </InputGroup.Append>
          </InputGroup>

          <Button variant="primary" onClick={this.print}>Print QR</Button>
          <Button variant="primary" onClick={this.double}>{String(this.qrStateNames[this.state.qrState])}</Button>
        </div>
        <div className={this.qrClassesContainer[this.state.qrState]}>
          <QrImageStyle className={this.qrClassesImg[this.state.qrState]} content={this.state.qrContent} size={this.state.qrSize} />
        </div>
      </div>
    )
  }
}
export default QRTool
