import React, { Component } from 'react'
import * as nano from 'nanocurrency'
import { InputGroup, FormControl, Button} from 'react-bootstrap'
import * as helpers from '../helpers'
import $ from 'jquery'
import {toast } from 'react-toastify'
import QrImageStyle from './components/qrImageStyle'
const toolParam = 'pay'

class PaymentTool extends Component {
  constructor(props) {
    super(props)

    this.inputToast = null //disallow duplicates

    this.state = {
      address: '',
      amount: '',
      validAddress: false,
      validAmount: false,
      qrContent: '',
      qrSize: 512,
      qrState: 0,  //qr size
    }

    this.handleAddressChange = this.handleAddressChange.bind(this)
    this.handleAmountChange = this.handleAmountChange.bind(this)
    this.clearText = this.clearText.bind(this)
    this.sample = this.sample.bind(this)
    this.updateQR = this.updateQR.bind(this)
    this.double = this.double.bind(this)
    this.setParams = this.setParams.bind(this)
  }

  componentDidMount = () => {
    // Read URL params from parent and construct new quick path
    var address = this.props.state.address
    var amount = this.props.state.amount

    if (address) {
      this.addressChange(address)
    }
    if (amount) {
      this.amountChange(amount)
    }

    if (!address && !amount) {
      this.setParams()
    }
  }

  // Defines the url params
  setParams() {
    helpers.setURLParams('?tool='+toolParam + '&address=' + this.state.address + '&amount=' + this.state.amount)
  }

  //Clear text from input field
  clearText(event) {
    switch(event.target.value) {
      case 'address':
        this.setState({
          address: '',
          validAddress: false
        },
        function() {
          this.updateQR()
          this.setParams()
        })
        break
      case 'amount':
        this.setState({
          amount: '',
          validAmount: false
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

  // Loop qr state 1x, 2x, 4x
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

  handleAddressChange(event) {
    this.addressChange(event.target.value)
  }

  addressChange(address) {
    if (!nano.checkAddress(address)) {
      if (address !== '') {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid Nano address", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      this.setState({
        address: address,
        validAddress: false
      })
      return
    }
    this.setState({
      address: address,
      validAddress: true
    },
    function() {
      this.updateQR()
      this.setParams()
    })
  }

  handleAmountChange(event) {
    this.amountChange(event.target.value)
  }

  amountChange(amount) {
    let raw = helpers.MnanoToRaw(amount)
    // allow no amount
    if (!nano.checkAmount(raw) && amount !== '') {
      if (! toast.isActive(this.inputToast)) {
        this.inputToast = toast("Invalid Nano amount", helpers.getToast(helpers.toastType.ERROR_AUTO))
      }
      this.setState({
        amount: amount,
        validAmount: false
      })
      return
    }
    this.setState({
      amount: amount,
      validAmount: true,
    },
    function() {
      if (this.state.validAddress) {
        this.updateQR()
      }
      this.setParams()
    })
  }

  updateQR() {
    let address = this.state.address
    let amount = this.state.amount
    var raw = ''
    var url = ''

    // allow both address and amount, or only address
    if (address !== '' && amount !== '') {
      raw = helpers.MnanoToRaw(this.state.amount)
      url = 'nano:' + this.state.address + '?amount=' + raw
    }
    else if (address !== ''){
      url = 'nano:' + address
    }
    else {
      url = '#'
    }

    var qr
    if (url === '#') {
      qr = ''
    }
    else {
      qr = url
    }

    this.setState({
      qrContent: qr
    })

    // update wallet button
    $('#wallet-btn').attr("href", url)
  }

  sample() {
    this.setState({
      address: helpers.constants.SAMPLE_PAYMENT_ADDRESS,
      validAddress: true,
      amount: '0.1',
      validAmount: true,
    },
    function() {
      this.updateQR()
      this.setParams()
    })
  }

  print() {
    window.print()
  }

  render() {
    return (
      <div>
        <div className="noprint">
          <p>Generate and Share a Payment Card or Pay it now</p>
          <ul>
            <li>Scan QR with a wallet. The amount is included</li>
            <li>Open in Wallet may work depending on wallet installed</li>
            <li>The URL path above can be shared with anyone</li>
            <li>Right click and save QR image to embed on any site or print it</li>
          </ul>
        </div>
        <div className="noprint">
          <InputGroup size="sm" className="mb-3">
            <InputGroup.Prepend>
              <InputGroup.Text id="account">
                Address
              </InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl id="account" aria-describedby="account" value={this.state.address} title="Payment address. xrb_ or nano_ prefix." placeholder="nano_xxx... or xrb_xxx..." maxLength="65" onChange={this.handleAddressChange} autocomplete="off"/>
            <InputGroup.Append>
              <Button variant="outline-secondary" className="fas fa-times-circle" value='address' onClick={this.clearText}></Button>
              <Button variant="outline-secondary" className="fas fa-copy" value={this.state.address} onClick={helpers.copyText}></Button>
            </InputGroup.Append>
          </InputGroup>

          <InputGroup size="sm" className="mb-3">
            <InputGroup.Prepend>
              <InputGroup.Text id="amount">
                NANO
              </InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl id="amount" aria-describedby="amount" value={this.state.amount} title="Payment amount in NANO" maxLength="32" onChange={this.handleAmountChange} autocomplete="off"/>
            <InputGroup.Append>
              <Button variant="outline-secondary" className="fas fa-times-circle" value='amount' onClick={this.clearText}></Button>
              <Button variant="outline-secondary" className="fas fa-copy" value={this.state.amount} onClick={helpers.copyText}></Button>
            </InputGroup.Append>
          </InputGroup>

          <Button variant="primary" onClick={this.sample}>Sample</Button>
          <a className="btn btn-primary" id="wallet-btn" href="https://keytools.nanos.cc" role="button">Open in Wallet</a>
          <Button variant="primary" onClick={this.print}>Print QR</Button>
        </div>

        <div className={ this.state.qrHidden ? "hidden" : ""}>
          <div className={helpers.qrClassesContainer[this.state.qrState]}>
            <QrImageStyle className={helpers.qrClassesImg[this.state.qrState]} content={this.state.qrContent} onClick={this.double} title="Click to toggle size" size={this.state.qrSize} />
          </div>
        </div>
      </div>
    )
  }
}
export default PaymentTool
