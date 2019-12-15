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
      privKeyChecked: false,
      addressChecked: false,
      output: ''
    }

    this.setMax = this.setMax.bind(this)
    this.handleCountChange = this.handleCountChange.bind(this)
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

  handleAddressCheck(event) {
    this.setState({
      addressChecked: event.target.checked
    })
  }

  /* Start generation of key pairs */
  async generate() {
    this.setState({
      generating: true
    })

    var i
    var output = ''
    if (this.state.validCount) {
      for (i=0; i < parseInt(this.state.count); i++) {
        var seed = await nano.generateSeed()
        seed = seed.toUpperCase()
        let privKey = nano.deriveSecretKey(seed, i)
        let pubKey = nano.derivePublicKey(privKey)
        let address = nano.deriveAddress(pubKey, {useNanoPrefix: true})

        // save result in array
        if (this.state.privKeyChecked && this.state.addressChecked) {
          output = output + seed + ',' + privKey + ',' + address + '\r'
        }
        else if (this.state.privKeyChecked && !this.state.addressChecked ) {
          output = output + seed + ',' + privKey + '\r'
        }
        else if (!this.state.privKeyChecked && this.state.addressChecked) {
          output = output + seed + ',' + address + '\r'
        }
        else {
          output = output + seed + '\r'
        }

      }
      this.setState({
        output: output
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
        <p>Mass generate secure key pairs using seed index 0</p>
        <ul>
          <li>Output format is SEED, PRIVKEY, ADDRESS</li>
        </ul>

        <InputGroup size="sm" className="mb-3 count-input">
          <InputGroup.Prepend>
            <InputGroup.Text id="raw">
              Pair Count
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="count" aria-describedby="count" value={this.state.count} title="Number of key pairs to generate." onChange={this.handleCountChange.bind(this)}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="max-btn" onClick={this.setMax}>Max</Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <div className="form-check form-check-inline index-checkbox">
            <input className="form-check-input" type="checkbox" id="privKey-check" value="privKey" checked={this.state.privKeyChecked} onChange={this.handlePrivKeyCheck.bind(this)}/>
            <label className="form-check-label" htmlFor="privKey-check">Include Private Key</label>
          </div>
          <div className="form-check form-check-inline index-checkbox">
            <input className="form-check-input" type="checkbox" id="address-check" value="address" checked={this.state.addressChecked} onChange={this.handleAddressCheck.bind(this)}/>
            <label className="form-check-label" htmlFor="address-check">Include Address</label>
          </div>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <Button variant="primary" onClick={this.generate} disabled={this.state.generating}>Generate</Button>
          <Button variant="primary" onClick={helpers.copyOutput} disabled={this.state.generating}>Copy Output</Button>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="output">
              Output
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="output-area" aria-describedby="output" as="textarea" rows="6" placeholder="" value={this.state.output} readOnly/>
        </InputGroup>
      </div>
    )
  }
}
export default KeyGeneratorTool
