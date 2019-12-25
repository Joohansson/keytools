import React, { Component } from 'react'
import * as nano from 'nanocurrency'
import { InputGroup, FormControl, Button} from 'react-bootstrap'
import * as helpers from '../helpers'
import MainPage from '../mainPage'
import {toast } from 'react-toastify'
import FindWorker from '../modules/find.worker'

class FindAddressTool extends Component {
  constructor(props) {
    super(props)

    this.workers = []
    this.addressesCount = 0
    this.countDiff = 0
    this.nextReport = 0
    this.maxThreads = 0 //m ax allowed threads: logical cores minus 1
    this.threads = 0
    this.cpuPower = [0.25, 0.5, 0.75, 1]

    this.state = {
      seed: '',
      address: '',
      startIndex: '0',
      endIndex: '100',
      validSeed: false,
      validStartIndex: true,
      validEndIndex: true,
      validAddress: false,
      searching: false,
      workersRunning: 0,
      found: false,
      generateText: 'Search',
      selectedOption: '3',
      stats: {
        aps: 0, //speed addresses per second
        estimatedDuration: 0, //estimated time to find address
        addressesCount: 0,  //total checked addresses
      }
    }

    this.handleSeedChange = this.handleSeedChange.bind(this)
    this.handleStartIndexChange = this.handleStartIndexChange.bind(this)
    this.handleEndIndexChange = this.handleEndIndexChange.bind(this)
    this.handleAddressChange = this.handleAddressChange.bind(this)
    this.postMessage = this.postMessage.bind(this)
    this.getStats = this.getStats.bind(this)
    this.setMin = this.setMin.bind(this)
    this.setMax = this.setMax.bind(this)
    this.search = this.search.bind(this)
    this.sample = this.sample.bind(this)
    this.clearText = this.clearText.bind(this)
    this.workerListener = this.workerListener.bind(this)
    this.handleOptionChange = this.handleOptionChange.bind(this)
  }

  componentDidMount = () => {
    if (window.Worker) {
      var threads = helpers.getHardwareConcurrency()
      if (threads > 4) {
        threads-- //save one thread for handling the site
      }
      threads = 1

      for (let i = 0; i < threads; i += 1) {
        let worker = new FindWorker()
        worker.addEventListener("message", event => {
          this.workerListener(event)
        })
        this.workers.push(worker);
      }

      console.log(this.workers.length)
      this.maxThreads = threads
      this.threads = threads
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
      case 'seed':
        this.setState({
          seed: '',
          validSeed: false
        })
        break
      case 'address':
        this.setState({
          address: '',
          validAddress: false
        })
        break
      default:
        break
    }
  }

  // Select CPU load
  handleOptionChange = changeEvent => {
    let val = changeEvent.target.value
    this.setState({
      selectedOption: val
    })

    // recalculate threads
    this.threads = Math.ceil(this.cpuPower[parseInt(val)]*this.maxThreads)
  }

  sample() {
    this.setState({
      seed: 'AC0FF1422C1C31145FDA5DD6D2A629B81C3E452B856A56E26E576B4076F839D4',
      address: 'nano_157tpyfy3d8xxa8mnz7atj38xmra6xnkkhamnase14cu3dzcxi1pc9z8izi5',
      startIndex: '0',
      endIndex: '100',
      validSeed: true,
      validStartIndex: true,
      validEndIndex: true,
      validAddress: true,
    })
  }

  getStats() {
    const addressesCount = this.addressesCount
    const aps = this.countDiff
    // Number of estimated attempts is 32 to the power of number of characters
    // prefixMultiplier tells if the address is forced to start at 1 or 3, ie. multiply by 2
    // 1000 means milliseconds
    const estimatedDuration = aps > 0 ? 1000 * (parseInt(this.state.endIndex) - parseInt(this.state.startIndex)) / aps : 0
    this.countDiff = 0 // reset
    this.setState({
      stats: {
        addressesCount: addressesCount,
        estimatedDuration: estimatedDuration,
        aps: aps,
      }
    })
  }

  handleSeedChange(event) {
    this.seedChange(event.target.value)
  }

  seedChange(seed) {
    this.setState({
      seed: seed,
    })

    if (!nano.checkSeed(seed)) {
      this.setState({
        validSeed: false
      })
      if (seed !== '') {
        new MainPage().notifyInvalidFormat()
      }
      return
    }
    this.setState({
      validSeed: true
    })
  }

  handleAddressChange(event) {
    this.addressChange(event.target.value)
  }

  addressChange(address) {
    this.setState({
      address: address
    })

    if (!nano.checkAddress(address)) {
      if (address !== '') {
        new MainPage().notifyInvalidFormat()
      }
      this.setState({
        validAddress: false
      })
      return
    }
    this.setState({
      validAddress: true
    })
  }

  handleStartIndexChange(event) {
    var index = event.target.value
    this.setState({
      startIndex: index
    })

    var invalid = false
    if (helpers.isNumeric(index)) {
      index = parseInt(index)
      if (!nano.checkIndex(index)) {
        invalid = true
      }
    }
    else {
      invalid = true
    }
    if (invalid) {
      if (index !== '') {
        new MainPage().notifyInvalidFormat()
      }
      this.setState({
        validStartIndex: false
      })
      return
    }
    this.setState({
      validStartIndex: true
    })
  }

  handleEndIndexChange(event) {
    var index = event.target.value
    this.setState({
      endIndex: index
    })

    var invalid = false
    if (helpers.isNumeric(index)) {
      index = parseInt(index)
      if (!nano.checkIndex(index)) {
        invalid = true
      }
    }
    else {
      invalid = true
    }
    if (invalid) {
      if (index !== '') {
        new MainPage().notifyInvalidFormat()
      }
      this.setState({
        validEndIndex: false
      })
      return
    }
    this.setState({
      validEndIndex: true
    })
  }

  // set min value for start index
  setMin() {
    this.setState({
      startIndex: 0
    })
  }

  // set max value for end index
  setMax() {
    this.setState({
      endIndex: helpers.constants.INDEX_MAX
    })
  }

  // getting message from web worker
  workerListener(event) {
    let type = event.data.type
    // Mathced address
    switch(type) {
      case "match":

      // stop searching if max wallets reached
      this.postMessage({
        type: 'stop',
      })
      this.setState({
        searching: false,
        generateText: 'Stopping...',
      })
      this.found = true

      toast("Found the address at index: " + event.data.payload.index, helpers.getToast(helpers.toastType.SUCCESS))
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
      console.log("workers left1 " + this.state.workersRunning)
      this.setState({
        workersRunning: this.state.workersRunning - 1
      },
      function() {
        console.log("workers left" + this.state.workersRunning)
        if (this.state.workersRunning === 0) {
          toast("Successfully stopped workers", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
          this.setState({
            generateText: 'Search',
          })
        }
      })
      break

      // Worker reached the end
      case "end":
        if (!this.found) {
          toast("Searched full range but no match found.", helpers.getToast(helpers.toastType.ERROR))
        }
        this.setState({
          generateText: 'Search',
          searching: false,
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
      console.log("workers:" + this.state.workersRunning)
      workerArray.forEach(worker => worker.postMessage(message))
    })
  }

  search() {
    this.setState({
      searching: true
    })
    if (this.state.searching) {
      // Stop the web workers
      this.postMessage({
        type: 'stop',
      })
      this.setState({
        searching: false,
        generateText: 'Stopping...'
      })
      return
    }

    if (this.state.searching) {
      toast("Stopping...", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
      // Stop the web workers
      this.postMessage({
        type: 'stop',
      })
      this.setState({
        searching: false,
        generateText: 'Stopping...'
      })
      return
    }

    if (this.state.validSeed && this.state.validAddress && this.state.validEndIndex && this.state.validStartIndex) {
      this.stopped = false
      this.found = false
      this.nextReport = 0
      this.countDiff = 0
      toast("Search started...", helpers.getToast(helpers.toastType.SUCCESS_AUTO))

      this.setState({
        searching: true,
        generateText: 'Stop'
      })

      // Start the web workers
      this.postMessage({
        type: 'start',
        payload: {
          seed: this.state.seed,
          address: this.state.address,
          indexStart: this.state.startIndex,
          indexEnd: this.state.endIndex,
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
        <p>Find out if an address belongs to a seed</p>
        <ul>
          <li>Could be useful if a wallet does not import an address at correct index</li>
        </ul>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="seed">
              Seed
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="seed" aria-describedby="seed" value={this.state.seed} title="64 hex Master key containing a maximum of 4,294,967,295 addresses" placeholder="ABC123... or abc123..." maxLength="64" onChange={this.handleSeedChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='seed' onClick={this.clearText}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="address">
              Address
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="address" aria-describedby="address" value={this.state.address} title="Address to find in the seed. xrb_ or nano_ prefix." placeholder="nano_xxx... or xrb_xxx..." maxLength="65" onChange={this.handleAddressChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='address' onClick={this.clearText}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3 index-input">
          <InputGroup.Prepend>
            <InputGroup.Text id="startIndex">
              Start Index
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="startIndex" aria-describedby="startIndex" value={this.state.startIndex} title="Start index integer. Min: 0" maxLength="10" onChange={this.handleStartIndexChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="max-btn" onClick={this.setMin}>Min</Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3 index-input">
          <InputGroup.Prepend>
            <InputGroup.Text id="endIndex">
              End Index
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="endIndex" aria-describedby="endIndex" value={this.state.endIndex} title="End index integer. Max: 4,294,967,295" maxLength="10" onChange={this.handleEndIndexChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="max-btn" onClick={this.setMax}>Max</Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup className="mb-3">
          <Button variant="primary" onClick={this.search} disabled={!(this.state.validSeed && this.state.validAddress && this.state.validEndIndex && this.state.validStartIndex) || (!this.state.searching && this.state.workersRunning > 0)}>{this.state.generateText}</Button>
          <Button variant="primary" onClick={this.sample} disabled={this.state.searching}>Sample</Button>
        </InputGroup>
      </div>
    )
  }
}
export default FindAddressTool
