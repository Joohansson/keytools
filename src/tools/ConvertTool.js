import React, { Component } from 'react'
import { InputGroup, FormControl, Button} from 'react-bootstrap'
import * as helpers from '../helpers'
import {toast } from 'react-toastify'
import * as nano from 'nanocurrency'
import Calculator from './components/calculator/frame.jsx'
import QrImageStyle from './components/qrImageStyle'
const toolParam = 'convert'

class ConvertTool extends Component {
  constructor(props) {
    super(props)

    this.inputToast = null //disallow duplicates

    this.state = {
      raw: '1000000000000000000000000000000',
      Mnano: '1',
      qrContent: '1',
      qrSize: 512,
      activeQR: '',
      qrState: 0,  //qr size
      qrHidden: true,
    }

    this.handleRawChange = this.handleRawChange.bind(this)
    this.handleMnanoChange = this.handleMnanoChange.bind(this)
    this.updateQR = this.updateQR.bind(this)
    this.clearText = this.clearText.bind(this)
    this.double = this.double.bind(this)
    this.setParams = this.setParams.bind(this)
  }

  componentDidMount = () => {
    // Read URL params from parent and construct new quick path
    var raw = this.props.state.raw
    var nano = this.props.state.nano

    if (raw) {
      this.rawChange(raw)
    }
    else if (nano) {

      this.MnanoChange(nano)
    }
    else {
      this.setParams()
    }
  }

  // Defines the url params
  setParams(type) {
    switch (type) {
      case 'raw':
      helpers.setURLParams('?tool='+toolParam + '&raw=' + this.state.raw)
      break

      case 'nano':
      helpers.setURLParams('?tool='+toolParam + '&nano=' + this.state.Mnano)
      break

      default:
      helpers.setURLParams('?tool='+toolParam + '&nano=' + this.state.Mnano)
      break
    }
  }

  //Clear text from input field
  clearText(event) {
    this.setState({
      raw: '',
      Mnano: ''
    },
    function() {
      this.updateQR()
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
    this.rawChange(event.target.value)
  }
  rawChange(val) {
    if (!nano.checkAmount(val)) {
      if (val !== '' && val.slice(-1) !== '.') {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid amount", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      else {
        helpers.setURLParams('?tool='+toolParam + '&nano=')
      }
      this.setState({
        raw: val,
        Mnano: ''
      })
      return
    }
    this.setState({
      raw: val,
      Mnano: helpers.rawToMnano(val)
    },
    function() {
      this.updateQR()
      this.setParams('raw')
    })
  }

  handleMnanoChange(event) {
    this.MnanoChange(event.target.value)
  }
  MnanoChange(val) {
    let raw = helpers.MnanoToRaw(val)
    if (!nano.checkAmount(raw)) {
      if (val !== '' && val.slice(-1) !== '.') {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid amount", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      else {
        helpers.setURLParams('?tool='+toolParam + '&nano=')
      }
      this.setState({
        raw: '',
        Mnano: val
      })
      return
    }
    this.setState({
      raw: raw,
      Mnano: val
    },
    function() {
      this.updateQR()
      this.setParams('nano')
    })
  }

  render() {
    return (
      <div>
        <p>Convert between Nano units</p>
        <ul>
          <li>raw is the smallest possible unit</li>
          <li>Nano (previous Mnano) is used in wallets and exchanges</li>
          <li>1 Nano = 10^30 raw</li>
        </ul>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="raw">
              raw
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="raw" aria-describedby="raw" value={this.state.raw} title="Smallest possible unit" maxLength="39" onChange={this.handleRawChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='raw' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.raw} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'raw' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='raw' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="Mnano">
              Nano
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="Mnano" aria-describedby="Mnano" value={this.state.Mnano} title="Unit for wallets/exchanges" maxLength="32"  onChange={this.handleMnanoChange} autoComplete="off"/>
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
