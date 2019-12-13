import React, { Component } from 'react'
import * as nano from 'nanocurrency'
import { InputGroup, FormControl, Button} from 'react-bootstrap'
import QrImageStyle from '../modules/qrImageStyle'
import * as helpers from '../helpers'
import { ReactComponent as NanoLogo } from '../img/nano.svg';

class PaperWalletTool extends Component {
  constructor(props) {
    super(props)

    this.state = {
      qrSeedContent: '',
      qrAddressContent: '',
      qrSize: 512,
      qrHidden: true,
    }

    this.componentDidMount = this.componentDidMount.bind(this)
    this.generate = this.generate.bind(this)
  }

  componentDidMount() {
    this.generate()
  }

  async generate() {
    var seed = await nano.generateSeed()
    seed = seed.toUpperCase()
    let privKey = nano.deriveSecretKey(seed, 0)
    let pubKey = nano.derivePublicKey(privKey)
    let address = nano.deriveAddress(pubKey, {useNanoPrefix: true})

    this.setState ({
      qrSeedContent: seed,
      qrAddressContent: address,
    })
  }

  print() {
    window.print()
  }

  render() {
    return (
      <div>
        <div className="noprint">
          <p>Generate simple paper wallets with a SEED and ADDRESS</p>
          <ul>
            <li>The address is derived using seed index 0</li>
            <li>To save the wallet: Use a screen capture tool or print</li>
          </ul>

          <Button variant="primary" onClick={this.generate}>Generate Wallet</Button>
          <Button variant="primary" onClick={this.print}>Print</Button>
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
