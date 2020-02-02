import React, { Component } from 'react'
import * as nano from 'nanocurrency'
import * as nano_old from 'nanocurrency174' //must be used for high performance with derivePublicKey, including nano_old.init()
import { wallet } from 'nanocurrency-web'
import * as bip39 from 'bip39'
import 'nano-webgl-pow'
import { Dropdown, DropdownButton, InputGroup, FormControl, Button} from 'react-bootstrap'
import * as helpers from '../helpers'
import $ from 'jquery'
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import MainPage from '../mainPage'
import {toast } from 'react-toastify'
const toolParam = 'sweep'

class SweepTool extends Component {
  constructor(props) {
    super(props)

    this.inputToast = null

    // Threshold dropdown titles
    this.amounts = [
      'Threshold NANO',
      'Threshold raw',
    ]

    this.state = {
      seed: '',
      address: '',
      startIndex: '0',
      endIndex: '10',
      maxPending: helpers.constants.SWEEP_MAX_PENDING,
      amount: '', //threshold
      raw: '', //amount in raw
      validSeed: false,
      validAddress: false,
      validStartIndex: true,
      validEndIndex: true,
      validMaxPending: true,
      validAmount: true, //threshold
      sweeping: false,
      output: '',
      activeAmount: this.amounts[0],
      activeAmountId: '0', // NANO=0, raw=1
      processing: false,
    }

    // Tuning for webGL PoW performance. 512 is default load
    this.webGLWidth = 512
    this.webGLHeight = 1024

    this.setMin = this.setMin.bind(this)
    this.setMax = this.setMax.bind(this)
    this.setMaxPending = this.setMaxPending.bind(this)
    this.handleSeedChange = this.handleSeedChange.bind(this)
    this.handleAddressChange = this.handleAddressChange.bind(this)
    this.handleStartIndexChange = this.handleStartIndexChange.bind(this)
    this.handleEndIndexChange = this.handleEndIndexChange.bind(this)
    this.handleMaxPendingChange = this.handleMaxPendingChange.bind(this)
    this.handleThresholdChange = this.handleThresholdChange.bind(this)
    this.selectThreshold = this.selectThreshold.bind(this)
    this.createPendingBlocks = this.createPendingBlocks.bind(this)
    this.processPending = this.processPending.bind(this)
    this.processSend = this.processSend.bind(this)
    this.processIndexRecursive = this.processIndexRecursive.bind(this)
    this.handleRPCError = this.handleRPCError.bind(this)
    this.sweep = this.sweep.bind(this)
    this.sweepContinue = this.sweepContinue.bind(this)
    this.clearText = this.clearText.bind(this)
    this.appendLog = this.appendLog.bind(this)
  }

  componentDidMount() {
    window.NanoWebglPow.width = this.webGLWidth
    window.NanoWebglPow.height = this.webGLHeight

    // Read URL params from parent and construct new quick path
    this.setParams()
  }

  // Defines the url params
  setParams() {
    helpers.setURLParams('?tool='+toolParam)
  }

  // Change active threshold unit on dropdown select
  selectThreshold(eventKey, event) {
    this.changeAmountType(eventKey)
  }

  changeAmountType(key) {
    this.setState({
      activeAmount: this.amounts[key],
      activeAmountId: key,
    },
    function() {
      this.thresholdChange(this.state.amount)
      this.setParams()
    })
  }

  // set min value for start index
  setMin() {
    this.setState({
      startIndex: 0
    })
    // check end index
    if (this.state.validEndIndex) {
      if (this.state.endIndex > 0+helpers.constants.SWEEP_MAX_INDEX) {
        this.setState({endIndex: 0+helpers.constants.SWEEP_MAX_INDEX})
      }
    }
  }

  // set max value for end index
  setMax() {
    this.setState({
      endIndex: helpers.constants.INDEX_MAX
    })
    // check start index
    if (this.state.validStartIndex) {
      if (this.state.startIndex < helpers.constants.INDEX_MAX-helpers.constants.SWEEP_MAX_INDEX) {
        this.setState({startIndex: helpers.constants.INDEX_MAX-helpers.constants.SWEEP_MAX_INDEX})
      }
    }
  }

  // set max value for pending limit
  setMaxPending() {
    this.setState({
      maxPending: helpers.constants.SWEEP_MAX_PENDING
    })
  }

  handleRPCError(error) {
    if (error.code) {
      console.log("RPC request failed: "+error.message)
      // IP blocked
      if (error.code === 429) {
        toast(helpers.constants.RPC_LIMIT, helpers.getToast(helpers.toastType.ERROR))
      }
      else {
        toast("RPC request failed: "+error.message, helpers.getToast(helpers.toastType.ERROR))
      }
    }
    else {
      console.log("RPC request failed: "+error)
      toast("RPC request failed. See console (CTRL+F12).", helpers.getToast(helpers.toastType.ERROR))
    }
    this.setState({
      sweeping: false
    })
  }

  // Clear text from input field
  clearText(event) {
    switch(event.target.value) {
      case 'seed':
        this.setState({
          seed: '',
          validSeed: false
        })
        break

      case 'address':
        this.setState({
          address: '',
          validAddress: false
        })
        break
      case 'output':
        this.setState({
          output: '',
        })
        break
      default:
        break
    }
  }

  // Append row to log output
  appendLog(row) {
    var linebreak = '\n'
    if (this.state.output === '') {
      linebreak = ''
    }
    this.setState({
      output: this.state.output + linebreak + row
    })
    // scroll to bottom
    $('#output-area').scrollTop($('#output-area')[0].scrollHeight)
  }

  // Validate type of master key. Seed and private key can't be differentiated
  checkMasterKey(key) {
    // validate nano seed or private key
    if (key.length === 64) {
      if (nano.checkSeed(key)) {
        return 'nano_seed'
      }
    }
    // validate bip39 seed
    if (key.length === 128) {
      if (helpers.isHex(key)) {
        return 'bip39_seed'
      }
    }
    // validate mnemonic
    if (bip39.validateMnemonic(key)) {
      return 'mnemonic'
    }
    return false
   }

  handleSeedChange(event) {
    this.seedChange(event.target.value)
  }

  seedChange(seed) {
    if (this.checkMasterKey(seed)) {
      this.setState({
        seed: seed,
        validSeed: true
      })
    }
    else {
      this.setState({
        seed: seed,
        validSeed: false
      })
    }
  }

  handleAddressChange(event) {
    this.addressChange(event.target.value)
  }

  addressChange(address) {
    if (!nano.checkAddress(address)) {
      this.setState({
        address: address,
        validAddress: false,
      })
      if (address !== '') {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid Nano address", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      return
    }

    this.setState({
      address: address,
      validAddress: true,
    })
  }

  handleStartIndexChange(event) {
    var index = event.target.value
    if (index > helpers.constants.INDEX_MAX) {
      index = helpers.constants.INDEX_MAX
    }
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
      if (event.target.value !== '') {
        new MainPage().notifyInvalidFormat()
      }
      this.setState({
        validStartIndex: false
      })
      return
    }
    // check end index
    if (this.state.validEndIndex) {
      if (this.state.endIndex > index+helpers.constants.SWEEP_MAX_INDEX) {
        this.setState({endIndex: index+helpers.constants.SWEEP_MAX_INDEX})
      }
    }
    this.setState({
      validStartIndex: true
    })
  }

  handleEndIndexChange(event) {
    var index = event.target.value
    if (index > helpers.constants.INDEX_MAX) {
      index = helpers.constants.INDEX_MAX
    }
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
      if (event.target.value !== '') {
        new MainPage().notifyInvalidFormat()
      }
      this.setState({
        validEndIndex: false
      })
      return
    }
    // check start index
    if (this.state.validStartIndex) {
      if (this.state.startIndex < index-helpers.constants.SWEEP_MAX_INDEX) {
        this.setState({startIndex: index-helpers.constants.SWEEP_MAX_INDEX})
      }
    }
    this.setState({
      validEndIndex: true
    })
  }

  handleMaxPendingChange(event) {
    var index = event.target.value
    if (index > helpers.constants.SWEEP_MAX_PENDING) {
      index = helpers.constants.SWEEP_MAX_PENDING
    }
    this.setState({
      maxPending: index
    })

    if (!helpers.isNumeric(index) || index < 0) {
      if (index !== '') {
        new MainPage().notifyInvalidFormat()
      }
      this.setState({
        validMaxPending: false
      })
      return
    }

    this.setState({
      validMaxPending: true
    })
  }

  handleThresholdChange = changeEvent => {
    this.thresholdChange(changeEvent.target.value)
  }

  thresholdChange(amount, isRaw = false) {
    var raw = amount
    // force raw
    if (isRaw) {
      this.setState({
        activeAmount: this.amounts[1],
        activeAmountId: '1',
      })
    }
    else {
      // convert to raw if needed
      if (this.state.activeAmountId === '0' && parseFloat(amount) >= 0) {
        raw = helpers.MnanoToRaw(amount)
      }
    }

    if (amount !== '' && (!nano.checkAmount(raw) || parseInt(raw) < 0)) {
      // do not warn when start typing dot
      if (raw[raw.length - 1] !== '.') {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid Nano Amount", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      this.setState({
        amount: amount,
        raw: '',
        validAmount: false
      })
      return
    }
    this.setState({
      amount: amount,
      raw: raw,
      validAmount: true,
    },
    function() {
      this.setParams()
    })
  }

  confirmAccount(account, callback) {
    confirmAlert({
      title: 'Confirm Sweep',
      message: 'Are you 100% sure you wish to send all funds to: '+ account,
      buttons: [
        {
          label: 'Yes',
          onClick: () => callback(true)
        },
        {
          label: 'No',
          onClick: () => callback(false)
        }
      ]
    });
  }

  // Generate proof of work
  generateWork(inputHash, powCallback) {
    window.NanoWebglPow(inputHash,
      (work, n) => {
          toast("Successfully generated PoW!", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
          this.appendLog("Generated PoW: " + work)

          powCallback(work)
      },
      n => {
        toast("Calculated " + helpers.addCommas(n*window.NanoWebglPow.width * window.NanoWebglPow.height) + " hashes...", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
      }
    )
  }

  // Process final send block
  processSend(privKey, previous, sendCallback) {
    let pubKey = nano_old.derivePublicKey(privKey)
    let address = nano.deriveAddress(pubKey, {useNanoPrefix: true})

    // make an extra check on valid destination
    if (this.state.validAddress && nano.checkAddress(this.state.address)) {
      this.inputToast = toast("Started transferring funds...", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
      this.appendLog("Transfer started: " + address)
      this.generateWork(previous, function(work) {
        // create the block with the work found
        let block = nano.createBlock(privKey, {balance:'0', representative:this.representative,
        work:work, link:this.state.address, previous:previous})
        // replace xrb with nano (old library)
        block.block.account = block.block.account.replace('xrb', 'nano')
        block.block.link_as_account = block.block.link_as_account.replace('xrb', 'nano')

        // publish block for each iteration
        let jsonBlock = {action: "process",  json_block: "true",  subtype:"send", watch_work:"false", block: block.block}
        helpers.postDataTimeout(jsonBlock,helpers.constants.RPC_SWEEP_SERVER)
        .then(function(data) {
          if (data.hash) {
            this.inputToast = toast("Funds transferred!", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
            this.appendLog("Funds transferred: "+data.hash)
            console.log(this.adjustedBalance + " raw transferred to " + this.state.address)
          }
          else {
            this.inputToast = toast("Failed processing block.", helpers.getToast(helpers.toastType.ERROR_AUTO))
            this.appendLog("Failed processing block: "+data.error)
          }
          sendCallback()
        }.bind(this))
        .catch(function(error) {
          this.handleRPCError(error)
          sendCallback()
        }.bind(this))}.bind(this)
      )
    }
    else {
      if (this.state.address !== '') {
        this.inputToast = toast("The destination address is not valid", helpers.getToast(helpers.toastType.ERROR))
      }
      sendCallback()
    }
  }

  // For each pending block
  processPending(blocks, keys, keyCount) {
    let key = keys[keyCount]
    this.blocks = blocks
    this.keys = keys
    this.keyCount = keyCount
    this.adjustedBalance = helpers.bigAdd(this.adjustedBalance,blocks[key].amount)

    // generate local work
    try {
      toast("Started generating PoW...", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
      this.appendLog("Started generating PoW...")

      // determine input work hash depending if open block or receive block
      var workInputHash = this.previous
      if (this.subType === 'open') {
        // input hash is the opening address public key
        workInputHash = this.pubKey
      }
      this.generateWork(workInputHash, (work) => {
        // create the block with the work found
        let block = nano.createBlock(this.privKey,{balance:this.adjustedBalance, representative:this.representative,
        work:work, link:key, previous:this.previous})
        // replace xrb with nano (old library)
        block.block.account = block.block.account.replace('xrb', 'nano')
        block.block.link_as_account = block.block.link_as_account.replace('xrb', 'nano')
        // new previous
        this.previous = block.hash

        // publish block for each iteration
        let jsonBlock = {action: "process",  json_block: "true",  subtype:this.subType, watch_work:"false", block: block.block}
        this.subType = 'receive' // only the first block can be an open block, reset for next loop
        helpers.postDataTimeout(jsonBlock,helpers.constants.RPC_SWEEP_SERVER)
        .then((data) => {
          if (data.hash) {
            this.inputToast = toast("Processed pending hash", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
            this.appendLog("Processed pending: "+data.hash)

            // continue with the next pending
            this.keyCount += 1
            if (this.keyCount < this.keys.length) {
              this.processPending(this.blocks, this.keys, this.keyCount)
            }
            // all pending done, now we process the final send block
            else {
              this.appendLog("All pending processed!")
              this.pendingCallback(this.previous)
            }
          }
          else {
            this.inputToast = toast("Failed processing block.", helpers.getToast(helpers.toastType.ERROR_AUTO))
            this.appendLog("Failed processing block: "+data.error)
          }
        })
        .catch(function(error) {
          this.handleRPCError(error)
        }.bind(this))}
      )
    }
    catch(error) {
      if(error.message === 'webgl2_required') {
        toast("WebGL 2 is required to generate work.", helpers.getToast(helpers.toastType.ERROR))
      }
      else if(error.message === 'invalid_hash') {
        toast("Block hash must be 64 character hex string", helpers.getToast(helpers.toastType.ERROR))
      }
      else {
        toast("An unknown error occurred while generating PoW", helpers.getToast(helpers.toastType.ERROR))
        console.log("An unknown error occurred while generating PoW" + error)
      }
      this.setState({
        sweeping: false
      })
      return
    }
  }

  // Create pending blocks based on current balance and previous block (or start with an open block)
  createPendingBlocks(privKey, address, balance, previous, subType, callback, accountCallback) {
    this.privKey = privKey
    this.previous = previous
    this.subType = subType
    this.pendingCallback = callback
    // check for pending first
    var command = {}
    command.action = 'pending'
    command.account = address
    command.count = this.state.maxPending
    command.source = 'true'
    command.sorting = 'true' //largest amount first
    command.include_only_confirmed = 'true'
    if (this.state.raw !== '') {
      command.threshold = this.state.raw
    }

    // retrive from RPC
    helpers.postDataTimeout(command,helpers.constants.RPC_SWEEP_SERVER)
    .then(function(data) {
      // if there are any pending, process them
      if (data.blocks) {
        // sum all raw amounts
        var raw = '0'
        Object.keys(data.blocks).forEach(function(key) {
          raw = helpers.bigAdd(raw,data.blocks[key].amount)
        })
        let nanoAmount = helpers.rawToMnano(raw)
        let pending = {count: Object.keys(data.blocks).length, raw: raw, NANO: nanoAmount, blocks: data.blocks}
        let row = "Found " + pending.count + " pending containing total " + pending.NANO + " NANO"
        this.inputToast = toast(row, helpers.getToast(helpers.toastType.SUCCESS_AUTO))
        this.appendLog(row)

        // create receive blocks for all pending
        var keys = []
        // create an array with all keys to be used recurively
        Object.keys(pending.blocks).forEach(function(key) {
          keys.push(key)
        })

        this.processPending(pending.blocks, keys, 0)
      }
      // no pending, create final block directly
      else {
        if (parseInt(this.adjustedBalance) > 0) {
          this.processSend(this.privKey, this.previous, () => {
            accountCallback() // tell that we are ok to continue with next step
          })
        }
        else {
          accountCallback() // tell that we are ok to continue with next step
        }
      }
    }.bind(this))
    .catch(function(error) {
      this.handleRPCError(error)
    }.bind(this))
  }

  // Process an account
  processAccount(privKey, accountCallback) {
    this.pubKey = nano_old.derivePublicKey(privKey)
    let address = nano.deriveAddress(this.pubKey, {useNanoPrefix: true})

    // get account info required to build the block
    var command = {}
    command.action = 'account_info'
    command.account = address
    command.representative = true

    var balance = 0 // balance will be 0 if open block
    this.adjustedBalance = balance
    var previous = null // previous is null if we create open block
    this.representative = 'nano_1iuz18n4g4wfp9gf7p1s8qkygxw7wx9qfjq6a9aq68uyrdnningdcjontgar'
    var subType = 'open'

    // retrive from RPC
    helpers.postDataTimeout(command,helpers.constants.RPC_SWEEP_SERVER)
    .then((data) => {
      var validResponse = false
      // if frontier is returned it means the account has been opened and we create a receive block
      if (data.frontier) {
        validResponse = true
        balance = data.balance
        this.adjustedBalance = balance
        previous = data.frontier
        this.representative = data.representative
        subType = 'receive'
        validResponse = true
      }
      else if (data.error === "Account not found") {
        validResponse = true
        this.adjustedBalance = 0
      }
      if (validResponse) {
        // create and publish all pending
        this.createPendingBlocks(privKey, address, balance, previous, subType, function(previous) {
          // the previous is the last received block and will be used to create the final send block
          if (parseInt(this.adjustedBalance) > 0) {
            this.processSend(privKey, previous, () => {
              accountCallback()
            })
          }
          else {
            accountCallback()
          }
        }.bind(this), () => {
          accountCallback()
        })
      }
      else {
        toast("Bad RPC response. Please try again.", helpers.getToast(helpers.toastType.ERROR_AUTO))
        accountCallback()
      }
    })
    .catch(function(error) {
      this.handleRPCError(error)
      accountCallback()
    }.bind(this))
  }

  // Recursively process private keys from index range
  processIndexRecursive(privKeys, keyCount) {
    let privKey = privKeys[keyCount][0]
    this.appendLog("Checking index " + privKeys[keyCount][2] + " using " + privKeys[keyCount][1])
    this.processAccount(privKey, function() {
      // continue with the next pending
      keyCount += 1
      if (keyCount < privKeys.length) {
        this.processIndexRecursive(privKeys, keyCount)
      }
      // all private keys have been processed
      else {
        this.appendLog("Finished!")
        this.setState({
          sweeping: false
        })
      }
    }.bind(this))
  }

  async sweepContinue() {
    this.setState({
      sweeping: true
    })

    let keyType = this.checkMasterKey(this.state.seed)
    if (this.state.validEndIndex && this.state.validStartIndex && this.state.validMaxPending && this.state.validAmount) {
      await nano_old.init()
      var seed = '', privKey
      // input is mnemonic
      if (keyType === 'mnemonic') {
        seed = bip39.mnemonicToEntropy(this.state.seed).toUpperCase()
        // seed must be 64 or the nano wallet can't be created. This is the reason 12-words can't be used because the seed would be 32 in length
        if (seed.length !== 64) {
          this.inputToast = toast("Mnemonic not 24 words", helpers.getToast(helpers.toastType.ERROR_AUTO))
          return
        }
      }

      // nano seed or private key
      if (keyType === 'nano_seed' || seed !== '' || keyType === 'bip39_seed') {
        // check if a private key first (no index)
        this.appendLog("Checking if input is a private key")
        if (seed === '') { // seed from input, no mnemonic
          seed = this.state.seed
        }
        this.processAccount(seed, function() {
          // done checking if private key, continue interpret as seed
          var i
          var privKeys = []
          // start with blake2b derivation
          if (keyType !== 'bip39_seed') {
            for (i=parseInt(this.state.startIndex); i <= parseInt(this.state.endIndex); i++) {
              privKey = nano_old.deriveSecretKey(seed, i)
              privKeys.push([privKey, 'blake2b', i])
            }
          }
          // also check all indexes using bip39/44 derivation
          var bip39Seed
          // take 128 char bip39 seed directly from input or convert it from a 64 char nano seed (entropy)
          if (keyType === 'bip39_seed') {
            bip39Seed = this.state.seed
          }
          else {
            bip39Seed = wallet.generate(seed).seed
          }

          let accounts = wallet.accounts(bip39Seed, this.state.startIndex, this.state.endIndex)
          var k = 0
          for (i=parseInt(this.state.startIndex); i <= parseInt(this.state.endIndex); i++) {
            privKey = accounts[k].privateKey
            k += 1
            privKeys.push([privKey, 'bip39/44', i])
          }
          this.processIndexRecursive(privKeys, 0)
        }.bind(this))
      }

    }
    else {
      new MainPage().notifyInvalidFormat()
    }
  }

  /* Start generation of addresses */
  sweep() {
    // check that max number is not exceeded
    if (parseInt(this.state.endIndex) - parseInt(this.state.startIndex) > helpers.constants.KEYS_MAX) {
      if (! toast.isActive(this.inputToast)) {
        this.inputToast =  toast("The total range can't exceed " + helpers.addCommas(String(helpers.constants.KEYS_MAX)), helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
      }
      return
    }
    if (parseInt(this.state.endIndex) < parseInt(this.state.startIndex)) {
      if (! toast.isActive(this.inputToast)) {
        this.inputToast =  toast("End index can't be smaller than start index", helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
      }
      return
    }

    // let user confirm account
    if (this.state.address !== '') {
      this.confirmAccount(this.state.address, function(confirmed) {
        if (confirmed) {
          this.sweepContinue()
        }
      }.bind(this))
    }
    else {
      this.sweepContinue()
    }
  }

  render() {
    return (
      <div>
        <p>Automatically transfers ALL funds from a wallet</p>
        <ul>
          <li>It will search the index range and retrieve pending transactions (with threshold) first if existing</li>
          <li>It will derive private keys using both default blake2b and bip39/44 for Ledger recovery support</li>
          <li>For large amounts it's recommended to <a href="/?tool=sign">sign transactions manually</a> using an offline device</li>
          <li>PoW is computed locally using webGL2, which means the browser must have support for it</li>
          <li>Please avoid using the source wallet elsewhere while this process is running</li>
        </ul>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend className="narrow-prepend-2">
            <InputGroup.Text id="seed">
              Secret Key
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="seed" aria-describedby="seed" value={this.state.seed} disabled={this.state.sweeping} title="64 hex Nano seed, 128 hex bip39 seed, 64 hex private key or 24-word mnemonic" placeholder="Nano seed, bip39 seed, private key or 24-word passphrase" maxLength="1000" onChange={this.handleSeedChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='seed' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.seed} onClick={helpers.copyText}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend className="narrow-prepend-2">
            <InputGroup.Text id="account">
              Destination
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="account" aria-describedby="account" value={this.state.address} disabled={this.state.sweeping} title="Nano address to send all funds to. If blank, funds will not be transferred." maxLength="65" placeholder="nano_xxx... (leave blank to only process pending)" onChange={this.handleAddressChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='address' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.address} onClick={helpers.copyText}></Button>
          </InputGroup.Append>
        </InputGroup>

        <div className="input-title">ACCOUNT RANGE (IGNORE IF USING PRIVATE KEYS)</div>
        <InputGroup size="sm" className="mb-3 index-input">
          <InputGroup.Prepend className="narrow-prepend-2">
            <InputGroup.Text id="startIndex">
              Start Index
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="startIndex" aria-describedby="startIndex" value={this.state.startIndex} title="Start index integer. Max range is 100 to limit RPC load." maxLength="10"onChange={this.handleStartIndexChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="max-btn" onClick={this.setMin}>Min</Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3 index-input">
          <InputGroup.Prepend className="narrow-prepend-2">
            <InputGroup.Text id="endIndex">
              End Index
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="endIndex" aria-describedby="endIndex" value={this.state.endIndex} title="End index integer. Max range is 100 to limit RPC load." maxLength="10" onChange={this.handleEndIndexChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="max-btn" onClick={this.setMax}>Max</Button>
          </InputGroup.Append>
        </InputGroup>

        <div className="input-title">PENDING TRANSACTIONS</div>
        <InputGroup size="sm" className="mb-3 index-input">
          <InputGroup.Prepend>
            <InputGroup.Text id="maxPending">
              Max Transactions
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="maxPending" aria-describedby="maxPending" value={this.state.maxPending} title="Max number of pending to process. Largest amount will go first (of that list)." maxLength="10" onChange={this.handleMaxPendingChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="max-btn" onClick={this.setMaxPending}>Max</Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <DropdownButton
              variant="light"
              className="dropdown-prepend"
              title={this.state.activeAmount}
              key={this.state.activeAmountId}
              id={`dropdown-basic-${this.state.activeAmountId}`}>
              {this.amounts.map(function(amount, index){
                return <Dropdown.Item eventKey={index} key={index} onSelect={this.selectThreshold}>{amount}</Dropdown.Item>;
              }.bind(this))}
            </DropdownButton>
          </InputGroup.Prepend>
          <FormControl id="threshold" aria-describedby="threshold" value={this.state.amount} title="Pending amounts below this limit will not be included." maxLength="39" placeholder="Pending threshold - Leave blank for no limit" onChange={this.handleThresholdChange} autoComplete="off"/>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <Button variant="primary" onClick={this.sweep} disabled={!(this.state.validSeed && this.state.validEndIndex && this.state.validStartIndex && this.state.validMaxPending && this.state.validAmount) || this.state.sweeping}>START PROCESS</Button>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend className="narrow-prepend-2">
            <InputGroup.Text id="output">
              LOG
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="output-area" aria-describedby="output" as="textarea" rows="6" placeholder="" value={this.state.output} readOnly/>
          <InputGroup.Append>
          <Button variant="outline-secondary" className="fas fa-times-circle" value='output' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" onClick={helpers.copyOutput}></Button>
          </InputGroup.Append>
        </InputGroup>

        <div className="log" id="log"></div>
      </div>
    )
  }
}
export default SweepTool
