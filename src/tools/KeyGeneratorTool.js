import React, { Component } from 'react'
import * as nano from 'nanocurrency'
import * as nano_old from 'nanocurrency174' //must be used for high performance with derivePublicKey, including nano_old.init()
import { InputGroup, FormControl, Button} from 'react-bootstrap'
import * as helpers from '../helpers'
import {toast } from 'react-toastify'
const toolParam = 'keygen'

class KeyGeneratorTool extends Component {
  constructor(props) {
    super(props)

    this.inputToast = null //disallow duplicates

    this.state = {
      count: '10',
      generating: false,
      validCount: true,
      walletNoChecked: true,
      privKeyChecked: true,
      addressChecked: true,
      pubKeyChecked: true,
      output: '',
    }

    this.setMax = this.setMax.bind(this)
    this.handleCountChange = this.handleCountChange.bind(this)
    this.handleWalletNoCheck = this.handleWalletNoCheck.bind(this)
    this.handlePrivKeyCheck = this.handlePrivKeyCheck.bind(this)
    this.handlePubKeyCheck = this.handlePubKeyCheck.bind(this)
    this.handleAddressCheck = this.handleAddressCheck.bind(this)
    this.generate = this.generate.bind(this)
  }

  componentDidMount() {
    // Read URL params from parent and construct new quick path
    var count = this.props.state.count
    var priv = this.props.state.priv
    var pub = this.props.state.pub
    var addr = this.props.state.addr
    if (count) {
      this.countChange(count)
    }
    if (typeof priv !== 'undefined') {
      this.setState({
        privKeyChecked: (priv === 'true')
      })
    }
    if (typeof pub !== 'undefined') {
      this.setState({
        pubKeyChecked: (pub === 'true')
      })
    }
    if (typeof addr !== 'undefined') {
      this.setState({
        addressChecked: (addr === 'true')
      })
    }
    if(!count && !priv && !pub && !addr) {
      this.setParams()
    }
  }

  // Defines the url params
  setParams() {
    helpers.setURLParams('?tool='+toolParam + '&count='+this.state.count + '&priv='+this.state.privKeyChecked + '&pub='+this.state.pubKeyChecked + '&addr='+this.state.addressChecked)
  }

  setMax() {
    this.setState({
      count: helpers.constants.KEYS_MAX
    },function() {
      this.setParams()
    })
  }

  handleCountChange(event) {
    this.countChange(event.target.value)
  }

  countChange(count) {
    if (count > helpers.constants.KEYS_MAX) {
      count = helpers.constants.KEYS_MAX
    }
    this.setState({
      count: count
    },
    function() {
      if (!helpers.isNumeric(count)) {
        this.setState({
          validCount: false
        })
        if (count !== '') {
          if (! toast.isActive(this.inputToast)) {
            this.inputToast = toast("Not a valid count", helpers.getToast(helpers.toastType.ERROR_AUTO))
          }
        }
      }
      else {
        this.setParams()
        this.setState({
          validCount: true
        })
      }
    })
  }

  handleWalletNoCheck(event) {
    this.setState({
      walletNoChecked: event.target.checked
    },
    function() {
      this.setParams()
    })
  }

  handlePrivKeyCheck(event) {
    this.setState({
      privKeyChecked: event.target.checked
    },
    function() {
      this.setParams()
    })
  }

  handlePubKeyCheck(event) {
    this.setState({
      pubKeyChecked: event.target.checked
    },
    function() {
      this.setParams()
    })
  }

  handleAddressCheck(event) {
    this.setState({
      addressChecked: event.target.checked
    },
    function() {
      this.setParams()
    })
  }

  /* Start generation of keypairs */
  async generate() {
    this.setState({
      generating: true
    })

    var i
    var output = []
    if (this.state.validCount) {
      await nano_old.init()
      for (i=0; i < parseInt(this.state.count); i++) {
        var seed = helpers.genSecureKey()
        seed = seed.toUpperCase()
        let privKey = nano_old.deriveSecretKey(seed, i)
        let pubKey = nano_old.derivePublicKey(privKey)
        let address = nano.deriveAddress(pubKey, {useNanoPrefix: true})

        // save result in array
        var obj = {}

        if (this.state.walletNoChecked) {
          obj.wallet = i+1
        }
        obj.seed = seed
        if (this.state.privKeyChecked) {
          obj.privKey = privKey
        }
        if (this.state.pubKeyChecked) {
          obj.pubKey = pubKey
        }
        if (this.state.addressChecked) {
          obj.address = address
        }

        output.push(obj)

      }
      this.setState({
        output: JSON.stringify(output, null, 2)
      })
    }
    else {
      if (! toast.isActive(this.inputToast)) {
        this.inputToast = toast("Not a valid count", helpers.getToast(helpers.toastType.ERROR_AUTO))
      }
    }

    this.setState({
      generating: false
    })
  }

  render() {
    return (
      <div>
        <p>Mass generate wallets using seed index 0</p>

        <InputGroup size="sm" className="mb-3 count-input">
          <InputGroup.Prepend className="narrow-prepend-2">
            <InputGroup.Text id="count">
              Pair Count
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="count" aria-describedby="count" value={this.state.count} title="Number of keypairs to generate." maxLength="5" onChange={this.handleCountChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="max-btn" onClick={this.setMax}>Max</Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <div className="form-check form-check-inline index-checkbox">
            <input className="form-check-input" type="checkbox" id="walletNo-check" value="walletNo" checked={this.state.walletNoChecked} onChange={this.handleWalletNoCheck}/>
            <label className="form-check-label" htmlFor="walletNo-check">Wallet No.</label>
          </div>
          <div className="form-check form-check-inline index-checkbox">
            <input className="form-check-input" type="checkbox" id="privKey-check" value="privKey" checked={this.state.privKeyChecked} onChange={this.handlePrivKeyCheck}/>
            <label className="form-check-label" htmlFor="privKey-check">Private Key</label>
          </div>
          <div className="form-check form-check-inline index-checkbox">
            <input className="form-check-input" type="checkbox" id="pubKey-check" value="pubKey" checked={this.state.pubKeyChecked} onChange={this.handlePubKeyCheck}/>
            <label className="form-check-label" htmlFor="pubKey-check">Public Key</label>
          </div>
          <div className="form-check form-check-inline index-checkbox">
            <input className="form-check-input" type="checkbox" id="address-check" value="address" checked={this.state.addressChecked} onChange={this.handleAddressCheck}/>
            <label className="form-check-label" htmlFor="address-check">Address</label>
          </div>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <Button variant="primary" onClick={this.generate} disabled={this.state.generating}>Generate</Button>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend className="narrow-prepend-2">
            <InputGroup.Text id="output">
              JSON
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="output-area" aria-describedby="output" as="textarea" rows="6" placeholder="" value={this.state.output} readOnly/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-copy" onClick={helpers.copyOutput}></Button>
          </InputGroup.Append>
        </InputGroup>
      </div>
    )
  }
}
export default KeyGeneratorTool
