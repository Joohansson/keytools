import React, { Component } from 'react'
import { InputGroup, FormControl, Button} from 'react-bootstrap'
import QrImageStyle from '../modules/qrImageStyle'
import * as helpers from '../helpers'
import {toast } from 'react-toastify'
import * as nano from 'nanocurrency'
import Calculator from '../modules/calculator/frame.jsx'

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
      qrState: 0,  //qr size
      rawBtnActive: false,
      nanoBtnActive: false,
      MnanoBtnActive: false,
      qrHidden: true,
    }

    this.handleRawChange = this.handleRawChange.bind(this)
    this.handlenanoChange = this.handlenanoChange.bind(this)
    this.handleMnanoChange = this.handleMnanoChange.bind(this)
    this.updateQR = this.updateQR.bind(this)
    this.clearText = this.clearText.bind(this)
    this.double = this.double.bind(this)
  }

  //Clear text from input field
  clearText(event) {
    this.setState({
      raw: '',
      nano: '',
      Mnano: ''
    },
    function() {
      this.updateQR()
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
      case 'raw':
        this.setState({
          qrContent: this.state.raw,
        })
        break
      case 'nano':
        this.setState({
          qrContent: this.state.nano,
        })
        break
      case 'Mnano':
        this.setState({
          qrContent: this.state.Mnano,
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

  handleRawChange(event) {
    let raw = event.target.value
    if (raw !== '' && !nano.checkAmount(raw)) {
      toast("Not a valid Nano amount", helpers.getToast(helpers.toastType.ERROR_AUTO))
    }
    this.setState({
      raw: raw,
      nano: helpers.rawTonano(event.target.value),
      Mnano: helpers.rawToMnano(event.target.value)
    },
    function() {
      this.updateQR()
    })
  }
  handlenanoChange(event) {
    let raw = helpers.nanoToRaw(event.target.value)
    if (raw !== '' && !nano.checkAmount(raw)) {
      toast("Not a valid Nano amount", helpers.getToast(helpers.toastType.ERROR_AUTO))
    }
    this.setState({
      raw: raw,
      nano: event.target.value,
      Mnano: helpers.nanoToMnano(event.target.value),
    },
    function() {
      this.updateQR()
    })
  }
  handleMnanoChange(event) {
    let raw = helpers.MnanoToRaw(event.target.value)
    if (raw !== '' && !nano.checkAmount(raw)) {
      toast("Not a valid Nano amount", helpers.getToast(helpers.toastType.ERROR_AUTO))
    }
    this.setState({
      raw: raw,
      nano: helpers.MnanoTonano(event.target.value),
      Mnano: event.target.value
    },
    function() {
      this.updateQR()
    })
  }

  render() {
    return (
      <div>
        <p>Convert between Nano units</p>
        <ul>
          <li>raw is the smallest possible unit | NANO is used in wallets and exchanges</li>
          <li>1 nano = 10^24 raw | 1 NANO = 10^30 raw</li>
        </ul>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="raw">
              raw
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="raw" aria-describedby="raw" value={this.state.raw} title="Smallest possible unit" maxLength="48" onChange={this.handleRawChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='raw' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.raw} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'raw' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='raw' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="nano">
              nano
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="nano" aria-describedby="nano" value={this.state.nano} title="Original main unit" maxLength="26" onChange={this.handlenanoChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='nano' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.nano} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'nano' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='nano' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="Mnano">
              NANO
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="Mnano" aria-describedby="Mnano" value={this.state.Mnano} title="Unit for wallets/exchanges" maxLength="32"  onChange={this.handleMnanoChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='Mnano' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.Mnano} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'Mnano' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='Mnano' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <p>Calculator</p>
        <Calculator/>

        <div className={ this.state.qrHidden ? "hidden" : ""}>
          <div className={helpers.qrClassesContainer[this.state.qrState]}>
            <QrImageStyle className={helpers.qrClassesImg[this.state.qrState]} content={this.state.qrContent} onClick={this.double} title="Click to toggle size" size={this.state.qrSize} />
          </div>
        </div>
      </div>
    )
  }
}
export default ConvertTool
