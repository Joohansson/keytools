import React, { Component } from 'react'
import * as nano from 'nanocurrency'
import { InputGroup, FormControl, Button} from 'react-bootstrap'
import * as helpers from '../helpers'
import MainPage from '../mainPage'
import QrImageStyle from '../modules/qrImageStyle'

class AddressExtractorTool extends Component {
  constructor(props) {
    super(props)

    this.state = {
      seed: '',
      startIndex: '0',
      endIndex: '10',
      qrContent: '',
      qrSize: 512,
      qrState: 0,  //qr size
      activeQR: false,
      qrHidden: true,
      indexChecked: false,
      privKeyChecked: false,
      validSeed: false,
      validStartIndex: true,
      validEndIndex: true,
      prepend: true,
      generating: false,
      output: ''
    }

    this.setMin = this.setMin.bind(this)
    this.setMax = this.setMax.bind(this)
    this.handleSeedChange = this.handleSeedChange.bind(this)
    this.handleStartIndexChange = this.handleStartIndexChange.bind(this)
    this.handleEndIndexChange = this.handleEndIndexChange.bind(this)
    this.handleIndexCheck = this.handleIndexCheck.bind(this)
    this.handlePrivKeyCheck = this.handlePrivKeyCheck.bind(this)
    this.sample = this.sample.bind(this)
    this.generate = this.generate.bind(this)
    this.updateQR = this.updateQR.bind(this)
    this.double = this.double.bind(this)
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

  //Clear text from input field
  clearText(event) {
    switch(event.target.value) {
      case 'seed':
        this.setState({
          seed: '',
          validSeed: false
        },
        function() {
          this.updateQR()
        })
        break
      default:
        break
    }
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
      case 'seed':
        this.setState({
          qrContent: this.state.seed,
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

  async sample() {
    var seed = await nano.generateSeed()
    seed = seed.toUpperCase()
    this.setState({
      seed: seed,
      validSeed: true,
      validStartIndex: true,
      validEndIndex: true,
    },
    function() {
      this.updateQR(this.state.activeQR)
    })
  }

  handleSeedChange(event) {
    this.seedChange(event.target.value)
  }

  seedChange(seed) {
    if (!nano.checkSeed(seed)) {
      this.setState({
        seed: seed,
        validSeed: false
      },
      function() {
        this.updateQR()
      })
      if (seed !== '') {
        new MainPage().notifyInvalidFormat()
      }
      return
    }
    this.setState({
      seed: seed,
      validSeed: true,
    },
    function() {
      this.updateQR()
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

  handleIndexCheck(event) {
    this.setState({
      indexChecked: event.target.checked
    })
  }

  handlePrivKeyCheck(event) {
    this.setState({
      privKeyChecked: event.target.checked
    })
  }

  /* Start generation of addresses */
  async generate() {
    this.setState({
      generating: true
    })

    var i
    var output = ''
    if (this.state.validSeed && this.state.validEndIndex && this.state.validStartIndex) {
      for (i=parseInt(this.state.startIndex); i <= parseInt(this.state.endIndex); i++) {
        let privKey = nano.deriveSecretKey(this.state.seed, i)
        let pubKey = nano.derivePublicKey(privKey)
        let address = nano.deriveAddress(pubKey, {useNanoPrefix: true})

        // save result in array
        if (this.state.indexChecked && this.state.privKeyChecked) {
          output = output + i + ',' + privKey + ',' + address + '\r'
        }
        else if (this.state.indexChecked && !this.state.privKeyChecked) {
          output = output + i + ',' + address + '\r'
        }
        else if (!this.state.indexChecked && this.state.privKeyChecked) {
          output = output + privKey + ',' + address + '\r'
        }
        else {
          output = output + address + '\r'
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
        <p>Mass extract addresses in a range of indexes using a fixed seed</p>
        <ul>
          <li>Output format is INDEX, PRIVATE KEY, ADDRESS</li>
          <li>A large index range may take a very long time and browser freezing</li>
        </ul>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="seed">
              Seed
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="seed" aria-describedby="seed" value={this.state.seed} title="64 hex Master key containing a maximum of 4,294,967,295 addresses" placeholder="ABC123... or abc123..." maxLength="64" onChange={this.handleSeedChange.bind(this)}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='seed' onClick={this.clearText.bind(this)}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.seed} onClick={helpers.copyText.bind(this)}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'seed' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='seed' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3 index-input">
          <InputGroup.Prepend>
            <InputGroup.Text id="startIndex">
              Start Index
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="startIndex" aria-describedby="startIndex" value={this.state.startIndex} title="Start index integer. Min: 0" maxLength="10"onChange={this.handleStartIndexChange}/>
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

        <InputGroup size="sm" className="mb-3">
          <div className="form-check form-check-inline index-checkbox">
            <input className="form-check-input" type="checkbox" id="index-check" value="index" checked={this.state.indexChecked} onChange={this.handleIndexCheck}/>
            <label className="form-check-label" htmlFor="index-check">Include Index</label>
          </div>
          <div className="form-check form-check-inline index-checkbox">
            <input className="form-check-input" type="checkbox" id="privKey-check" value="privKey" checked={this.state.privKeyChecked} onChange={this.handlePrivKeyCheck}/>
            <label className="form-check-label" htmlFor="privKey-check">Include Private Key</label>
          </div>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <Button variant="primary" onClick={this.generate} disabled={!(this.state.validSeed && this.state.validEndIndex && this.state.validStartIndex) || this.state.generating}>Generate</Button>
          <Button variant="primary" onClick={this.sample} disabled={this.state.generating}>Random Seed</Button>
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

        <div className={ this.state.qrHidden ? "hidden" : ""}>
          <div className={helpers.qrClassesContainer[this.state.qrState]}>
            <QrImageStyle className={helpers.qrClassesImg[this.state.qrState]} content={this.state.qrContent} onClick={this.double} title="Click to toggle size" size={this.state.qrSize} />
          </div>
        </div>
      </div>
    )
  }
}
export default AddressExtractorTool
