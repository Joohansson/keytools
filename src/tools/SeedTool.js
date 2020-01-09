import React, { Component } from 'react'
import * as nano from 'nanocurrency'
import * as nano_old from 'nanocurrency174'
import { wallet } from 'nanocurrency-web'
import * as bip39 from 'bip39'
import { InputGroup, FormControl, Button} from 'react-bootstrap'
import * as helpers from '../helpers'
import QrImageStyle from './components/qrImageStyle'
import {toast } from 'react-toastify'
const toolParam = 'seed'

class SeedTool extends Component {
  constructor(props) {
    super(props)

    this.inputToast = null //disallow duplicates

    this.state = {
      seed: '',
      mnemonic: '',
      selectedDerivationMethod: '0',
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
    this.handleMnemonicChange = this.handleMnemonicChange.bind(this)
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
    this.handleOptionChange = this.handleOptionChange.bind(this)
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
      case 'mnemonic':
        this.setState({
          mnemonic: ''
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

  // Select CPU load
  handleOptionChange = changeEvent => {
    this.derivationChange(changeEvent.target.value)
  }

  derivationChange(val) {
    this.setState({
      selectedDerivationMethod: val
    },function() {
      this.indexChange(this.state.index) //use the same method as when changing the index
      this.setParams()
    })
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
      case 'mnemonic':
        this.setState({
          qrContent: this.state.mnemonic,
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
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid seed or index", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      return
    }

    let nanowallet = wallet.generate(seed)
    let mnemonic = nanowallet.mnemonic
    var privKey
    if (this.state.selectedDerivationMethod === '0') {
      privKey = nano_old.deriveSecretKey(seed, index)
    }
    else {
      let accounts = wallet.accounts(nanowallet.seed, index, index)
      privKey = accounts[0].privateKey
    }
    let pubKey = nano_old.derivePublicKey(privKey)
    let address = nano.deriveAddress(pubKey, {useNanoPrefix: true})

    this.setState({
      seed: seed,
      mnemonic: mnemonic,
      privKey: privKey.toUpperCase(),
      pubKey: pubKey.toUpperCase(),
      address: address,
    },
    function() {
      this.updateQR()
    })
  }

  handleMnemonicChange(event) {
    this.mnemonicChange(event.target.value)
  }

  mnemonicChange(mnemonic) {
    var index = this.state.index
    var invalid = false
    if (helpers.isNumeric(index)) {
      index = parseInt(index)
      if (!nano.checkIndex(index) || !bip39.validateMnemonic(mnemonic)) {
        invalid = true
      }
    }
    else {
      invalid = true
    }

    if (invalid) {
      this.setState({
        mnemonic: mnemonic
      },
      function() {
        this.updateQR()
      })
      if (mnemonic !== '' && this.state.index !== '') {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid 24-word phrase or index", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      return
    }

    let seed = bip39.mnemonicToEntropy(mnemonic).toUpperCase()
    let nanowallet = wallet.generate(seed)
    var privKey
    if (this.state.selectedDerivationMethod === '0') {
      privKey = nano_old.deriveSecretKey(seed, index)
    }
    else {
      let accounts = wallet.accounts(nanowallet.seed, index, index)
      privKey = accounts[0].privateKey
    }
    let pubKey = nano_old.derivePublicKey(privKey)
    let address = nano.deriveAddress(pubKey, {useNanoPrefix: true})


    this.setState({
      seed: seed,
      mnemonic: mnemonic,
      privKey: privKey.toUpperCase(),
      pubKey: pubKey.toUpperCase(),
      address: address,
    },
    function() {
      this.updateQR()
    })
  }

  handleIndexChange(event) {
    this.indexChange(event.target.value)
  }

  indexChange(index) {
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
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid index or seed", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      return
    }

    let nanowallet = wallet.generate(this.state.seed)
    var privKey
    if (this.state.selectedDerivationMethod === '0') {
      privKey = nano_old.deriveSecretKey(this.state.seed, index)
    }
    else {
      let accounts = wallet.accounts(nanowallet.seed, index, index)
      privKey = accounts[0].privateKey
    }
    let pubKey = nano_old.derivePublicKey(privKey)
    let address = nano.deriveAddress(pubKey, {useNanoPrefix: true})

    this.setState({
      index: index,
      privKey: privKey.toUpperCase(),
      pubKey: pubKey.toUpperCase(),
      address: address,
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
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid private key", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      return
    }

    let pubKey = nano_old.derivePublicKey(priv)
    this.setState({
      seed: '',
      mnemonic: '',
      index: '0',
      privKey: priv.toUpperCase(),
      pubKey: pubKey.toUpperCase(),
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
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid public key", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      return
    }

    this.setState({
      seed: '',
      mnemonic: '',
      index: '0',
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
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid Nano address", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      return
    }

    this.setState({
      seed: '',
      mnemonic: '',
      index: '0',
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
        <p>Convert or Verify a Seed, Mnemonic, Private/Public Key, or Address</p>
        <ul>
          <li>The seed from a Ledger device will only be useful for wallets supporting the alternative derivation method below. However, the private keys are good and can be used with the Signing Tool or wallets supporting it.</li>
          <li><strong>Seed &gt;</strong> Mnemonic, Priv Key, Pub Key & Address </li>
          <li><strong>Mnemonic &gt;</strong> Seed, Priv Key, Pub Key & Address </li>
          <li><strong>Priv Key &gt;</strong> Pub Key & Address </li>
          <li><strong>Pub Key &gt;</strong> Address </li>
          <li><strong>Address &gt;</strong> Pub Key </li>
        </ul>

        <InputGroup size="sm" className="mb-3 has-clear">
          <InputGroup.Prepend>
            <InputGroup.Text id="seed">
              Seed
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="seed" aria-describedby="seed" value={this.state.seed} title="64 hex Master key containing private keys" placeholder="ABC123... or abc123..." maxLength="64" onChange={this.handleSeedChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='seed' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.seed} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'seed' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='seed' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3 has-clear">
          <InputGroup.Prepend>
            <InputGroup.Text id="mnemonic">
              Mnemonic
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="mnemonic" aria-describedby="mnemonic" value={this.state.mnemonic} title="The 24-word passphrase is interchangeable with the seed" placeholder="24 words pass phrase" onChange={this.handleMnemonicChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='mnemonic' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.mnemonic} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'mnemonic' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='mnemonic' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <div className="derivation-title">Derivation Method:</div>
          <div className="form-check form-check-inline index-checkbox">
            <input className="form-check-input" type="radio" id="send-check" value="0" checked={this.state.selectedDerivationMethod === "0"} onChange={this.handleOptionChange}/>
            <label className="form-check-label" htmlFor="send-check">Nano Default</label>
          </div>
          <div className="form-check form-check-inline index-checkbox">
            <input className="form-check-input" type="radio" id="receive-check" value="1" checked={this.state.selectedDerivationMethod === "1"} onChange={this.handleOptionChange}/>
            <label className="form-check-label" htmlFor="receive-check">Ledger/Magnum</label>
          </div>
        </InputGroup>

        <InputGroup size="sm" className="mb-3 index-input">
          <InputGroup.Prepend>
            <InputGroup.Text id="index">
              Index
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="index" aria-describedby="index" value={this.state.index} title="Index integer for the derived private key. Max: 4,294,967,295" maxLength="10" onChange={this.handleIndexChange} autoComplete="off"/>
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
          <FormControl id="privKey" aria-describedby="privKey" value={this.state.privKey} title="64 hex Private key to derive Public key" placeholder="ABC123... or abc123..." maxLength="64" onChange={this.handlePrivChange} autoComplete="off"/>
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
          <FormControl id="pubKey" aria-describedby="pubKey" value={this.state.pubKey} title="64 hex Public key to derive address" placeholder="ABC123... or abc123..." maxLength="64" onChange={this.handlePubChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='pubKey' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.pubKey} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'pubKey' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='pubKey' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="account">
              Address
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="account" aria-describedby="account" value={this.state.address} title="Nano address used in wallets. Also derives Public key." maxLength="65" placeholder="nano_xxx... or xrb_xxx..." onChange={this.handleAddressChange} autoComplete="off"/>
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
