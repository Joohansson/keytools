import React, { Component } from 'react'
import * as nano from 'nanocurrency'
import { InputGroup, FormControl, Button} from 'react-bootstrap'
import * as helpers from '../helpers'
import MainPage from '../mainPage'
import {toast } from 'react-toastify'

class FindAddressTool extends Component {
  constructor(props) {
    super(props)

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
    }

    this.handleSeedChange = this.handleSeedChange.bind(this)
    this.handleStartIndexChange = this.handleStartIndexChange.bind(this)
    this.handleEndIndexChange = this.handleEndIndexChange.bind(this)
    this.handleAddressChange = this.handleAddressChange.bind(this)
    this.setMin = this.setMin.bind(this)
    this.setMax = this.setMax.bind(this)
    this.search = this.search.bind(this)
    this.sample = this.sample.bind(this)
  }

  //Clear text from input field
  clearText(event) {
    switch(event.target.value) {
      case 'seed':
        this.setState({
          seed: ''
        })
        break
      case 'address':
        this.setState({
          address: ''
        })
        break
      default:
        break
    }
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

  search() {
    this.setState({
      searching: true
    })
    var i
    var found = false
    // replace xrb with nano for old addresses
    let checkAddress = this.state.address.replace('xrb', 'nano')

    if (this.state.validSeed && this.state.validAddress && this.state.validEndIndex && this.state.validStartIndex) {
      for (i=parseInt(this.state.startIndex); i <= parseInt(this.state.endIndex); i++) {
        let privKey = nano.deriveSecretKey(this.state.seed, i)
        let pubKey = nano.derivePublicKey(privKey)
        let address = nano.deriveAddress(pubKey, {useNanoPrefix: true})

        // check for match
        if (address === checkAddress) {
          found = true
          break
        }
      }
    }
    else {
      new MainPage().notifyInvalidFormat()
    }

    this.setState({
      searching: false
    })
    if (found) {
      toast("Found the address at index: " + i, helpers.getToast('success'))
    }
    else {
      toast("Finished but no address found", helpers.getToast('error'))
    }
  }

  render() {
    return (
      <div>
        <p>Find out if an address belongs to a seed.<br/>
        Could be useful if a wallet does not import an address at correct index.<br/>
        A large search range may take a very long time and browser freezing.</p>

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

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="address">
              Address
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="address" aria-describedby="address" value={this.state.address} title="Address to find in the seed. xrb_ or nano_ prefix." placeholder="nano_xxx... or xrb_xxx..." onChange={this.handleAddressChange.bind(this)}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='address' onClick={this.clearText.bind(this)}></Button>
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

        <Button variant="primary" onClick={this.search} disabled={!(this.state.validSeed && this.state.validAddress && this.state.validEndIndex && this.state.validStartIndex) || this.state.searching}>Search for Address</Button>
        <Button variant="primary" onClick={this.sample} disabled={this.state.searching}>Sample</Button>
      </div>
    )
  }
}
export default FindAddressTool
