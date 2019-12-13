import React, { Component } from 'react'
import * as nano from 'nanocurrency'
import { InputGroup, FormControl, Button} from 'react-bootstrap'
import * as helpers from '../helpers'
import MainPage from '../mainPage'

class AddressExtractorTool extends Component {
  constructor(props) {
    super(props)

    this.state = {
      seed: '',
      startIndex: '0',
      endIndex: '10',
      indexChecked: false,
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
    this.sample = this.sample.bind(this)
    this.generate = this.generate.bind(this)
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
        })
        break
      default:
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
        if (this.state.indexChecked) {
          output = output + i + ',' + address + '\r'
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
        <p>Mass extract addresses in a range of indexes using a fixed seed.<br/>
        Output format is INDEX, ADDRESS</p>
        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="seed">
              Seed
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="seed" aria-describedby="seed" value={this.state.seed} title="64 hex Master key containing a maximum of 4,294,967,295 addresses" placeholder="ABC123... or abc123..." onChange={this.handleSeedChange.bind(this)}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='seed' onClick={this.clearText.bind(this)}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3 index-input">
          <InputGroup.Prepend>
            <InputGroup.Text id="startIndex">
              Start Index
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="startIndex" aria-describedby="startIndex" value={this.state.startIndex} title="Start index integer. Min: 0" onChange={this.handleStartIndexChange.bind(this)}/>
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
          <FormControl id="endIndex" aria-describedby="endIndex" value={this.state.endIndex} title="End index integer. Max: 4,294,967,295" onChange={this.handleEndIndexChange.bind(this)}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="max-btn" onClick={this.setMax}>Max</Button>
          </InputGroup.Append>
        </InputGroup>

        <div className="form-check form-check-inline index-checkbox">
          <input className="form-check-input" type="checkbox" id="index-check" value="index" checked={this.state.indexChecked} onChange={this.handleIndexCheck.bind(this)}/>
          <label className="form-check-label" for="index-check">Include Index</label>
        </div>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="output">
              Output
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="output-area" aria-describedby="output" as="textarea" rows="15" placeholder="" value={this.state.output} readOnly/>
        </InputGroup>

        <Button variant="primary" onClick={this.generate} disabled={!(this.state.validSeed && this.state.validEndIndex && this.state.validStartIndex) || this.state.generating}>Generate</Button>
        <Button variant="primary" onClick={this.sample} disabled={this.state.generating}>Random Seed</Button>
        <Button variant="primary" onClick={helpers.copyOutput} disabled={this.state.generating}>Copy Output</Button>
      </div>
    )
  }
}
export default AddressExtractorTool
