import React, { Component } from 'react'
import { Dropdown, DropdownButton, InputGroup, FormControl, Button} from 'react-bootstrap'
import * as helpers from '../helpers'
import {toast } from 'react-toastify'
import SeedWorker from '../modules/seed.worker'
const toolParam = 'vanity'

class VanityTool extends Component {
  constructor(props) {
    super(props)

    this.inputToast = null //disallow duplicates

    this.workers = []
    this.addressesCount = 0
    this.countDiff = 0
    this.nextReport = 0
    this.stopped = false
    this.maxThreads = 0 //m ax allowed threads: logical cores minus 1
    this.threads = 0
    this.cpuPower = [0.25, 0.5, 0.75, 1]

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
      maxWallets: 100,
      validMaxWallets: true,
      selectedOption: '3',
      stats: {
        aps: 0, //speed addresses per second
        estimatedDuration: 0, //estimated time to find address
        addressesCount: 0,  //total checked addresses
      }
    }

    this.handlePrefixChange = this.handlePrefixChange.bind(this)
    this.handleSuffixChange = this.handleSuffixChange.bind(this)
    this.handleMaxWalletsChange = this.handleMaxWalletsChange.bind(this)
    this.generate = this.generate.bind(this)
    this.postMessage = this.postMessage.bind(this)
    this.checkTerm = this.checkTerm.bind(this)
    this.reset = this.reset.bind(this)
    this.stop = this.stop.bind(this)
    this.clearText = this.clearText.bind(this)
    this.getStats = this.getStats.bind(this)
    this.selectInit = this.selectInit.bind(this)
    this.workerListener = this.workerListener.bind(this)
    this.setMax = this.setMax.bind(this)
    this.handleOptionChange = this.handleOptionChange.bind(this)
  }

  componentDidMount = () => {
    if (window.Worker) {
      var threads = helpers.getHardwareConcurrency()

      for (let i = 0; i < threads; i += 1) {
        let worker = new SeedWorker()
        worker.addEventListener("message", event => {
          this.workerListener(event)
        })
        this.workers.push(worker);
      }

      this.maxThreads = threads
      this.threads = threads
    }
    else {
      console.log("Web workers not supported")
      toast("Web workers not supported", helpers.getToast(helpers.toastType.ERROR))
      return
    }

    // Read URL params from parent and construct new quick path
    var init = this.props.state.init
    var prefix = this.props.state.prefix
    var suffix = this.props.state.suffix
    var count = this.props.state.count
    var load = this.props.state.load
    if (parseInt(init) < this.inits.length) {
      this.initChange(init)
    }
    if (prefix) {
      this.prefixChange(prefix)
    }
    if (suffix) {
      this.suffixChange(suffix)
    }
    if (count) {
      this.maxWalletsChange(count)
    }
    if (parseInt(load) < this.cpuPower.length) {
      this.loadChange(load)
    }
    if (!init && !prefix && !suffix && !count && !load) {
      this.setParams()
    }
  }

  // Defines the url params
  setParams() {
    helpers.setURLParams('?tool='+toolParam + '&init='+this.state.activeInitId + '&prefix='+this.state.prefix + '&suffix='+this.state.suffix + '&count='+this.state.maxWallets + '&load='+this.state.selectedOption)
  }

  //Clear text from input field
  clearText(event) {
    switch(event.target.value) {
      case 'prefix':
        this.setState({
          prefix: '',
          validPrefix: false
        },function() {
          this.setParams()
        })
        break
      case 'suffix':
        this.setState({
          suffix: '',
          validSuffix: false
        },function() {
          this.setParams()
        })
        break
      default:
        break
    }
  }

  setMax() {
    this.setState({
      maxWallets: helpers.constants.KEYS_MAX
    },function() {
      this.setParams()
    })
  }

  // Select CPU load
  handleOptionChange = changeEvent => {
    this.loadChange(changeEvent.target.value)
  }

  loadChange(val) {
    this.setState({
      selectedOption: val
    },function() {
      this.setParams()
    })

    // recalculate threads
    this.threads = Math.ceil(this.cpuPower[parseInt(val)]*this.maxThreads)
  }

  // Change active address init char
  selectInit(eventKey, event) {
    this.initChange(eventKey)
  }

  // The address init character has changed
  initChange(key) {
    this.setState({
      activeInit: this.inits[key],
      activeInitId: key,
    })

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
      },function() {
        this.setParams()
      })
      return
    }

    this.setState({
      initChar: char,
      prefixMultiplier: 2,
    },function() {
      this.setParams()
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
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Prefix must be a-z and 0-9 but can't contain 0,2,L or V", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      return
    }
    this.setState({
      prefix: prefix,
      validPrefix: true,
    },function() {
      this.setParams()
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
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Suffix must be a-z and 0-9 but can't contain 0,2,L or V", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      return
    }
    this.setState({
      suffix: suffix,
      validSuffix: true,
    },function() {
      this.setParams()
    })
  }

  handleMaxWalletsChange(event) {
    this.maxWalletsChange(event.target.value)
  }

  maxWalletsChange(count) {
    if (count > helpers.constants.KEYS_MAX) {
      count = helpers.constants.KEYS_MAX
    }
    this.setState({
      maxWallets: count
    },
    function() {
      if (!helpers.isNumeric(count)) {
        this.setState({
          validMaxWallets: false
        })
        if (count !== '') {
          if (! toast.isActive(this.inputToast)) {
            this.inputToast = toast("Invalid Value", helpers.getToast(helpers.toastType.ERROR_AUTO))
          }
        }
      }
      else {
        this.setState({
          validMaxWallets: true
        },function() {
          this.setParams()
        })
      }
    })
  }

  // Reset and star over
  reset() {
    this.setState({
      generating: false,
      validPrefix: false,
      validSufix: false,
      output: '',
      outputArray: [],
      addressesFound: 0,
      workersRunning: 0,
      generateText: 'Generate',
      selectedOption: '3',
      stats: {
        aps: 0,
        estimatedDuration: 0,
        addressesCount: 0,
      }
    })
    this.nextReport = 0
    this.addressesCount = 0
    this.countDiff = 0

    this.prefixChange(this.state.prefix)
    this.suffixChange(this.state.suffix)

    // Force stop
    this.postMessage({
      type: 'stop',
    },
    function() {
      this.threads = this.maxThreads
    })
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
    // Mathced address
    switch(type) {
      case "match":

      // stop generating if max wallets reached
      if (this.state.addressesFound >= this.state.maxWallets && !this.stopped) {
        this.stopped = true
        this.postMessage({
          type: 'stop',
        })
        this.setState({
          generating: false,
          generateText: 'Stopping...'
        })
      }
      else if (this.state.addressesFound < this.state.maxWallets) {
        let seed = event.data.payload.wallet.seed
        let secretKey = event.data.payload.wallet.secretKey
        //let publicKey = event.data.payload.wallet.publicKey
        let address = event.data.payload.wallet.address
        var output = this.state.outputArray

        // save result in array
        output.push({wallet: parseInt(this.state.addressesFound) + 1, seed: seed, privKey: secretKey, address: address})

        this.setState({
          outputArray: output,
          output: JSON.stringify(output, null, 2),
          addressesFound: parseInt(this.state.addressesFound) + 1
        })
      }

      break

      // Getting back statistics each second
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

      // Worker has stopped
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
    // limit number of workers to defined thread count
    const workerArray = this.workers.filter((worker, idx) => idx < this.threads)
    this.setState({
      workersRunning: workerArray.length
    },
    function() {
      workerArray.forEach(worker => worker.postMessage(message))
    })
  }

  /* Start generation of addresses */
  generate() {
    if (this.state.generating) {
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

    if (this.state.validMaxWallets && (this.state.validPrefix || this.state.validSuffix)) {
      this.stopped = false
      toast("Search started...", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
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
      if (! toast.isActive(this.inputToast)) {
        this.inputToast = toast("Invalid Input Values", helpers.getToast(helpers.toastType.ERROR_AUTO))
      }
    }
  }

  render() {
    return (
      <div>
        <p>Generates wallets that matches the address PREFIX/SUFFIX specified</p>
        <ul>
          <li>See this <a href="https://medium.com/nanocurrency/how-to-create-a-custom-nano-account-at-maximum-speed-cd9be0045ead">guide</a> for how to obtain higher speed</li>
        </ul>

        <InputGroup size="sm" className="mb-2">
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
          <FormControl id="prefix" aria-describedby="prefix" value={this.state.prefix} title="Any chars a-z and 0-9 except 0(zero), 2, L or V. Leave empty to ignore." placeholder="Match address start" maxLength="30" onChange={this.handlePrefixChange} autocomplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='prefix' onClick={this.clearText}></Button>
          </InputGroup.Append>

          <InputGroup.Prepend className="multi-group narrow-prepend">
            <InputGroup.Text id="sufffix">
              Suffix
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="sufffix" aria-describedby="sufffix" value={this.state.suffix} title="Any chars a-z and 0-9 except 0(zero), 2, L or V. Leave empty to ignore." placeholder="Match address end" maxLength="30" onChange={this.handleSuffixChange} autocomplete="off"/>
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

        <InputGroup size="sm" className="mb-3 count-input">
          <InputGroup.Prepend className="narrow-prepend">
            <InputGroup.Text id="maxwallets">
              Wallets
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="maxwallets" aria-describedby="maxwallets" value={this.state.maxWallets} title="Number of keypairs to generate." maxLength="5" onChange={this.handleMaxWalletsChange} autocomplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="max-btn" onClick={this.setMax}>Max</Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <div className="gpu-load-title">CPU Load:</div>
          <div className="form-check form-check-inline index-checkbox">
            <input className="form-check-input" type="radio" id="send-check" value="0" disabled={this.state.generating} checked={this.state.selectedOption === "0"} onChange={this.handleOptionChange}/>
            <label className="form-check-label" htmlFor="send-check">25%</label>
          </div>
          <div className="form-check form-check-inline index-checkbox">
            <input className="form-check-input" type="radio" id="receive-check" value="1" disabled={this.state.generating} checked={this.state.selectedOption === "1"} onChange={this.handleOptionChange}/>
            <label className="form-check-label" htmlFor="receive-check">50%</label>
          </div>
          <div className="form-check form-check-inline index-checkbox">
            <input className="form-check-input" type="radio" id="open-check" value="2" disabled={this.state.generating} checked={this.state.selectedOption === "2"} onChange={this.handleOptionChange}/>
            <label className="form-check-label" htmlFor="open-check">75%</label>
          </div>
          <div className="form-check form-check-inline index-checkbox">
            <input className="form-check-input" type="radio" id="change-check" value="3" disabled={this.state.generating} checked={this.state.selectedOption === "3"} onChange={this.handleOptionChange}/>
            <label className="form-check-label" htmlFor="change-check">100%</label>
          </div>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <Button variant="primary" onClick={this.generate} disabled={(!this.state.validPrefix && !this.state.validSuffix) || (!this.state.generating && this.state.workersRunning > 0) || this.state.addressesFound >= this.state.maxWallets}>{this.state.generateText}</Button>
          <Button variant="primary" onClick={this.reset} disabled={this.state.generating}>Reset</Button>
        </InputGroup>

        <table className="vanity-stats">
          <tbody>
            <tr>
              <td>Speed [checks/s]</td>
              <td className="vanity-number">{helpers.addCommas(String(this.state.stats.aps))}</td>
            </tr>
            <tr>
              <td>Addresses Checked</td>
              <td className="vanity-number">{helpers.addCommas(String(this.state.stats.addressesCount))}</td>
            </tr>
            <tr>
              <td>Estimated time per address</td>
              <td className="vanity-number">{helpers.formatDurationEstimation(this.state.stats.estimatedDuration)}</td>
            </tr>
            <tr>
              <td>Addresses Found</td>
              <td className="vanity-number">{helpers.addCommas(String(this.state.addressesFound))}</td>
            </tr>
          </tbody>
        </table>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend className="narrow-prepend">
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
export default VanityTool
