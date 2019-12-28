import React, { Component } from 'react'
import * as nano from 'nanocurrency230'
import * as nano_old from 'nanocurrency174'
import { InputGroup, FormControl, Button} from 'react-bootstrap'
import QrImageStyle from '../modules/qrImageStyle'
import * as helpers from '../helpers'
import MainPage from '../mainPage'
const toolParam = 'seed'

class SeedTool extends Component {
  constructor(props) {
    super(props)

    this.state = {
      seed: '',
      index: '0',
      privKey: '',
      pubKey: '',
      address: '',
      qrSize: 512,
      qrState: 0,  //qr size
      qrContent: '',
      activeQR: '',
      qrHidden: true,
    }

    this.handleSeedChange = this.handleSeedChange.bind(this)
    this.handleIndexChange = this.handleIndexChange.bind(this)
    this.handlePrivChange = this.handlePrivChange.bind(this)
    this.handlePubChange = this.handlePubChange.bind(this)
    this.handleAddressChange = this.handleAddressChange.bind(this)
    this.updateQR = this.updateQR.bind(this)
    this.generateSeed = this.generateSeed.bind(this)
    this.generatePriv = this.generatePriv.bind(this)
    this.generatePub = this.generatePub.bind(this)
    this.setMax = this.setMax.bind(this)
    this.clearText = this.clearText.bind(this)
    this.double = this.double.bind(this)
  }

  async componentDidMount() {
    await nano_old.init()

    // Read URL params from parent and construct new quick path
    this.setParams()
  }

  // Defines the url params
  setParams() {
    helpers.setURLParams('?tool='+toolParam)
  }

  //Clear text from input field
  clearText(event) {
    switch(event.target.value) {
      case 'seed':
        this.setState({
          seed: ''
        },
        function() {
          this.updateQR()
        })
        break
      case 'privKey':
        this.setState({
          privKey: ''
        },
        function() {
          this.updateQR()
        })
        break
      case 'pubKey':
        this.setState({
          pubKey: ''
        },
        function() {
          this.updateQR()
        })
        break
      case 'address':
        this.setState({
          address: ''
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

  // set max value for end index
  setMax() {
    this.setState({
      index: helpers.constants.INDEX_MAX
    },
    function() {
      this.seedChange(this.state.seed)
    })
  }

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

  // load new QR code and handle active buttons
  updateQR() {
    switch(this.state.qrActive) {
      case 'seed':
        this.setState({
          qrContent: this.state.seed,
        })
        break
      case 'privKey':
        this.setState({
          qrContent: this.state.privKey,
        })
        break
      case 'pubKey':
        this.setState({
          qrContent: this.state.pubKey,
        })
        break
      case 'address':
        this.setState({
          qrContent: this.state.address,
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

  handleSeedChange(event) {
    this.seedChange(event.target.value)
  }

  seedChange(seed) {
    var index = this.state.index
    var invalid = false
    if (helpers.isNumeric(index)) {
      index = parseInt(index)
      if (!nano.checkIndex(index) || !nano.checkSeed(seed)) {
        invalid = true
      }
    }
    else {
      invalid = true
    }

    if (invalid) {
      this.setState({
        seed: seed
      },
      function() {
        this.updateQR()
      })
      if (seed !== '' && this.state.index !== '') {
        new MainPage().notifyInvalidFormat()
      }
      return
    }

    let privKey = nano_old.deriveSecretKey(seed, parseInt(this.state.index))
    let pubKey = nano_old.derivePublicKey(privKey)
    this.setState({
      seed: seed,
      privKey: privKey,
      pubKey: pubKey,
      address: nano.deriveAddress(pubKey, {useNanoPrefix: true}),
    },
    function() {
      this.updateQR()
    })
  }

  handleIndexChange(event) {
    var index = event.target.value
    var invalid = false
    if (helpers.isNumeric(index)) {
      index = parseInt(index)
      if (!nano.checkIndex(index) || !nano.checkSeed(this.state.seed)) {
        invalid = true
      }
    }
    else {
      invalid = true
    }
    if (invalid) {
      this.setState({
        index: index
      },
      function() {
        this.updateQR()
      })
      if (this.state.seed !== '' && index !== '') {
        new MainPage().notifyInvalidFormat()
      }
      return
    }

    let privKey = nano_old.deriveSecretKey(this.state.seed, index)
    let pubKey = nano_old.derivePublicKey(privKey)
    this.setState({
      index: index,
      privKey: privKey,
      pubKey: pubKey,
      address: nano.deriveAddress(pubKey, {useNanoPrefix: true}),
    },
    function() {
      this.updateQR()
    })
  }

  handlePrivChange(event) {
    this.privChange(event.target.value)
  }

  privChange(priv) {
    if (!nano.checkKey(priv)) {
      this.setState({
        privKey: priv
      },
      function() {
        this.updateQR()
      })
      if (priv !== '') {
        new MainPage().notifyInvalidFormat()
      }
      return
    }

    let pubKey = nano_old.derivePublicKey(priv)
    this.setState({
      seed: '',
      privKey: priv,
      pubKey: pubKey,
      address: nano.deriveAddress(pubKey, {useNanoPrefix: true}),
    },
    function() {
      this.updateQR()
    })
  }

  handlePubChange(event) {
    this.pubChange(event.target.value)
  }

  pubChange(pub) {
    if (!nano.checkSeed(pub)) {
      this.setState({
        pubKey: pub
      },
      function() {
        this.updateQR()
      })
      if (pub !== '') {
        new MainPage().notifyInvalidFormat()
      }
      return
    }

    this.setState({
      seed: '',
      privKey: '',
      pubKey: pub,
      address: nano.deriveAddress(pub, {useNanoPrefix: true}),
    },
    function() {
      this.updateQR()
    })
  }

  handleAddressChange(event) {
    this.addressChange(event.target.value)
  }

  addressChange(address) {
    if (!nano.checkAddress(address)) {
      this.setState({
        address: address
      },
      function() {
        this.updateQR()
      })
      if (address !== '') {
        new MainPage().notifyInvalidFormat()
      }
      return
    }

    this.setState({
      seed: '',
      privKey: '',
      pubKey: nano.derivePublicKey(address),
      address: address,
    },
    function() {
      this.updateQR()
    })
  }

  // Generate a new secure seed
  generateSeed() {
    let key = helpers.genSecureKey()
    this.seedChange(key.toUpperCase())
  }

  // Generate a new secure private key
  generatePriv() {
    let key = helpers.genSecureKey()
    this.privChange(key.toUpperCase())
  }

  // Generate a new demo account
  generatePub() {
    let key = helpers.genSecureKey()
    this.pubChange(key.toUpperCase())
  }

  render() {
    return (
      <div>
        <p>Convert or Verify a Seed, Private/Public Key, or Address</p>
        <ul>
          <li><strong>Seed + Index &gt;</strong> Priv Key, Pub Key & Address </li>
          <li><strong>Priv Key  &gt;</strong> Pub Key & Address </li>
          <li><strong>Pub Key &gt;</strong> Address </li>
          <li><strong>Address &gt;</strong> Pub Key </li>
        </ul>

        <InputGroup size="sm" className="mb-3 has-clear">
          <InputGroup.Prepend>
            <InputGroup.Text id="seed">
              Seed
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="seed" aria-describedby="seed" value={this.state.seed} title="64 hex Master key containing private keys" placeholder="ABC123... or abc123..." maxLength="64" onChange={this.handleSeedChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='seed' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.seed} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'seed' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='seed' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3 index-input">
          <InputGroup.Prepend>
            <InputGroup.Text id="index">
              Index
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="index" aria-describedby="index" value={this.state.index} title="Index integer for the derived private key. Max: 4,294,967,295" maxLength="10" onChange={this.handleIndexChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" onClick={this.setMax}>Max</Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="privKey">
              Private Key
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="privKey" aria-describedby="privKey" value={this.state.privKey} title="64 hex Private key to derive Public key" placeholder="ABC123... or abc123..." maxLength="64" onChange={this.handlePrivChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='privKey' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.privKey} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'privKey' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='privKey' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="pubKey">
              Public Key
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="pubKey" aria-describedby="pubKey" value={this.state.pubKey} title="64 hex Public key to derive address" placeholder="ABC123... or abc123..." maxLength="64" onChange={this.handlePubChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='pubKey' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.pubKey} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'pubKey' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='pubKey' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="address">
              Address
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="address" aria-describedby="address" value={this.state.address} title="Nano address used in wallets. Also derives Public key." maxLength="65" placeholder="nano_xxx... or xrb_xxx..." onChange={this.handleAddressChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='address' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.address} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'address' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='address' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <p>Generate secure random keypairs or demo addresses</p>
        <InputGroup className="mb-3">
          <Button variant="primary" onClick={this.generateSeed} className="btn-medium">Nano Seed</Button>
          <Button variant="primary" onClick={this.generatePriv} className="btn-medium">Private Key</Button>
          <Button variant="primary" onClick={this.generatePub} className="btn-medium">Address</Button>
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
export default SeedTool
