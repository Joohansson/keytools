import React, { Component } from 'react'
import { Dropdown, DropdownButton, InputGroup, FormControl, Button} from 'react-bootstrap'
import * as helpers from '../helpers'
import MainPage from '../mainPage'
import {toast } from 'react-toastify'
import SeedWorker from '../modules/seed.worker'

class VanityTool extends Component {
  constructor(props) {
    super(props)
    this.workers = []
    this.addressesCount = 0
    this.countDiff = 0
    this.nextReport = 0

    // Address init dropdown titles
    this.inits = [
      '1 or 3',
      '1',
      '3',
    ]

    this.state = {
      initChar: '', // 1 or 3
      prefix: '',
      suffix: '',
      validPrefix: false,
      validSuffix: false,
      prepend: true,
      generating: false,
      outputArray: [],
      output: '',
      prefixMultiplier: 1, // 2 if the initChar is 1 or 3
      addressesFound: 0,
      activeInit: this.inits[0],
      activeInitId: '0', // 0=Begin address with 1 or 3, 1=begin with 1, 2=begin with 3
      workersRunning: 0,
      generateText: 'Generate',
      stats: {
        aps: 0, //speed addresses per second
        estimatedDuration: 0, //estimated time to find address
        addressesCount: 0,  //total checked addresses
      }
    }

    this.handlePrefixChange = this.handlePrefixChange.bind(this)
    this.handleSuffixChange = this.handleSuffixChange.bind(this)
    this.generate = this.generate.bind(this)
    this.postMessage = this.postMessage.bind(this)
    this.checkTerm = this.checkTerm.bind(this)
    this.reset = this.reset.bind(this)
    this.stop = this.stop.bind(this)
    this.clearText = this.clearText.bind(this)
    this.getStats = this.getStats.bind(this)
    this.selectInit = this.selectInit.bind(this)
    this.workerListener = this.workerListener.bind(this)
  }

  componentDidMount = () => {
    if (window.Worker) {
      /*
      this.worker = new SeedWorker()

      this.worker.addEventListener("message", event => {
        this.workerListener(event)
      })
      */
      var cores = helpers.getHardwareConcurrency()
      if (cores > 4) {
        cores-- //save one thread for handling the site
      }

      for (let i = 0; i < cores; i += 1) {
        let worker = new SeedWorker()
        worker.addEventListener("message", event => {
          this.workerListener(event)
        })
        this.workers.push(worker);
      }
    }
    else {
      console.log("Web workers not supported")
      toast("Web workers not supported", helpers.getToast(helpers.toastType.ERROR))
      return
    }
  }

  //Clear text from input field
  clearText(event) {
    switch(event.target.value) {
      case 'prefix':
        this.setState({
          prefix: '',
          validPrefix: false
        })
        break
      case 'suffix':
        this.setState({
          suffix: '',
          validSuffix: false
        })
        break
      default:
        break
    }
  }

  // Change active address init char
  selectInit(eventKey, event) {
    this.setState({
      activeInit: this.inits[eventKey],
      activeInitId: eventKey,
    },
    function() {
      this.initChange(eventKey)
    })
  }

  // The address init character has changed
  initChange(key) {

    var char = ''
    if (key === '1') {
      char = '1'
    }
    else if (key === '2') {
      char = '3'
    }
    else {
      this.setState({
        initChar: '',
        prefixMultiplier: 1,
      })
      return
    }

    this.setState({
      initChar: char,
      prefixMultiplier: 2,
    })
  }

  // Check if a prefix is valid (0, 2, l, v is not allowed)
  checkTerm(input) {
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
    if (!this.checkTerm(prefix)) {
      this.setState({
        prefix: prefix,
        validPrefix: false
      })
      if (prefix !== '') {
        toast("Prefix must be a-z and 0-9 but can't contain 0,2,L or V", helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
      }
      return
    }
    this.setState({
      prefix: prefix,
      validPrefix: true,
    })
  }

  handleSuffixChange(event) {
    this.suffixChange(event.target.value)
  }

  suffixChange(suffix) {
    suffix = suffix.toLowerCase()
    if (!this.checkTerm(suffix)) {
      this.setState({
        suffix: suffix,
        validSuffix: false
      })
      if (suffix !== '') {
        toast("Suffix must be a-z and 0-9 but can't contain 0,2,L or V", helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
      }
      return
    }
    this.setState({
      suffix: suffix,
      validSuffix: true,
    })
  }

  // Reset and star over
  reset() {
    this.setState({
      generating: false,
      validPrefix: false,
      output: '',
      addressesFound: 0,
      stats: {
        aps: 0,
        estimatedDuration: 0,
        addressesCount: 0,
      }
    })
    this.nextReport = 0
    this.addressesCount = 0
    this.countDiff = 0
    this.workersRunning = 0
    this.generateText = 'Generate'
  }

  // Stop the generation
  stop(){
    this.setState({
      found: true,
    })
  }

  getStats() {
    const addressesCount = this.addressesCount
    const aps = this.countDiff
    // Number of estimated attempts is 32 to the power of number of characters
    // prefixMultiplier tells if the address is forced to start at 1 or 3, ie. multiply by 2
    // 1000 means milliseconds
    const estimatedDuration = aps > 0 ? 1000 * this.state.prefixMultiplier * (Math.pow(32, (this.state.prefix.length + this.state.suffix.length)) / aps) : 0
    this.countDiff = 0 // reset
    this.setState({
      stats: {
        addressesCount: addressesCount,
        estimatedDuration: estimatedDuration,
        aps: aps,
      }
    })
  }

  // getting message from web worker
  workerListener(event) {
    let type = event.data.type
    switch(type) {
      case "match":

      let seed = event.data.payload.wallet.seed
      let secretKey = event.data.payload.wallet.secretKey
      //let publicKey = event.data.payload.wallet.publicKey
      let address = event.data.payload.wallet.address
      var output = this.state.outputArray

      // save result in array
      output.push({address: address, seed: seed, privKey: secretKey})

      this.setState({
        outputArray: output,
        output: JSON.stringify(output, null, 2),
        addressesFound: parseInt(this.state.addressesFound) + 1
      })
      break

      case "stats":
      this.addressesCount += event.data.payload.addresses
      this.countDiff += event.data.payload.addresses

      // This will be called by multiple workers, make sure it only get reported to DOM every second
      const now = Date.now()
      if (now >= this.nextReport) {
        this.nextReport = now + 1000;
        this.getStats()
      }
      break

      case "stopped":
      this.setState({
        workersRunning: this.state.workersRunning - 1
      },
      function() {
        if (this.state.workersRunning === 0) {
          toast("Successfully stopped workers", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
          this.setState({
            generateText: 'Generate'
          })
        }
      })
      break

      default:
      break
    }
  }

  postMessage(message) {
    this.workers.forEach(worker => worker.postMessage(message))
    this.setState({
      workersRunning: this.workers.length
    })
  }

  /* Start generation of addresses */
  generate() {
    if (this.state.generating) {
      toast("Stopping...", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
      // Stop the web workers
      this.postMessage({
        type: 'stop',
      })
      this.setState({
        generating: false,
        generateText: 'Stopping...'
      })
      return
    }

    if (this.state.validPrefix || this.state.validSuffix) {
      toast("Started searching for addresses...", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
      this.nextReport = 0
      this.countDiff = 0

      this.setState({
        generating: true,
        generateText: 'Stop'
      })

      // Start the web workers
      this.postMessage({
        type: 'start',
        payload: {
          initChar: this.state.initChar,
          prefix: this.state.prefix,
          suffix: this.state.suffix,
        },
      });
    }
    else {
      new MainPage().notifyInvalidFormat()
    }
  }

  render() {
    return (
      <div>
        <p>Generates Nano addresses that matches the PREFIX/SUFFIX you specify</p>
        <ul>
          <li>See this <a href="https://medium.com/nanocurrency/how-to-create-a-custom-nano-account-at-maximum-speed-cd9be0045ead">guide</a> for how to obtain higher speed.</li>
        </ul>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend className="narrow-prepend">
            <DropdownButton
              variant="light"
              className="dropdown-prepend dropdown-prepend-narrow"
              title={this.state.activeInit}
              key={this.state.activeInitId}
              id={`dropdown-basic-${this.state.activeInitId}`}>
              {this.inits.map(function(init, index){
                return <Dropdown.Item eventKey={index} key={index} onSelect={this.selectInit}>{init}</Dropdown.Item>;
              }.bind(this))}
            </DropdownButton>
          </InputGroup.Prepend>
          <FormControl id="prefix" aria-describedby="prefix" value={this.state.prefix} title="Any chars a-z and 0-9 except 0(zero), 2, L or V. Leave empty to ignore." placeholder="Match address start" maxLength="20" onChange={this.handlePrefixChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='prefix' onClick={this.clearText}></Button>
          </InputGroup.Append>

          <InputGroup.Prepend className="multi-group narrow-prepend">
            <InputGroup.Text id="suffix">
              Suffix
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="suffix" aria-describedby="suffix" value={this.state.suffix} title="Any chars a-z and 0-9 except 0(zero), 2, L or V. Leave empty to ignore." placeholder="Match address end" maxLength="20" onChange={this.handleSuffixChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='suffix' onClick={this.clearText}></Button>
          </InputGroup.Append>
        </InputGroup>

        <table className="vanity-stats">
          <tbody>
            <tr>
              <td className="vanity-number">nano_{this.state.activeInitId === '0' ? '(':''}{this.state.activeInit}{this.state.activeInitId === '0' ? ')':''}{this.state.prefix + '......' + this.state.suffix}</td>
            </tr>
          </tbody>
        </table>

        <InputGroup size="sm" className="mb-3">
          <Button variant="primary" onClick={this.generate} disabled={(!this.state.validPrefix && !this.state.validSuffix) || (!this.state.generating && this.state.workersRunning !== 0)}>{this.state.generateText}</Button>
          <Button variant="primary" onClick={this.reset} disabled={this.state.generating}>Reset</Button>
        </InputGroup>

        <table className="vanity-stats">
          <tbody>
            <tr>
              <td>Speed [checks/s]</td>
              <td className="vanity-number">{this.state.stats.aps}</td>
            </tr>
            <tr>
              <td>Addresses Checked</td>
              <td className="vanity-number">{this.state.stats.addressesCount}</td>
            </tr>
            <tr>
              <td>Estimated time per address</td>
              <td className="vanity-number">{helpers.formatDurationEstimation(this.state.stats.estimatedDuration)}</td>
            </tr>
            <tr>
              <td>Addresses Found</td>
              <td className="vanity-number">{this.state.addressesFound}</td>
            </tr>
          </tbody>
        </table>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend className="narrow-prepend">
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
