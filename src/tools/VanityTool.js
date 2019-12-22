import React, { Component } from 'react'
import * as nano from 'nanocurrency'
import { InputGroup, FormControl, Button} from 'react-bootstrap'
import * as helpers from '../helpers'
import MainPage from '../mainPage'
import {toast } from 'react-toastify'


class VanityTool extends Component {
  constructor(props) {
    super(props)

    this.state = {
      prefix: '',
      privKeyChecked: false,
      validPrefix: false,
      prepend: true,
      generating: false,
      found: false,
      output: '',
    }

    this.handlePrefixChange = this.handlePrefixChange.bind(this)
    this.handlePrivKeyCheck = this.handlePrivKeyCheck.bind(this)
    this.generate = this.generate.bind(this)
    this.matchedPrefix = this.matchedPrefix.bind(this)
    this.checkPrefix = this.checkPrefix.bind(this)
    this.reset = this.reset.bind(this)
    this.stop = this.stop.bind(this)
    this.clearText = this.clearText.bind(this)
  }

  componentDidMount = () => {
    //this.worker = new Worker();
  };

  //Clear text from input field
  clearText(event) {
    switch(event.target.value) {
      case 'prefix':
        this.setState({
          prefix: '',
          validPrefix: false
        },
        function() {
          this.updateQR()
        })
        break
      default:
        break
    }
  }

  // Check if a prefix is valid (0, 2, l, v is not allowed)
  checkPrefix(input) {
    if (/^[a-z0-9]+$/i.test(input) && !(/[02lv]/i.test(input))) {
      return true
    }
    return false
  }

  handlePrefixChange(event) {
    this.prefixChange(event.target.value)
  }

  prefixChange(prefix) {
    prefix = prefix.toLowerCase()
    if (!this.checkPrefix(prefix)) {
      this.setState({
        prefix: prefix,
        validPrefix: false
      })
      if (prefix !== '') {
        toast("Prefix can only be a-z and 0-9 but can't contain 0,2,L or V", helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
      }
      return
    }
    this.setState({
      prefix: prefix,
      validPrefix: true,
    })
  }

  handlePrivKeyCheck(event) {
    this.setState({
      privKeyChecked: event.target.checked
    })
  }

  // Check if address (without nano_) matches the prefix
  matchedPrefix(address) {
    if (address.substr(6).startsWith(this.state.prefix)) {
      return true
    }
    return false
  }

  // Reset and star over
  reset() {
    this.setState({
      generating: false,
      found: false,
      validPrefix: false,
      output: '',
    })
  }

  // Stop the generation
  stop(){
    this.setState({
      found: true,
    })
  }

  fetchWebWorker = () => {
    this.worker.postMessage("Seed");

    this.worker.addEventListener("message", event => {
      console.log(event.data)
    });
  };

  /* Start generation of addresses */
  async generate() {
    if (this.state.generating) {
      this.setState({
        generating: false,
        found: true,
      })
      return
    }

    if (this.state.validPrefix) {
      this.setState({
        generating: true,
        found: false,
      },
      function() {
        var output = this.state.output
        var i = 0
        const start = Date.now()
        this.fetchWebWorker()
        /*
        while (!this.state.found) {
          i++
          const seed = await nano.generateSeed()
          const privKey = nano.deriveSecretKey(seed, 0)
          const pubKey = nano.derivePublicKey(privKey)
          const address = nano.deriveAddress(pubKey, {useNanoPrefix: true})

          if (this.matchedPrefix(address)) {
            // save result in array
            if (this.state.privKeyChecked) {
              output = output + address + ',' + seed + ',' + privKey + '\r'
            }

            else {
              output = output + address + ',' + seed + '\r'
            }

            //stop the loop
            this.setState ({
              found: true
            })
          }
        }
        this.setState({
          output: output,
        })
        const calcTime = (Date.now() - start) / 1000
        toast("Found vanity address at " + i/calcTime + " guesses/s", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
        */
      })
    }
    else {
      new MainPage().notifyInvalidFormat()
    }

    this.setState({
      generating: false,
      found: false,
    })
  }

  render() {
    return (
      <div>
        <p>Generates Nano addresses that matches the prefix you specify</p>
        <ul>
          <li>Output format is ADDRESS, SEED, PRIVATE KEY</li>
          <li>Not recommended running more than 6 chars. See this <a href="https://medium.com/nanocurrency/how-to-create-a-custom-nano-account-at-maximum-speed-cd9be0045ead">guide</a> for how to obtain higher speed.</li>
        </ul>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="prefix">
              Prefix
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="prefix" aria-describedby="prefix" value={this.state.prefix} title="Any chars a-z and 0-9 except 0(zero), 2, L or V" placeholder="" maxLength="20" onChange={this.handlePrefixChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='prefix' onClick={this.clearText}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <div className="form-check form-check-inline index-checkbox">
            <input className="form-check-input" type="checkbox" id="privKey-check" value="privKey" checked={this.state.privKeyChecked} onChange={this.handlePrivKeyCheck}/>
            <label className="form-check-label" htmlFor="privKey-check">Include Private Key</label>
          </div>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <Button variant="primary" onClick={this.generate} disabled={!this.state.validPrefix}>{this.state.generating ? 'Stop':'Generate'}</Button>
          <Button variant="primary" onClick={this.reset} disabled={this.state.generating}>Reset</Button>
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
export default VanityTool
