import React, { Component } from 'react'
import * as nano from 'nanocurrency'
import { InputGroup, FormControl, Button} from 'react-bootstrap'
import './convert.css'
import MainPage from '../mainPage'
import QrImageStyle from '../modules/qrImageStyle';

class ConvertTool extends Component {
  constructor(props) {
    super(props)

    this.state = {
      raw: '1000000000000000000000000000000',
      nano: '1000000',
      Mnano: '1',
      qrContent: '1',
      qrSize: 512,
      activeQR: 'Mnano',
      rawBtnActive: false,
      nanoBtnActive: false,
      MnanoBtnActive: true,
    }

    this.handleRawChange = this.handleRawChange.bind(this)
    this.handlenanoChange = this.handlenanoChange.bind(this)
    this.handleMnanoChange = this.handleMnanoChange.bind(this)
    this.isNumeric = this.isNumeric.bind(this)
    this.updateQR = this.updateQR.bind(this)
  }

  //Check if numeric string
  isNumeric(val) {
    //numerics and last character is not a dot and number of dots is 0 or 1
    let isnum = /(?<=^| )\d+(\.\d+)?(?=$| )/.test(val)
    if (isnum) {
      return true
    }
    else {
      return false
    }
  }

  //Copy any text to clipboard
  copyText(event) {
    var dummy = document.createElement("input")
    document.body.appendChild(dummy)
    dummy.setAttribute('value', event.target.value)
    dummy.select()
    document.execCommand("copy")
    document.body.removeChild(dummy)
    new MainPage().notifyCopy()
  }

  changeQR(event) {
    this.setState({
      activeQR: event.target.value
    })
    this.updateQR(event.target.value)
  }

  updateQR(unit) {
    switch(unit) {
      case 'raw':
        this.setState({
          qrContent: this.state.raw,
          rawBtnActive: true,
          nanoBtnActive: false,
          MnanoBtnActive: false,
        })
        break
      case 'nano':
        this.setState({
          qrContent: this.state.nano,
          rawBtnActive: false,
          nanoBtnActive: true,
          MnanoBtnActive: false,
        })
        break
      case 'Mnano':
        this.setState({
          qrContent: this.state.Mnano,
          rawBtnActive: false,
          nanoBtnActive: false,
          MnanoBtnActive: true,
        })
        break
      default:
        break
    }
  }

  rawTonano(input) {
    return this.isNumeric(input) ? nano.convert(input, {from: nano.Unit.raw, to: nano.Unit.nano}) : 'N/A'
  }

  rawToMnano(input) {
    return this.isNumeric(input) ? nano.convert(input, {from: nano.Unit.raw, to: nano.Unit.NANO}) : 'N/A'
  }

  nanoToRaw(input) {
    return this.isNumeric(input) ? nano.convert(input, {from: nano.Unit.nano, to: nano.Unit.raw}) : 'N/A'
  }

  nanoToMnano(input) {
    return this.isNumeric(input) ? nano.convert(input, {from: nano.Unit.nano, to: nano.Unit.NANO}) : 'N/A'
  }

  MnanoToRaw(input) {
    return this.isNumeric(input) ? nano.convert(input, {from: nano.Unit.NANO, to: nano.Unit.raw}) : 'N/A'
  }

  MnanoTonano(input) {
    return this.isNumeric(input) ? nano.convert(input, {from: nano.Unit.NANO, to: nano.Unit.nano}) : 'N/A'
  }

  handleRawChange(event) {
    this.setState({
      raw: event.target.value,
      nano: this.rawTonano(event.target.value),
      Mnano: this.rawToMnano(event.target.value)
    },
    function() {
      this.updateQR(this.state.activeQR)
    })
  }
  handlenanoChange(event) {
    this.setState({
      raw: this.nanoToRaw(event.target.value),
      nano: event.target.value,
      Mnano: this.nanoToMnano(event.target.value),
    },
    function() {
      this.updateQR(this.state.activeQR)
    })
  }
  handleMnanoChange(event) {
    this.setState({
      raw: this.MnanoToRaw(event.target.value),
      nano: this.MnanoTonano(event.target.value),
      Mnano: event.target.value
    },
    function() {
      this.updateQR(this.state.activeQR)
    })
  }

  render() {
    return (
      <div>
        <h1>Unit Converter</h1>
        <p>Enter a number in any field to have it converted to different Nano units.</p>
        <InputGroup className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="raw">
              raw
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="raw" aria-describedby="raw" className="amount-box" value={this.state.raw} title="Smallest possible unit" onChange={this.handleRawChange.bind(this)}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" value={this.state.raw} onClick={this.copyText.bind(this)}>Copy</Button>
            <Button variant="outline-secondary" value='raw' onClick={this.changeQR.bind(this)} className={ this.state.rawBtnActive ? "btn-active" : ""}>QR</Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="nano">
              nano
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="nano" aria-describedby="nano" className="amount-box" value={this.state.nano} title="Original main unit" onChange={this.handlenanoChange.bind(this)}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" value={this.state.nano} onClick={this.copyText.bind(this)}>Copy</Button>
            <Button variant="outline-secondary" value='nano' onClick={this.changeQR.bind(this)} className={ this.state.nanoBtnActive ? "btn-active" : ""}>QR</Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="Mnano">
              NANO
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="Mnano" aria-describedby="Mnano" className="amount-box" value={this.state.Mnano} title="Unit for wallets/exchanges" onChange={this.handleMnanoChange.bind(this)}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" value={this.state.Mnano} onClick={this.copyText.bind(this)}>Copy</Button>
            <Button variant="outline-secondary" value='Mnano' onClick={this.changeQR.bind(this)} className={ this.state.MnanoBtnActive ? "btn-active" : ""}>QR</Button>
          </InputGroup.Append>
        </InputGroup>

        <div className="QR-container">
          <QrImageStyle className="QR-img" content={this.state.qrContent} size={this.state.qrSize} />
        </div>
      </div>
    )
  }
}
export default ConvertTool
