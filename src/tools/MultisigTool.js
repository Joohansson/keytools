import React, { Component } from 'react'
import * as nano from 'nanocurrency'
import { InputGroup, FormControl, Button} from 'react-bootstrap'
import * as helpers from '../helpers'
import MainPage from '../mainPage'
import {toast } from 'react-toastify'
import QrImageStyle from './components/qrImageStyle'
import importedWasm from '../musig_nano.wasm.b64';
import * as base32 from '../base32'
const toolParam = 'multisig'

class MultisigTool extends Component {
  constructor(props) {
    super(props)

    this.wasm = null
    this.wasmErrors = ["No error", "Internal WASM error", "Invalid parameter(s) passed to WASM", "Invalid peer message specified"]
    this.numAddresses = 0
    this.inputToast = null //disallow duplicates

    this.state = {
      blockHash: '',
      qrContent: '',
      qrSize: 512,
      activeQR: false,
      qrHidden: true,
      qrState: 0,  //qr size
      validBlockHash: false,
      input: '',
      input2: '',
      privKey: '',
      validPrivKey: false,
      multisigAccount: '',
      signature: '',
      output: '',
      activeStep: 1
    }

    this.handleBlockHashChange = this.handleBlockHashChange.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handlePrivChange = this.handlePrivChange.bind(this)
    this.sample = this.sample.bind(this)
    this.updateQR = this.updateQR.bind(this)
    this.clearText = this.clearText.bind(this)
    this.double = this.double.bind(this)
    this.resetAll = this.resetAll.bind(this)
    this.aggregate = this.aggregate.bind(this)
    this.generateSig = this.generateSig.bind(this)
  }

  // Init component
  componentDidMount() {
    // Read URL params from parent and construct new quick path
    var multiAccount = this.props.state.multisigAccount
    var hash = this.props.state.hash

    if (multiAccount) {
      this.multiAccountChange(hash)
    }
    if (hash) {
      this.blockHashChange(hash)
    }
    if (!hash && !multiAccount) {
      this.setParams()
    }

    // fetch wasm file
    fetch(importedWasm)
      .then(r => r.text())
      .then(content => {
        const wasmString = atob(content);
        const wasmBytes = new Uint8Array(wasmString.length);
        for (let i = 0; i < wasmString.length; i++) {
            wasmBytes[i] = wasmString.charCodeAt(i);
        }

        const imports = {
            wasi_snapshot_preview1: {
                fd_write: (fd, iovs, errno, nwritten) => {
                    console.error("fd_write called: unimplemented");
                    return 0;
                },
                proc_exit: () => {
                    console.error("proc_exit called: unimplemented");
                    return 0;
                },
                environ_sizes_get: () => {
                    console.error("environ_sizes_get called: unimplemented");
                    return 0;
                },
                environ_get: () => {
                    console.error("environ_get called: unimplemented");
                    return 0;
                },
                random_get: (ptr, len) => {
                    crypto.getRandomValues(new Uint8Array(this.wasm.memory.buffer, ptr, len));
                    return 0;
                }
            },
            wasi_unstable: {
                random_get: (ptr, len) => {
                    crypto.getRandomValues(new Uint8Array(this.wasm.memory.buffer, ptr, len));
                    return 0;
                }
            },
        };
        WebAssembly.instantiate(wasmBytes, imports).then(w => {
          this.wasm = w.instance.exports;
        }).catch(console.error);
      });
  }

  // Defines the url params
  setParams() {
    helpers.setURLParams('?tool='+toolParam + '&hash='+this.state.blockHash)
  }

  //Clear text from input field
  clearText(event) {
    switch(event.target.value) {
      case 'blockHash':
        this.setState({
          blockHash: '',
          validBlockHash: false
        },
        function() {
          this.updateQR()
          this.setParams()
        })
        break

        case 'input':
          this.setState({
            input: ''
          },
          function() {
            this.updateQR()
            this.setParams()
          })
          break

        case 'input2':
          this.setState({
            input2: ''
          },
          function() {
            this.updateQR()
            this.setParams()
          })
          break

        case 'privKey':
          this.setState({
            privKey: '',
            validPrivKey: false,
          },
          function() {
            this.updateQR()
            this.setParams()
          })
          break
      default:
        break
    }
  }

  resetAll() {
    this.setState({
      blockHash: '',
      qrContent: '',
      activeQR: false,
      qrHidden: true,
      qrState: 0,  //qr size
      validBlockHash: false,
      input: '',
      input2: '',
      privKey: '',
      validPrivKey: false,
      multisigAccount: '',
      signature: '',
      output: '',
      activeStep: 1
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
      case 'workHash':
        this.setState({
          qrContent: this.state.workHash,
        })
        break
        case 'work':
          this.setState({
            qrContent: this.state.work,
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

  sample() {
    this.setState({
      blockHash: '4E5004CA14899B8F9AABA7A76D010F73E6BAE54948912588B8C4FE0A3B558CA5',
      validBlockHash: true,
    },
    function() {
      this.updateQR()
      this.setParams()
    })
  }

  handleInputChange(event) {
    this.inputChange(event.target.value)
  }

  inputChange(input) {
    this.setState({
      input: input
    })
  }

  handleBlockHashChange(event) {
    this.blockHashChange(event.target.value)
  }

  blockHashChange(hash) {
    if (!nano.checkHash(hash)) {
      this.setState({
        blockHash: hash,
        validBlockHash: false,
      },
      function() {
        this.updateQR()
      })
      if (hash !== '') {
        new MainPage().notifyInvalidFormat()
      }
      return
    }
    this.setState({
      blockHash: hash,
      validBlockHash: true,
    },
    function() {
      this.updateQR()
      this.setParams()
    })
  }

  handlePrivChange(event) {
    this.privChange(event.target.value)
  }

  privChange(priv) {
    if (!nano.checkKey(priv)) {
      this.setState({
        privKey: priv,
        validPrivKey: false
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

    this.setState({
      privKey: priv,
      validPrivKey: true
    },
    function() {
      this.updateQR()
    })
  }

  calculateAddressChecksum(pubkey) {
    const blake2b = new base32.Blake2b(5);
    base32.blake2bUpdate(blake2b, pubkey);
    const out = new Uint8Array(5);
    base32.blake2bFinal(blake2b, out);
    out.reverse();
    return out;
  }
  byteArraysEqual(a, b) {
      if (a.length !== b.length) {
          return false;
      }
      for (let i = 0; i < a.length; i++) {
          if (a[i] !== b[i]) {
              return false;
          }
      }
      return true;
  }
  copyToWasm(bytes, ptr) {
      if (!ptr) {
          ptr = this.wasm.musig_malloc(bytes.length);
      }
      const buf = new Uint8Array(this.wasm.memory.buffer, ptr, bytes.length);
      for (let i = 0; i < bytes.length; i++) {
          buf[i] = bytes[i];
      }
      return ptr;
  }
  copyFromWasm(ptr, length) {
      const out = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
          out[i] = this.wasm.memory.buffer[ptr + i];
      }
      return out;
  }
  alertError(f) {
      return function () {
          try {
              f();
          } catch (err) {
              console.error(err.toString());
              toast(err.toString(), helpers.getToast(helpers.toastType.ERROR_AUTO_LONG));
          }
      };
  }
  fromHexString(hexString) {
      if (!hexString) return new Uint8Array();
      return new Uint8Array(hexString.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  }
  toHexString(bytes) {
      return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
  }

  wasmError(errCode) {
      throw new Error("WASM error " + errCode + ": " + this.wasmErrors[errCode]);
  }

  aggregate(runWithPubkeys) {
    const addresses = this.state.input.trim().split("\n");
    if (addresses.length < 2) {
        throw new Error("This requires at least 2 newline-separated addresses");
    }
    this.numAddresses = addresses.length;
    const pubkeys = [];
    for (let address of addresses) {
        address = address.trim();
        if (!address.startsWith("xrb_") && !address.startsWith("nano_")) {
            throw new Error("Nano addresses must start with xrb_ or nano_");
        }
        address = address.split("_", 2)[1];
        try {
            const bytes = base32.decode(address);
            if (bytes.length !== 37) {
                throw new Error("Wrong nano address length");
            }
            const pubkey = bytes.subarray(0, 32);
            const checksum = this.calculateAddressChecksum(pubkey);
            if (!this.byteArraysEqual(bytes.subarray(32), checksum)) {
                throw new Error("Invalid nano address checksum");
            }
            pubkeys.push(pubkey);
        } catch (err) {
            console.error(err.toString());
            throw new Error("Invalid nano address (bad character?)");
        }
    }
    const pubkeyPtrs = this.wasm.musig_malloc(pubkeys.length * 4);
    const pubkeyPtrsBuf = new Uint32Array(this.wasm.memory.buffer, pubkeyPtrs, pubkeys.length);
    for (let i = 0; i < pubkeys.length; i++) {
        pubkeyPtrsBuf[i] = this.copyToWasm(pubkeys[i]);
    }
    const outPtr = this.wasm.musig_malloc(33);
    const outBuf = new Uint8Array(this.wasm.memory.buffer, outPtr, 33);
    outBuf[0] = 0;
    this.wasm.musig_aggregate_public_keys(pubkeyPtrs, pubkeys.length, outPtr, outPtr + 1);
    if (runWithPubkeys) runWithPubkeys(pubkeyPtrs, pubkeys.length);
    for (let i = 0; i < pubkeyPtrsBuf.length; i++) {
      this.wasm.musig_free(pubkeyPtrsBuf[i]);
    }
    this.wasm.musig_free(pubkeyPtrs);
    const err = outBuf[0];
    if (err !== 0) {
      this.wasm.musig_free(outPtr);
        throw this.wasmError(err);
    }
    const aggPubkey = outBuf.subarray(1).slice();
    const checksum = this.calculateAddressChecksum(aggPubkey);
    const fullAddress = new Uint8Array(37);
    for (let i = 0; i < 32; i++) {
        fullAddress[i] = aggPubkey[i];
    }
    for (let i = 0; i < 5; i++) {
        fullAddress[32 + i] = checksum[i];
    }
    this.setState({
      multisigAccount: base32.encode(fullAddress),
    })
    console.log('Multisig Account: ' + base32.encode(fullAddress))
    this.wasm.musig_free(outPtr);
    return aggPubkey;
  }

  generateAccount() {
    this.alertError(this.aggregate)
  }

  generateSig() {

  }

  render() {
    return (
      <div>
        <p>Generate Multisig Account or Sign from multiple sources</p>
        <ul>
          <li>Use 2 or more input accounts to get a multisig account</li>
          <li>The generated multisig account is the one you will use for transactions</li>
          <li>Make sure the participant(s) own a private key for each input account before funding the multisig!</li>
          <li>Each participant will use THEIR priv key and you will only share output codes</li>
          <li>This works together with the Block Processor tool. Get block hash, send back signature</li>
        </ul>

        <InputGroup size="sm" className='mb-3'>
          <InputGroup.Prepend>
            <InputGroup.Text id="input">
              Input Accounts
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="input-area" aria-describedby="input" as="textarea" rows="4" placeholder="" value={this.state.input} onChange={this.handleInputChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='input' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" onClick={helpers.copyInput1}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <Button className="btn-wide" variant="primary" onClick={this.alertError(this.aggregate)}>Generate Multisig Account</Button>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="multisig-account">
              Multisig Account
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="multisig-account" aria-describedby="multisig-account" value={this.state.multisigAccount} disabled title="The generated account used for multisig transactions." placeholder="" autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.multisigAccount} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'multisig-account' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='multisig-account' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <div className="line noprint"></div>
        <div className="section-title">Multi-signing does not require the Multisig Account above</div>

        <InputGroup size="sm" className='mb-3'>
          <InputGroup.Prepend>
            <InputGroup.Text id="blockHash">
              Block Hash
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="blockHash" aria-describedby="blockHash" value={this.state.blockHash} title="64 char hex block hash." placeholder="ABC123... or abc123..." maxLength="64" onChange={this.handleBlockHashChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='blockHash' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.blockHash} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'blockHash' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='blockHash' onClick={this.handleQRChange}></Button>
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
          <Button className="btn-wide" variant="primary" onClick={this.generateSig} disabled={!this.state.validBlockHash || !this.state.validPrivKey}>{this.state.activeStep !== 3 ? ('Multi-sign Step '+this.state.activeStep):'Multi-sign Final Step'}</Button>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="output">
              Participant Output
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="output" aria-describedby="output" value={this.state.output} disabled title="This goes into the <Input from Participants> for the other participants" placeholder="" autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.output} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'output' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='output' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className='mb-3'>
          <InputGroup.Prepend>
            <InputGroup.Text id="input2">
              Participant Input
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="input2-area" aria-describedby="input2" as="textarea" rows="4" title="The generated output from other participants" placeholder={"Enter data from the other participant(s): Step " + this.state.activeStep} value={this.state.input2} readOnly/>
          <InputGroup.Append>
          <Button variant="outline-secondary" className="fas fa-times-circle" value='input2' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" onClick={helpers.copyInput2}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="signature">
              Block Signature
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="signature" aria-describedby="signature" value={this.state.signature} disabled title="Final multi-signature to publish the block" placeholder="" autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.signature} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'signature' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='signature' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <Button className="btn-wide" variant="primary" onClick={this.resetAll}>Reset All</Button>
        </InputGroup>

        <div className="line noprint"></div>
        <div className="section-title">You can test the process using two tabs, one with Sample 1 and the other with Sample 2</div>

        <InputGroup size="sm" className="mb-3">
          <Button className="btn-wide" variant="primary" onClick={this.sample1}>Sample 1</Button>
          <Button className="btn-wide" variant="primary" onClick={this.sample2}>Sample 2</Button>
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
export default MultisigTool