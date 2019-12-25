import React, { Component } from 'react'
import * as nano from 'nanocurrency'
import { InputGroup, FormControl, Button} from 'react-bootstrap'
import * as helpers from '../helpers'
import MainPage from '../mainPage'

class KeyGeneratorTool extends Component {
  constructor(props) {
    super(props)

    this.state = {
      count: '10',
      generating: false,
      validCount: true,
      privKeyChecked: true,
      addressChecked: true,
      pubKeyChecked: true,
      output: '',
    }

    this.setMax = this.setMax.bind(this)
    this.handleCountChange = this.handleCountChange.bind(this)
    this.handlePrivKeyCheck = this.handlePrivKeyCheck.bind(this)
    this.handlePubKeyCheck = this.handlePubKeyCheck.bind(this)
    this.handleAddressCheck = this.handleAddressCheck.bind(this)
    this.generate = this.generate.bind(this)
  }

  setMax() {
    this.setState({
      count: helpers.constants.KEYS_MAX
    })
  }

  handleCountChange(event) {
    let count = event.target.value
    this.setState({
      count: count
    },
    function() {
      if (!helpers.isNumeric(count) || count > helpers.constants.KEYS_MAX) {
        this.setState({
          validCount: false
        })
        if (count !== '') {
          new MainPage().notifyInvalidFormat()
        }
      }
      else {
        this.setState({
          validCount: true
        })
      }
    })
  }

  handlePrivKeyCheck(event) {
    this.setState({
      privKeyChecked: event.target.checked
    })
  }

  handlePubKeyCheck(event) {
    this.setState({
      pubKeyChecked: event.target.checked
    })
  }

  handleAddressCheck(event) {
    this.setState({
      addressChecked: event.target.checked
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
      for (i=0; i < parseInt(this.state.count); i++) {
        var seed = await nano.generateSeed()
        seed = seed.toUpperCase()
        let privKey = nano.deriveSecretKey(seed, i)
        let pubKey = nano.derivePublicKey(privKey)
        let address = nano.deriveAddress(pubKey, {useNanoPrefix: true})

        // save result in array
        var obj = {seed: seed}

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
      new MainPage().notifyInvalidFormat()
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
          <InputGroup.Prepend>
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
          <InputGroup.Prepend>
            <InputGroup.Text id="output">
              Output
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="output-area" aria-describedby="output" as="textarea" rows="6" placeholder="" value={this.state.output} readOnly/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.output} onClick={helpers.copyText}></Button>
          </InputGroup.Append>
        </InputGroup>
      </div>
    )
  }
}
export default KeyGeneratorTool
