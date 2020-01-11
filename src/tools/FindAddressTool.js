import React, { Component } from 'react'
import * as nano from 'nanocurrency'
import { InputGroup, FormControl, Button} from 'react-bootstrap'
import * as helpers from '../helpers'
import {toast } from 'react-toastify'
import FindWorker from '../modules/find.worker'
const toolParam = 'findaddr'

class FindAddressTool extends Component {
  constructor(props) {
    super(props)

    this.inputToast = null //disallow duplicates

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
      // Detect hardware concurrency (available logical CPU threads)
      // realThreads not working on some mobiles, use that as backup if the other method fails
      var realThreads = helpers.getHardwareConcurrency()
      this.setupWorkers(realThreads)
      helpers.sample([], 10, 16, function(err, threads) {
        if (threads > realThreads) {
          console.log("Available estimated logical CPUs: " + threads)
          toast("Estimated processing threads: " + threads, helpers.getToast(helpers.toastType.SUCCESS_AUTO))
          // setup one more time if larger
          this.setupWorkers(threads)
        }
      }.bind(this));
    }
    else {
      console.log("Web workers not supported")
      toast("Web workers not supported", helpers.getToast(helpers.toastType.ERROR))
      return
    }

    // Read URL params from parent and construct new quick path
    this.setParams()
  }

  // Defines the url params
  setParams() {
    helpers.setURLParams('?tool='+toolParam)
  }

  setupWorkers(threads) {
    this.workers = []
    for (let i = 0; i < threads; i += 1) {
      let worker = new FindWorker()
      worker.addEventListener("message", event => {
        this.workerListener(event)
      })
      this.workers.push(worker);
    }

    this.maxThreads = threads
    this.threads = threads
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
      seed: '67FEF0332A077CFA26107581C16829CF6DF2CADCB2F2F2471144CC59182A8903',
      address: 'nano_35tijbej54ezndra9ohuzi8mwae7gb4shoq36mb4e87cxahbacg3rtcsifkj',
      startIndex: '0',
      endIndex: '100000',
      validSeed: true,
      validStartIndex: true,
      validEndIndex: true,
      validAddress: true,
    })
  }

  getStats() {
    const addressesCount = this.addressesCount
    const aps = this.countDiff
    // Number of estimated time left
    // 1000 means milliseconds
    const estimatedDuration = aps > 0 ? 1000 * (parseInt(this.state.endIndex) - parseInt(this.state.startIndex) - addressesCount) / aps : 0
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
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid Seed", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
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
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid Address", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
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
    if (index > helpers.constants.INDEX_MAX) {
      index = helpers.constants.INDEX_MAX
    }
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
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid Index", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
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
    if (index > helpers.constants.INDEX_MAX) {
      index = helpers.constants.INDEX_MAX
    }
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
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid Index", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
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

      this.setState({
        searching: false,
        generateText: 'Stopping...',
        stats: {
          addressesCount: (event.data.payload.index - parseInt(this.state.startIndex)), //report last found
          estimatedDuration: 0,
          aps: this.state.stats.aps,
        },
      },
      function() {
        // stop searching
        this.postMessage({
          type: 'stop',
        })
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
      if (now >= this.nextReport && this.state.searching) { // block report when process has stopped, don't want stat to override final stats
        this.nextReport = now + 1000;
        this.getStats()
      }
      break

      // Worker has stopped
      case "stopped":
      var workersRunning = this.state.workersRunning
      if (workersRunning > 0) {
        workersRunning--
        this.setState({
          workersRunning: workersRunning
        })
      }
      if (workersRunning === 0) {
        // block message from apearing multiple times
        if (!this.stopped) {
          toast("Successfully stopped workers", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
          this.stopped = true
        }

        this.setState({
          generateText: 'Search',
        })
      }
      break

      // Worker reached the end
      case "end":
      this.setState({
        workersRunning: this.state.workersRunning - 1
      },
      function() {
        if (this.state.workersRunning === 0) {
          if (!this.found) {
            toast("Searched full range but no match found.", helpers.getToast(helpers.toastType.ERROR))
          }
          this.setState({
            generateText: 'Search',
            searching: false,
            stats: {
              addressesCount: (parseInt(this.state.endIndex) - parseInt(this.state.startIndex)), //report full range
              estimatedDuration: 0,
              aps: this.state.stats.aps,
            }
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
    // With low range the available chunks will be smaller than max workers

    var realWorkerCount = workerArray.length
    var rangeChunks
    if (message.type === 'start') {
      //rangeChunks = this.getIndexChunks(this.threads)
      rangeChunks = helpers.getIndexChunks(parseInt(this.state.startIndex), parseInt(this.state.endIndex), this.threads)
      realWorkerCount = Math.min(workerArray.length,rangeChunks.length)
    }

    this.setState({
      workersRunning: realWorkerCount
    },
    function() {
      if (message.type === 'start') {
        workerArray.forEach(function(worker,index) {
          if (index < realWorkerCount) {
            message.payload.indexStart = rangeChunks[index].indexStart
            message.payload.indexEnd = rangeChunks[index].indexEnd
            worker.postMessage(message)
          }
        })
      }
      else {
        workerArray.forEach(function(worker,index) {
          worker.postMessage(message)
        })
      }
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
        generateText: 'Stop',
        stats: {
          addressesCount: 0,
          estimatedDuration: 0,
          aps: 0,
        }
      })

      // Start the web workers
      this.postMessage({
        type: 'start',
        payload: {
          seed: this.state.seed,
          address: this.state.address,
          indexStart: '',
          indexEnd: '',
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
        <p>Find out if an address belongs to a seed</p>
        <ul>
          <li>Could be useful if a wallet does not import an address at correct index</li>
          <li>It uses the Nano Default derivation method and can't be used with a Ledger seed</li>
        </ul>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="seed">
              Seed
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="seed" aria-describedby="seed" value={this.state.seed} title="64 hex Master key containing a maximum of 4,294,967,295 addresses" placeholder="ABC123... or abc123..." maxLength="64" onChange={this.handleSeedChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='seed' onClick={this.clearText}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="account">
              Address
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="account" aria-describedby="account" value={this.state.address} title="Address to find in the seed. xrb_ or nano_ prefix." placeholder="nano_xxx... or xrb_xxx..." maxLength="65" onChange={this.handleAddressChange} autoComplete="off"/>
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
          <FormControl id="startIndex" aria-describedby="startIndex" value={this.state.startIndex} title="Start index integer. Min: 0" maxLength="10" onChange={this.handleStartIndexChange} autoComplete="off"/>
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
          <FormControl id="endIndex" aria-describedby="endIndex" value={this.state.endIndex} title="End index integer. Max: 4,294,967,295" maxLength="10" onChange={this.handleEndIndexChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="max-btn" onClick={this.setMax}>Max</Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <div className="gpu-load-title">CPU Load:</div>
          <div className="form-check form-check-inline index-checkbox">
            <input className="form-check-input" type="radio" id="send-check" value="0" disabled={this.state.searching} checked={this.state.selectedOption === "0"} onChange={this.handleOptionChange}/>
            <label className="form-check-label" htmlFor="send-check">25%</label>
          </div>
          <div className="form-check form-check-inline index-checkbox">
            <input className="form-check-input" type="radio" id="receive-check" value="1" disabled={this.state.searching} checked={this.state.selectedOption === "1"} onChange={this.handleOptionChange}/>
            <label className="form-check-label" htmlFor="receive-check">50%</label>
          </div>
          <div className="form-check form-check-inline index-checkbox">
            <input className="form-check-input" type="radio" id="open-check" value="2" disabled={this.state.searching} checked={this.state.selectedOption === "2"} onChange={this.handleOptionChange}/>
            <label className="form-check-label" htmlFor="open-check">75%</label>
          </div>
          <div className="form-check form-check-inline index-checkbox">
            <input className="form-check-input" type="radio" id="change-check" value="3" disabled={this.state.searching} checked={this.state.selectedOption === "3"} onChange={this.handleOptionChange}/>
            <label className="form-check-label" htmlFor="change-check">100%</label>
          </div>
        </InputGroup>

        <table className="vanity-stats">
          <tbody>
            <tr>
              <td>Speed [checks/s]</td>
              <td className="vanity-number">{helpers.addCommas(String(this.state.stats.aps))}</td>
            </tr>
            <tr>
              <td>Indexes Checked</td>
              <td className="vanity-number">{helpers.addCommas(String(this.state.stats.addressesCount))}</td>
            </tr>
            <tr>
              <td>Max time left</td>
              <td className="vanity-number">{helpers.formatDurationEstimation(this.state.stats.estimatedDuration)}</td>
            </tr>
          </tbody>
        </table>

        <InputGroup className="mb-3">
          <Button variant="primary" className="btn-medium" onClick={this.search} disabled={!(this.state.validSeed && this.state.validAddress && this.state.validEndIndex && this.state.validStartIndex) || (!this.state.searching && this.state.workersRunning > 0)}>{this.state.generateText}</Button>
          <Button variant="primary" className="btn-medium" onClick={this.sample} disabled={this.state.searching}>Sample</Button>
        </InputGroup>
      </div>
    )
  }
}
export default FindAddressTool
