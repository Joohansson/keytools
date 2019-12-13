import React, { Component } from 'react'
import * as nano from 'nanocurrency'
import { InputGroup, FormControl, Button} from 'react-bootstrap'
import QrImageStyle from '../modules/qrImageStyle'
import * as helpers from '../helpers'

class ConvertTool extends Component {
  constructor(props) {
    super(props)

    this.state = {
      raw: '1000000000000000000000000000000',
      nano: '1000000',
      Mnano: '1',
      qrContent: '1',
      qrSize: 512,
      activeQR: '',
      rawBtnActive: false,
      nanoBtnActive: false,
      MnanoBtnActive: false,
      qrHidden: true,
    }

    this.handleRawChange = this.handleRawChange.bind(this)
    this.handlenanoChange = this.handlenanoChange.bind(this)
    this.handleMnanoChange = this.handleMnanoChange.bind(this)
    this.updateQR = this.updateQR.bind(this)
  }

  //Clear text from input field
  clearText(event) {
    this.setState({
      raw: '',
      nano: '',
      Mnano: ''
    })
  }

  // Any QR button is pressed. Handle active button.
  changeQR(event) {
    // already selected, deselect
    if (this.state.activeQR === event.target.value) {
      this.setState({
        activeQR: '',
        qrHidden: false
      })
      this.updateQR('')
    }
    else {
      this.setState({
        activeQR: event.target.value,
        qrHidden: false
      })
      this.updateQR(event.target.value)
    }
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
        this.setState({
          qrContent: '',
          qrHidden: true,
          rawBtnActive: false,
          nanoBtnActive: false,
          MnanoBtnActive: false,
        })
        break
    }
  }

  rawTonano(input) {
    return helpers.isNumeric(input) ? nano.convert(input, {from: nano.Unit.raw, to: nano.Unit.nano}) : 'N/A'
  }

  rawToMnano(input) {
    return helpers.isNumeric(input) ? nano.convert(input, {from: nano.Unit.raw, to: nano.Unit.NANO}) : 'N/A'
  }

  nanoToRaw(input) {
    return helpers.isNumeric(input) ? nano.convert(input, {from: nano.Unit.nano, to: nano.Unit.raw}) : 'N/A'
  }

  nanoToMnano(input) {
    return helpers.isNumeric(input) ? nano.convert(input, {from: nano.Unit.nano, to: nano.Unit.NANO}) : 'N/A'
  }

  MnanoToRaw(input) {
    return helpers.isNumeric(input) ? nano.convert(input, {from: nano.Unit.NANO, to: nano.Unit.raw}) : 'N/A'
  }

  MnanoTonano(input) {
    return helpers.isNumeric(input) ? nano.convert(input, {from: nano.Unit.NANO, to: nano.Unit.nano}) : 'N/A'
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
        <p>Convert between Nano units</p>
        <ul>
          <li>NANO is used in wallets and exchanges and raw is the smallest possible unit</li>
        </ul>
        
        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="raw">
              raw
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="raw" aria-describedby="raw" value={this.state.raw} title="Smallest possible unit" onChange={this.handleRawChange.bind(this)}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='raw' onClick={this.clearText.bind(this)}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.raw} onClick={helpers.copyText.bind(this)}></Button>
            <Button variant="outline-secondary" className={ this.state.rawBtnActive ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='raw' onClick={this.changeQR.bind(this)}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="nano">
              nano
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="nano" aria-describedby="nano" value={this.state.nano} title="Original main unit" onChange={this.handlenanoChange.bind(this)}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='nano' onClick={this.clearText.bind(this)}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.nano} onClick={helpers.copyText.bind(this)}></Button>
            <Button variant="outline-secondary" className={ this.state.nanoBtnActive ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='nano' onClick={this.changeQR.bind(this)}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="Mnano">
              NANO
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="Mnano" aria-describedby="Mnano" value={this.state.Mnano} title="Unit for wallets/exchanges" onChange={this.handleMnanoChange.bind(this)}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='Mnano' onClick={this.clearText.bind(this)}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.Mnano} onClick={helpers.copyText.bind(this)}></Button>
            <Button variant="outline-secondary" className={ this.state.MnanoBtnActive ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='Mnano' onClick={this.changeQR.bind(this)}></Button>
          </InputGroup.Append>
        </InputGroup>

        <div className={ this.state.qrHidden ? "hidden" : "QR-container"}>
          <QrImageStyle className="QR-img" content={this.state.qrContent} size={this.state.qrSize} />
        </div>
      </div>
    )
  }
}
export default ConvertTool
