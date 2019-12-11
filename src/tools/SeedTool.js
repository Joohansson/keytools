import React, { Component } from 'react'
import * as nano from 'nanocurrency'
import { InputGroup, FormControl, Button} from 'react-bootstrap'
import './SeedTool.css'
import QrImageStyle from '../modules/qrImageStyle'
import * as helpers from '../helpers'
import MainPage from '../mainPage'

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
      qrContent: '',
      activeQR: '',
      seedBtnActive: false,
      privBtnActive: false,
      pubBtnActive: false,
      addressBtnActive: false,
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
  }

  // Any QR button is pressed. Handle active button.
  changeQR(event) {
    // already selected, deselect
    if (this.state.activeQR === event.target.value) {
      this.setState({
        activeQR: '',
        qrHidden: false
      })
      this.updateQR('')
    }
    else {
      this.setState({
        activeQR: event.target.value,
        qrHidden: false
      })
      this.updateQR(event.target.value)
    }
  }

  updateQR(unit) {
    switch(unit) {
      case 'seed':
        this.setState({
          qrContent: this.state.seed,
          seedBtnActive: true,
          privBtnActive: false,
          pubBtnActive: false,
          addressBtnActive: false,
        })
        break
      case 'privKey':
        this.setState({
          qrContent: this.state.privKey,
          seedBtnActive: false,
          privBtnActive: true,
          pubBtnActive: false,
          addressBtnActive: false,
        })
        break
      case 'pubKey':
        this.setState({
          qrContent: this.state.pubKey,
          seedBtnActive: false,
          privBtnActive: false,
          pubBtnActive: true,
          addressBtnActive: false,
        })
        break
      case 'address':
        this.setState({
          qrContent: this.state.address,
          seedBtnActive: false,
          privBtnActive: false,
          pubBtnActive: false,
          addressBtnActive: true,
        })
        break
      default:
        this.setState({
          qrContent: '',
          qrHidden: true,
          seedBtnActive: false,
          privBtnActive: false,
          pubBtnActive: false,
          addressBtnActive: false,
        })
        break
    }
  }

  handleSeedChange(event) {
    this.seedChange(event.target.value)
  }

  seedChange(seed) {
    var index = this.state.index
    if (helpers.isNumeric(index)) {
      index = parseInt(index)
      if (!nano.checkIndex(index) || !nano.checkSeed(seed)) {
        this.setState({
          seed: seed
        })
        new MainPage().notifyInvalidFormat()
        return
      }
    }
    else {
      this.setState({
        seed: seed
      })
      new MainPage().notifyInvalidFormat()
      return
    }

    let privKey = nano.deriveSecretKey(seed, parseInt(this.state.index))
    let pubKey = nano.derivePublicKey(privKey)
    this.setState({
      seed: seed,
      privKey: privKey,
      pubKey: pubKey,
      address: nano.deriveAddress(pubKey, {useNanoPrefix: true}),
    },
    function() {
      this.updateQR(this.state.activeQR)
    })
  }

  handleIndexChange(event) {
    var index = event.target.value
    if (helpers.isNumeric(index)) {
      index = parseInt(index)
      if (!nano.checkIndex(index) || !nano.checkSeed(this.state.seed)) {
        this.setState({
          index: index
        })
        new MainPage().notifyInvalidFormat()
        return
      }
    }
    else {
      this.setState({
        index: index
      })
      new MainPage().notifyInvalidFormat()
      return
    }

    let privKey = nano.deriveSecretKey(this.state.seed, index)
    let pubKey = nano.derivePublicKey(privKey)
    this.setState({
      index: index,
      privKey: privKey,
      pubKey: pubKey,
      address: nano.deriveAddress(pubKey, {useNanoPrefix: true}),
    },
    function() {
      this.updateQR(this.state.activeQR)
    })
  }

  handlePrivChange(event) {
    this.privChange(event.target.value)
  }

  privChange(priv) {
    if (!nano.checkKey(priv)) {
      this.setState({
        privKey: priv
      })
      new MainPage().notifyInvalidFormat()
      return
    }

    let pubKey = nano.derivePublicKey(priv)
    this.setState({
      seed: '',
      privKey: priv,
      pubKey: pubKey,
      address: nano.deriveAddress(pubKey, {useNanoPrefix: true}),
    },
    function() {
      this.updateQR(this.state.activeQR)
    })
  }

  handlePubChange(event) {
    this.pubChange(event.target.value)
  }

  pubChange(pub) {
    if (!nano.checkSeed(pub)) {
      this.setState({
        pubKey: pub
      })
      new MainPage().notifyInvalidFormat()
      return
    }

    this.setState({
      seed: '',
      privKey: '',
      pubKey: pub,
      address: nano.deriveAddress(pub, {useNanoPrefix: true}),
    },
    function() {
      this.updateQR(this.state.activeQR)
    })
  }

  handleAddressChange(event) {
    let address = event.target.value
    if (!nano.checkAddress(address)) {
      this.setState({
        address: address
      })
      new MainPage().notifyInvalidFormat()
      return
    }

    this.setState({
      seed: '',
      privKey: '',
      pubKey: nano.derivePublicKey(address),
      address: address,
    },
    function() {
      this.updateQR(this.state.activeQR)
    })
  }

  // Generate a new secure seed
  async generateSeed() {
    let seed = await nano.generateSeed()
    this.seedChange(seed.toUpperCase())
  }

  // Generate a new secure private key
  async generatePriv() {
    let seed = await nano.generateSeed()
    let priv = nano.deriveSecretKey(seed, 0)
    this.privChange(priv)
  }

  // Generate a new demo account
  async generatePub() {
    let seed = await nano.generateSeed()
    let priv = nano.deriveSecretKey(seed, 0)
    let pub = nano.derivePublicKey(priv)
    this.pubChange(pub)
  }

  render() {
    return (
      <div>
        <p>Convert / Verify a Seed, Private & Public key, or Address.</p>
        <ul>
          <li><strong>Seed + Index &gt;</strong> Priv Key, Pub Key & Address </li>
          <li><strong>Priv Key  &gt;</strong> Pub Key & Address </li>
          <li><strong>Pub Key &gt;</strong> Address </li>
          <li><strong>Address &gt;</strong> Pub Key </li>
        </ul>
        <p>Generate secure random keys or demo addresses using the buttons.<br/>
        No data is ever stored but consider downloading the tool and run offline.</p>

        <Button variant="primary" onClick={this.generateSeed} className="btn-medium">Gen Seed</Button>
        <Button variant="primary" onClick={this.generatePriv} className="btn-medium">Gen Priv Key</Button>
        <Button variant="primary" onClick={this.generatePub} className="btn-medium">Gen Address</Button>

        <InputGroup className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="seed">
              Seed
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="seed" aria-describedby="seed" className="amount-box" value={this.state.seed} title="64 hex Master key containing private keys" onChange={this.handleSeedChange.bind(this)}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" value={this.state.seed} onClick={helpers.copyText.bind(this)}>Copy</Button>
            <Button variant="outline-secondary" value='seed' onClick={this.changeQR.bind(this)} className={ this.state.seedBtnActive ? "btn-active" : ""}>QR</Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup className="mb-3 index-input">
          <InputGroup.Prepend>
            <InputGroup.Text id="index">
              Index
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="index" aria-describedby="index" className="amount-box" value={this.state.index} title="Index integer for the derived private key. Max: 4,294,967,295" onChange={this.handleIndexChange.bind(this)}/>
        </InputGroup>

        <InputGroup className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="privKey">
              Private Key
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="privKey" aria-describedby="privKey" className="amount-box" value={this.state.privKey} title="64 hex Private key to derive Public key" onChange={this.handlePrivChange.bind(this)}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" value={this.state.privKey} onClick={helpers.copyText.bind(this)}>Copy</Button>
            <Button variant="outline-secondary" value='privKey' onClick={this.changeQR.bind(this)} className={ this.state.privBtnActive ? "btn-active" : ""}>QR</Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="pubKey">
              Public Key
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="pubKey" aria-describedby="pubKey" className="amount-box" value={this.state.pubKey} title="64 hex Public key to derive address" onChange={this.handlePubChange.bind(this)}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" value={this.state.pubKey} onClick={helpers.copyText.bind(this)}>Copy</Button>
            <Button variant="outline-secondary" value='pubKey' onClick={this.changeQR.bind(this)} className={ this.state.pubBtnActive ? "btn-active" : ""}>QR</Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="address">
              Address
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="address" aria-describedby="address" className="amount-box" value={this.state.address} title="Nano address used in wallets. Also derives Public key." onChange={this.handleAddressChange.bind(this)}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" value={this.state.address} onClick={helpers.copyText.bind(this)}>Copy</Button>
            <Button variant="outline-secondary" value='address' onClick={this.changeQR.bind(this)} className={ this.state.addressBtnActive ? "btn-active" : ""}>QR</Button>
          </InputGroup.Append>
        </InputGroup>

        <div className={ this.state.qrHidden ? "hidden" : "QR-container"}>
          <QrImageStyle className="QR-img" content={this.state.qrContent} size={this.state.qrSize}/>
        </div>
      </div>
    )
  }
}
export default SeedTool
