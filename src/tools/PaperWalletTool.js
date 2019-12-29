import React, { Component } from 'react'
import * as nano from 'nanocurrency'
import * as nano_old from 'nanocurrency174'
import { InputGroup, FormControl, Button} from 'react-bootstrap'
import { ReactComponent as NanoLogo } from '../img/nano.svg';
import './PaperWalletTool.css';
import * as helpers from '../helpers'
import MainPage from '../mainPage'
import { saveAs } from 'file-saver'
import domtoimage from 'dom-to-image'
import QrImageStyle from './components/qrImageStyle'
const toolParam = 'paper'

class PaperWalletTool extends Component {
  constructor(props) {
    super(props)

    this.state = {
      seed: '',
      qrSeedContent: '',
      qrAddressContent: '',
      qrSize: 720,
    }

    this.componentDidMount = this.componentDidMount.bind(this)
    this.handleSeedChange = this.handleSeedChange.bind(this)
    this.generate = this.generate.bind(this)
    this.clearText = this.clearText.bind(this)
    this.download = this.download.bind(this)
  }

  async componentDidMount() {
    await nano_old.init()
    this.generate()

    // Read URL params from parent and construct new quick path
    this.setParams()
  }

  // Defines the url params
  setParams() {
    helpers.setURLParams('?tool='+toolParam)
  }

  //Clear text from input field
  clearText(event) {
    this.setState({
      seed: '',
      qrSeedContent: '',
      qrAddressContent: '',
    })
  }

  handleSeedChange(event) {
    this.seedChange(event.target.value)
  }

  seedChange(seed) {
    if (!nano.checkSeed(seed)) {
      this.setState({
        seed: seed,
      })
      if (seed !== '') {
        new MainPage().notifyInvalidFormat()
      }
      return
    }

    let privKey = nano_old.deriveSecretKey(seed, 0)
    let pubKey = nano_old.derivePublicKey(privKey)
    this.setState({
      seed: seed,
      qrSeedContent: seed,
      qrAddressContent: nano.deriveAddress(pubKey, {useNanoPrefix: true}),
    })
  }

  async generate() {
    var seed = helpers.genSecureKey()
    seed = seed.toUpperCase()
    this.seedChange(seed)
  }

  print() {
    window.print()
  }

  /* Download card */
  download(event) {
    var imageWidth = 600
    var imageHeight = 256
    var node =  null

    node = document.getElementsByClassName('QR-container-paper-inner')[0];

    domtoimage.toPng(node, {
      width: imageWidth,
      height: imageHeight,
    }).then(function (dataUrl) {
        /* Filesaver has better cross browser support */
        saveAs(dataUrl, "paperwallet--" + this.state.qrAddressContent.slice(0,9) + "..." + this.state.qrAddressContent.slice(61,65) +".png");
      }.bind(this))
      .catch(function (error) {
          console.error('Error, something went wrong downloading paperwallet!', error);
      });
  }

  render() {
    return (
      <div>
        <div className="noprint">
          <p>Generate simple paper wallets with a SEED and ADDRESS</p>
          <ul>
            <li>The address is derived using seed index 0</li>
          </ul>

          <InputGroup size="sm" className="mb-3 has-clear">
            <InputGroup.Prepend>
              <InputGroup.Text id="seed">
                Seed
              </InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl id="seed" aria-describedby="seed" value={this.state.seed} title="64 hex Master key containing the address" placeholder="ABC123... or abc123..." maxLength="64" onChange={this.handleSeedChange}/>
            <InputGroup.Append>
              <Button variant="outline-secondary" className="fas fa-times-circle" value='seed' onClick={this.clearText}></Button>
              <Button variant="outline-secondary" className="fas fa-copy" value={this.state.qrSeedContent} onClick={helpers.copyText}></Button>
            </InputGroup.Append>
          </InputGroup>

          <InputGroup size="sm" className="mb-3">
            <InputGroup.Prepend>
              <InputGroup.Text id="address">
                Address
              </InputGroup.Text>
            </InputGroup.Prepend>
            <FormControl id="address" aria-describedby="address" value={this.state.qrAddressContent} title="Nano address from seed index 0." maxLength="65" placeholder="nano_xxx... or xrb_xxx..." readOnly/>
            <InputGroup.Append>
              <Button variant="outline-secondary" className="fas fa-times-circle" value='address' onClick={this.clearText}></Button>
              <Button variant="outline-secondary" className="fas fa-copy" value={this.state.qrAddressContent} onClick={helpers.copyText}></Button>
            </InputGroup.Append>
          </InputGroup>

          <Button variant="primary" onClick={this.generate}>Generate Wallet</Button>
          <Button variant="primary" onClick={this.print}>Print</Button>
          <Button variant="primary" onClick={this.download}>Download</Button>
        </div>

        <div className="QR-container-paper">
          <div className="QR-container-paper-inner">
            <div className="paper-wallet-text-container">
              <div className="paper-wallet-text">SEED</div>
              <div className="paper-wallet-text">ADDRESS</div>
            </div>
            <QrImageStyle className="QR-img-paper QR-img-paper-left" content={this.state.qrSeedContent} size={this.state.qrSize} />
            <NanoLogo className="paper-wallet-logo"/>
            <QrImageStyle className="QR-img-paper QR-img-paper-right" content={this.state.qrAddressContent} size={this.state.qrSize} />
          </div>
        </div>
      </div>
    )
  }
}
export default PaperWalletTool
