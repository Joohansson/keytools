import React, { Component } from 'react'
import * as nano from 'nanocurrency'
import * as nano_old from 'nanocurrency174'
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
    this.wasmErrors = ["No error", "Internal WASM error", "Invalid parameter(s) passed to WASM", "Invalid Participant Input"]
    this.numAddresses = 0
    this.inputToast = null //disallow duplicates
    this.musigStagePtr = null
    this.musigStageNum = null
    this.savedPublicKeys = []

    this.state = {
      accountAdd: '',
      validAccountAdd: false,
      validAccounts: false,
      blockHash: '',
      isHashDisabled: false,
      validBlockHash: false,
      qrContent: '',
      qrSize: 512,
      activeQR: false,
      qrHidden: true,
      qrState: 0,  //qr size
      input: '',
      input2: '',
      privKey: '',
      isPrivKeyDisabled: false,
      validPrivKey: false,
      multisigAccount: '',
      signature: '',
      output: '',
      activeStep: 1,
      isInvalidStage: false,
      participants: 2,
      validParticipants: true,
      savedParticipants: 0,
      inputAdd: '',
      validInputAdd: false,
      isInputAddDisabled: false,
    }

    this.handleAccountAddChange = this.handleAccountAddChange.bind(this)
    this.handleAccountAddFinal = this.handleAccountAddFinal.bind(this)
    this.handleBlockHashChange = this.handleBlockHashChange.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleInput2Change = this.handleInput2Change.bind(this)
    this.handlePrivChange = this.handlePrivChange.bind(this)
    this.handleParticipantChange = this.handleParticipantChange.bind(this)
    this.handleInputAddChange = this.handleInputAddChange.bind(this)
    this.handleInputAddFinal = this.handleInputAddFinal.bind(this)
    this.sample1 = this.sample1.bind(this)
    this.sample2 = this.sample2.bind(this)
    this.updateQR = this.updateQR.bind(this)
    this.clearText = this.clearText.bind(this)
    this.double = this.double.bind(this)
    this.resetAll = this.resetAll.bind(this)
    this.aggregate = this.aggregate.bind(this)
    this.sign = this.sign.bind(this)
    this.addData = this.addData.bind(this)
    this.addAccount = this.addAccount.bind(this)
    this.alertError = this.alertError.bind(this)
  }

  // Init component
  async componentDidMount() {
    // Read URL params from parent and construct new quick path
    const hash = this.props.state.hash
    const participants = this.props.state.participants

    if (hash) {
      this.blockHashChange(hash)
    }
    if (participants) {
      this.participantChange(participants)
    }
    if (!hash && !participants) {
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

    await nano_old.init()
  }

  resetAll() {
    this.setState({
      accountAdd: '',
      validAccountAdd: false,
      validAccounts: false,
      blockHash: '',
      isHashDisabled: false,
      validBlockHash: false,
      qrContent: '',
      activeQR: false,
      qrHidden: true,
      qrState: 0,  //qr size
      input: '',
      input2: '',
      privKey: '',
      isPrivKeyDisabled: false,
      validPrivKey: false,
      multisigAccount: '',
      signature: '',
      output: '',
      activeStep: 1,
      isInvalidStage: false,
      participants: 2,
      validParticipants: true,
      savedParticipants: 0,
      inputAdd: '',
      validInputAdd: false,
      isInputAddDisabled: false,
    })
    this.numAddresses = 0
    this.inputToast = null //disallow duplicates
    this.musigStagePtr = null
    this.musigStageNum = null
    this.privateKeyPtr = null
  }

  // Defines the url params
  setParams() {
    helpers.setURLParams('?tool='+toolParam + '&parties='+this.state.participants + '&hash='+this.state.blockHash)
  }

  //Clear text from input field
  clearText(event) {
    switch(event.target.value) {
      case 'addAccount':
        this.setState({
          accountAdd: '',
          validAccountAdd: false
        })
        break

      case 'addInput':
        this.setState({
          inputAdd: '',
          validInputAdd: false
        })
        break

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
          input: '',
          validAccounts: false
        })
        break

      case 'input2':
        this.setState({
          input2: '',
          isInputAddDisabled: false,
          savedParticipants: 0
        })
        // Redo the input accounts if clearing during the first step
        if (this.state.activeStep === 2) {
          const pub = nano_old.derivePublicKey(this.state.privKey)
          let input = nano.deriveAddress(pub, {useNanoPrefix: true}) + '\n'
          this.setState({
            input: input,
            multisigAccount: '',
          })
        }
        break

      case 'privKey':
        this.setState({
          privKey: '',
          validPrivKey: false,
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
      case 'multisig-account':
        this.setState({
          qrContent: this.state.multisigAccount,
        })
        break
      case 'privKey':
        this.setState({
          qrContent: this.state.privKey,
        })
        break
      case 'blockHash':
        this.setState({
          qrContent: this.state.blockHash,
        })
        break
      case 'output':
        this.setState({
          qrContent: this.state.output,
        })
        break
      case 'signature':
        this.setState({
          qrContent: this.state.signature,
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

  sample1() {
    this.resetAll()
    this.setState({
      blockHash: '42C93CAAF366FCABAE5DEC4EAFF33029AA96D466E78B0A99E53CBF7F0C7D1E2E',
      privKey: '956ED66BCAB32EC6BB155FA1E5289860118B0DE656105CE8BDDE168E5E67BFB3',
      validBlockHash: true,
      validPrivKey: true
    },
    function() {
      this.setParams()
    })
  }

  sample2() {
    this.resetAll()
    this.setState({
      blockHash: '42C93CAAF366FCABAE5DEC4EAFF33029AA96D466E78B0A99E53CBF7F0C7D1E2E',
      privKey: 'C7CF5710A742B2E3779E8324FFAE9BA3AD8D22619AAAF300BB81C49A3CD90F92',
      validBlockHash: true,
      validPrivKey: true
    },
    function() {
      this.setParams()
    })
  }

  handleAccountAddChange(event) {
    const account = event.target.value
    if (!nano.checkAddress(account)) {
      this.setState({
        accountAdd: account,
        validAccountAdd: false
      },
      function() {
        this.updateQR()
      })
      if (account !== '') {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid Nano address", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      return
    }

    this.setState({
      accountAdd: account,
      validAccountAdd: true
    },
    function() {
      this.updateQR()
    })
  }

  handleAccountAddFinal(event) {
    // Respond to enter
    if (event.key === 'Enter') {
      if (this.state.validAccountAdd) {
        this.addAccount()
      }
      return
    }
  }

  addAccount() {
    if (this.state.input.includes(this.state.accountAdd.replace('xrb_','nano_'))) {
      this.inputToast = toast("Account already added", helpers.getToast(helpers.toastType.ERROR_AUTO))
      return
    }
    if (this.state.validAccountAdd) {
      this.setState({
        input: this.state.input + this.state.accountAdd.replace('xrb_','nano_') + '\n',
        accountAdd: '',
        validAccountAdd: false,
      },
      function () {
        const addresses = this.state.input.trim().split("\n");
        if (addresses.length > 1) {
          this.setState({
            validAccounts: true
          },
          function() {
            this.alertError(this.aggregate)()
          })
        }
        else {
          this.setState({
            validAccounts: false
          })
        }
      })
    }
    else {
      this.inputToast = toast("Invalid Nano address", helpers.getToast(helpers.toastType.ERROR_AUTO))
    }
  }

  handleInputChange(event) {
    this.setState({
      input: event.target.value
    })
  }

  inputChange(input) {
    this.setState({
      input: input
    })
  }

  handleInput2Change(event) {
    this.setState({
      input2: event.target.value
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

  handleParticipantChange(event) {
    this.participantChange(event.target.value)
  }

  participantChange(index) {
    if (index === '' || index < 2) {
      index = 2;
    }
    if (index > 1000) {
      index = 1000;
    }

    this.setState({
      participants: index
    })

    if (!helpers.isNumeric(index)) {
      if (!toast.isActive(this.inputToast)) {
        this.inputToast = toast("Participants needs to be at least 2", helpers.getToast(helpers.toastType.ERROR_AUTO))
      }
      this.setState({
        validParticipants: false
      })
      return
    }
    this.setState({
      validParticipants: true
    },
    function() {
      this.setParams()
    })
  }

  handleInputAddChange(event) {
    const hashString = event.target.value
    const hashFull = hashString.substring(2)
    let valid = true
    if (hashFull.length === 64) {
      if (!nano.checkHash(hashFull)) {
        valid = false
      }
    }
    else if (hashFull.length === 128) {
      if (!nano.checkHash(hashFull.substring(0,64)) || !nano.checkHash(hashFull.substring(64,128))) {
        valid = false
      }
    }
    else {
      valid = false
    }
    const step = parseInt(hashString.substring(0,1))
    let correctStep = true
    if (step !== this.state.activeStep - 1) {
      correctStep = false
    }

    if (!valid || !correctStep) {
      this.setState({
        inputAdd: hashString,
        validInputAdd: false,
      },
      function() {
        this.updateQR()
      })
      if (hashString !== '') {
        if (!correctStep) {
          this.inputToast = toast("Wrong input for this step. Expected step " + (this.state.activeStep - 1), helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
        else {
          new MainPage().notifyInvalidFormat()
        }
      }
      return
    }
    this.setState({
      inputAdd: hashString,
      validInputAdd: true,
    },
    function() {
      this.updateQR()
      this.setParams()
    })
  }

  handleInputAddFinal(event) {
    // Respond to enter
    if (event.key === 'Enter') {
      if (this.state.validInputAdd) {
        this.addData()
      }
      return
    }
  }

  addData() {
    if (this.state.output.includes(this.state.inputAdd.substring(2))) {
      this.inputToast = toast("Don't add your own output", helpers.getToast(helpers.toastType.ERROR_AUTO))
      return
    }
    if (this.state.input2.includes(this.state.inputAdd.substring(2))) {
      this.inputToast = toast("Data already added", helpers.getToast(helpers.toastType.ERROR_AUTO))
      return
    }
    if (this.state.savedParticipants >= this.state.participants) {
      this.inputToast = toast("You have all data needed", helpers.getToast(helpers.toastType.ERROR_AUTO))
    }
    else if (this.state.validInputAdd) {
      // Derive address and add to stored list (not used but nice feedback for the user)
      if (this.state.activeStep === 2) {
        this.setState({
          input: this.state.input + nano.deriveAddress(this.state.inputAdd.substring(66), {useNanoPrefix: true}) + '\n'
        },
        function() {
          // Don't calculate multisig account until all participant data has been entered
          if (this.state.savedParticipants === this.state.participants - 1) {
            this.alertError(this.aggregate)()
          }
        })
      }

      this.setState({
        input2: this.state.input2 + this.state.inputAdd.substring(2) + '\n',
        savedParticipants: this.state.savedParticipants + 1,
        inputAdd: '',
        validInputAdd: false,
      },
      function() {
        if (this.state.savedParticipants === this.state.participants - 1) {
          this.setState({
            isInputAddDisabled: true,
          })
        }
      })
    }
    else {
      this.inputToast = toast("Data not in valid format", helpers.getToast(helpers.toastType.ERROR_AUTO))
    }
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
    let addresses = []
    if (this.savedPublicKeys.length > 1) {
      for (let pubKey of this.savedPublicKeys) {
        addresses.push(nano.deriveAddress(pubKey, {useNanoPrefix: true}))
      }
    }
    else {
      addresses = this.state.input.trim().split("\n");
      if (addresses.length < 2) {
          throw new Error("This requires at least 2 newline-separated addresses");
      }
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
            const checksum_ = this.calculateAddressChecksum(pubkey);
            if (!this.byteArraysEqual(bytes.subarray(32), checksum_)) {
                throw new Error("Invalid nano address checksum");
            }
            pubkeys.push(pubkey);
        } catch (err_) {
            console.error(err_.toString());
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
    const fullAddressFinal = 'nano_' + base32.encode(fullAddress);
    this.setState({
      multisigAccount: fullAddressFinal,
    })
    console.log('Multisig Account: ' + fullAddressFinal);
    this.wasm.musig_free(outPtr);
    return aggPubkey;
  }

  sign() {
    // Stage 0 (init)
    if (!this.musigStagePtr) {
      if (!nano.checkKey(this.state.privKey)) {
          throw new Error("Invalid private key");
      }
      if (!nano.checkHash(this.state.blockHash)) {
          throw new Error("Invalid block hash");
      }
      const outPtr = this.wasm.musig_malloc(65);
      const outBuf = new Uint8Array(this.wasm.memory.buffer, outPtr, 65);
      outBuf[0] = 0;
      try {
          this.musigStagePtr = this.wasm.musig_stage0(outPtr, outPtr + 33);
          this.musigStageNum = 0;
      } catch (err_) {
          if (this.musigStagePtr) {
              this.wasm.musig_free_stage0(this.musigStagePtr);
          }
          this.musigStagePtr = undefined;
          this.musigStageNum = undefined;
          throw err_;
      }
      const err = outBuf[0];
      if (err !== 0) {
          this.musigStagePtr = undefined;
          this.musigStageNum = undefined;
          this.wasm.musig_free(outPtr);
          throw this.wasmError(err);
      }

      // Combine output with public key
      const output = this.state.activeStep + ':' + this.toHexString(outBuf.subarray(33)) + nano_old.derivePublicKey(this.state.privKey);
      const pub = nano_old.derivePublicKey(this.state.privKey)
      const input = nano.deriveAddress(pub, {useNanoPrefix: true}) + '\n'
      this.setState({
        isHashDisabled: true,
        isPrivKeyDisabled: true,
        activeStep: this.state.activeStep + 1,
        output: output.toUpperCase(),
        input: input,
        accountAdd: '',
        multisigAccount: '',
      })

      this.wasm.musig_free(outPtr);

      // Further steps
    } else {
      const protocolInputs = this.state.input2.trim().split("\n").map(s => s.trim().toLowerCase().substring(0,64));
      const protocolInputPtrs = this.wasm.musig_malloc(protocolInputs.length * 4);
      const protocolInputPtrsBuf = new Uint32Array(this.wasm.memory.buffer, protocolInputPtrs, protocolInputs.length);
      for (let i = 0; i < protocolInputs.length; i++) {
          protocolInputPtrsBuf[i] = this.copyToWasm(this.fromHexString(protocolInputs[i]));
      }

      let privateKeyPtr
      if (this.musigStageNum === 0) {
          privateKeyPtr = this.copyToWasm(this.fromHexString(this.state.privKey));
          this.setState({
            privKey: this.state.privKey.slice(0, 2) + "*".repeat(60) + this.state.privKey.slice(62)
          })
      }

      const outLen = (this.musigStageNum === 2) ? 65 : 33;
      const outPtr = this.wasm.musig_malloc(outLen);
      const outBuf = new Uint8Array(this.wasm.memory.buffer, outPtr, outLen);
      outBuf[0] = 0;
      let newStagePtr;

      if (this.musigStageNum === 0) {
        // Extract public keys from the participants
        this.savedPublicKeys = this.state.input2.trim().split("\n").map(s => s.trim().toLowerCase().substring(64,128));
        // Add the public key from self
        const pub = nano_old.derivePublicKey(this.state.privKey)
        this.savedPublicKeys.push(pub);

        //const message = this.fromHexString(messageInput);
        const blockhash = this.fromHexString(this.state.blockHash);
        const blockhashPtr = this.copyToWasm(blockhash);
        this.aggregate((pubkeys, pubkeysLen) => {
          const flags = 0; // Set to 1 if private key is a raw/expanded scalar (unusual)
          newStagePtr = this.wasm.musig_stage1(this.musigStagePtr, privateKeyPtr, pubkeys, pubkeysLen, flags, blockhashPtr, blockhash.length, protocolInputPtrs, protocolInputs.length, outPtr, null, outPtr + 1);
        });
        /**
        newStagePtr = this.wasm.musig_stage1(this.musigStagePtr, this.privateKeyPtr, pubkeyPtrs, pubkeys.length, flags, blockhashPtr, blockhash.length, protocolInputPtrs, protocolInputs.length, outPtr, outPtr + 1, outPtr + 33);
        */
        this.musigStageNum = 0;
        this.wasm.musig_free(privateKeyPtr);
        this.wasm.musig_free(blockhashPtr);
        
        
      } else if (this.musigStageNum === 1) {
          newStagePtr = this.wasm.musig_stage2(this.musigStagePtr, protocolInputPtrs, protocolInputs.length, outPtr, outPtr + 1);
      } else if (this.musigStageNum === 2) {
          newStagePtr = this.wasm.musig_stage3(this.musigStagePtr, protocolInputPtrs, protocolInputs.length, outPtr, outPtr + 1);
      } else {
        this.wasm.musig_free(outPtr);
          throw new Error("Unexpected musigStageNum " + this.musigStageNum);
      }
      const err = outBuf[0];
      if (err !== 0) {
        this.wasm.musig_free(outPtr);
          if (err === 1) {
              // Now in an invalid state
              this.setState({
                isInvalidStage: true
              })
          }
          throw this.wasmError(err);
      }
      this.musigStagePtr = newStagePtr;
      this.musigStageNum++;
      
      // Finished
      if (this.musigStageNum === 3) {
          this.setState({
            isInvalidStage: true,
            signature: this.toHexString(outBuf.subarray(1)),
            input2: '',
            output: '',
          })
          toast("Multi-Signature Finished!", helpers.getToast(helpers.toastType.SUCCESS));
      }
      else {
        this.setState({
          activeStep: this.state.activeStep + 1,
          output: this.state.activeStep + ":" + this.toHexString(outBuf.subarray(1)),
          input2: '',
          isInputAddDisabled: false,
          savedParticipants: 0,
          inputAdd: '',
          validInputAdd: false,
        })
      }
      this.wasm.musig_free(outPtr);
    }
  }

  render() {
    return (
      <div>
        <p>Generate a Multisig Account or Sign using Multiple Participants</p>
        <ul>
          <li>Use 2 or more input accounts to get a multisig account</li>
          <li>The generated multisig account is the one you will use for transactions</li>
          <li>Make sure the participant(s) own a private key for each input account before funding the multisig!</li>
          <li>Each participant will use THEIR priv key and will only share safe output codes</li>
          <li>If done correct, all participants will produce the same signature</li>
          <li>Works together with the Block Processor tool: Calculate a block hash => Publish block with the multi-signature</li>
        </ul>

        <InputGroup size="sm" className='mb-3'>
          <InputGroup.Prepend className="wide-prepend">
            <InputGroup.Text id="addAccount">
              Participating Account
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="addAccount" aria-describedby="addAccount" value={this.state.accountAdd} disabled={ this.state.activeStep > 1 } title="Account to participate in the multi-sig account. Hit + or enter to add"  placeholder="nano_1abc..." maxLength="65" onChange={this.handleAccountAddChange} onKeyDown={this.handleAccountAddFinal} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='addAccount' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-plus" value='addAccount' onClick={this.addAccount}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className='mb-3'>
          <InputGroup.Prepend className="wide-prepend">
            <InputGroup.Text id="input">
              Stored Accounts
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="input-area" aria-describedby="input" as="textarea" rows="3" title="Accounts to participate in the multi-sig account" placeholder="" disabled value={this.state.input} onChange={this.handleInputChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='input' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" onClick={helpers.copyInput1}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend className="wide-prepend">
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
        <div className="section-title">Signing - Does not require the multisig account</div>

        <InputGroup size="sm" className="mb-3 number-input">
          <InputGroup.Prepend className="wide-prepend">
            <InputGroup.Text id="participants">
              Participants
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="participants-edit" aria-describedby="participants" type="number" value={this.state.participants} disabled={ this.state.activeStep > 1 } title="Number of participants to multi-sign including yourself" placeholder="2" maxLength="3" onChange={this.handleParticipantChange} autoComplete="off"/>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend className="wide-prepend">
            <InputGroup.Text id="privKey">
              Private Key
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="privKey" aria-describedby="privKey" value={this.state.privKey} disabled={ this.state.isPrivKeyDisabled } title="64 hex Private key to derive Public key" placeholder="ABC123... or abc123..." maxLength="64" onChange={this.handlePrivChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='privKey' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.privKey} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'privKey' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='privKey' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className='mb-3'>
          <InputGroup.Prepend className="wide-prepend">
            <InputGroup.Text id="blockHash">
              Block Hash
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="blockHash" aria-describedby="blockHash" value={this.state.blockHash} disabled={ this.state.isHashDisabled } title="64 char hex block hash."  placeholder="ABC123... or abc123..." maxLength="64" onChange={this.handleBlockHashChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='blockHash' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.blockHash} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'blockHash' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='blockHash' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <Button className="btn-wide" variant="primary" onClick={this.alertError(this.sign)} disabled={!this.state.validBlockHash || !this.state.validPrivKey || !this.state.validParticipants || this.state.isInvalidStage || (this.state.activeStep > 1 && !this.state.isInputAddDisabled)}>{this.state.activeStep !== 4 ? (this.state.activeStep === 1 ? 'Start Signing' : 'Step '+ (this.state.activeStep - 1) + '/3 | Next') : 'Final Step'}</Button>
        </InputGroup>

        <InputGroup size="sm" className="mb-3" hidden={this.state.activeStep < 2 || this.state.signature}>
          <InputGroup.Prepend className="wide-prepend">
            <InputGroup.Text id="output">
              Output Data
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="output-edit" aria-describedby="output" value={this.state.output} disabled title="Copy this to the <Input Data> for each participant" placeholder="" autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.output} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'output' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='output' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <div className="section-title" hidden={this.state.activeStep < 2 || this.state.signature}>Add data from every other participant</div>
        <InputGroup size="sm" className='mb-3' hidden={this.state.activeStep < 2 || this.state.signature}>
          <InputGroup.Prepend className="wide-prepend">
            <InputGroup.Text id="addInput">
              Input Data | Step {(this.state.activeStep - 1)}
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="addInput" aria-describedby="addInput" value={this.state.inputAdd} disabled={ this.state.isInvalidStage || this.state.isInputAddDisabled } title="Output data from participants to be added"  placeholder={(this.state.activeStep - 1) + ":abc..."} maxLength="130" onChange={this.handleInputAddChange} onKeyDown={this.handleInputAddFinal} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='addInput' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-plus" value='addInput' onClick={this.addData}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className='mb-3' hidden={this.state.activeStep < 2 || this.state.signature}>
          <InputGroup.Prepend className="wide-prepend">
            <InputGroup.Text id="input2">
              Stored Data
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="input2-area" aria-describedby="input2" as="textarea" rows="3" disabled title="Stored data to be used in the next step" value={this.state.input2} onChange={this.handleInput2Change}/>
          <InputGroup.Append>
          <Button variant="outline-secondary" className="fas fa-times-circle" value='input2' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" onClick={helpers.copyInput2}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3" hidden={this.state.activeStep < 2 || !this.state.signature}>
          <InputGroup.Prepend className="wide-prepend">
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