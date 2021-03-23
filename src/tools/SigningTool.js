import React, { Component } from 'react'
import * as nano from 'nanocurrency'
import { Dropdown, DropdownButton, InputGroup, FormControl, Button} from 'react-bootstrap'
import * as helpers from '../helpers'
import {toast } from 'react-toastify'
//import 'nano-webgl-pow'
import * as webglpow from '../modules/nano-webgl-pow'
import QrImageStyle from './components/qrImageStyle'
const toolParam = 'sign'

class SigningTool extends Component {
  constructor(props) {
    super(props)

    this.inputToast = null //disallow duplicates

    // default work threshold values for node v21
    this.defaultSendPow = '0xFFFFFFF8'
    //this.defaultGetPow = '0xFFFFFE00' //switch to this once the new pow kicks in
    this.defaultGetPow = '0xFFFFFFF8'

    this.addressText = [
      'Source Address',
      'Account Address',
      'Opening Address',
      'Account Address',
      'N/A',
    ]

    this.previousText = [
      'Previous Hash',
      'Previous Hash',
      'N/A',
      'Previous Hash',
      'N/A',
    ]

    this.repText = [
      'Representative',
      'Representative',
      'Representative',
      'Representative',
      'N/A',
    ]

    this.currBalanceText = [
      'Balance Now',
      'Balance Now',
      'N/A',
      'Balance Now',
      'N/A',
    ]

    this.amountText = [
      'Amount NANO',
      'Amount raw',
    ]

    this.linkText = [
      'Dest. Address',
      'Pending Hash',
      'Pending Hash',
      'N/A',
      'N/A',
    ]

    // TITLES
    this.addressTitle = [
      'The account for which you own the private key and will create the block for.',
      'The account for which you own the private key and will create the block for.',
      'The account for which you own the private key and will create the block for.',
      'The account for which you own the private key and will create the block for.',
      'N/A',
    ]

    this.previousTitle = [
      'The last recorded block hash for the source address.',
      'The last recorded block hash for the account address.',
      'N/A',
      'The last recorded block hash for the account address.',
      'N/A',
    ]

    this.repTitle = [
      'The source account\'s representative. If it differs from currently set, it will force a change to the new one.',
      'The account\'s representative. If it differs from currently set, it will force a change to the new one.',
      'The account\'s representative. If it differs from currently set, it will force a change to the new one.',
      'The account\'s new representative.',
      'N/A',
    ]

    this.currBalanceTitle = [
      'The balance currently in the account, before the new transaction, in raw unit. Very important this is correct!',
      'The balance currently in the account, before the new transaction, in raw unit. Very important this is correct!',
      'N/A',
      'The balance currently in the account, before the new transaction, in raw unit. Very important this is correct!',
      'N/A',
    ]

    this.amountTitle = [
      'The amount you will send in raw or NANO unit. Very important this is correct!',
      'The amount you will receive in raw or NANO unit. Must match the amount of the pending hash. Very important this is correct!',
      'The amount you will receive in raw or NANO unit. Must match the amount of the pending hash. Very important this is correct!',
      'N/A',
      'N/A',
    ]

    this.linkTitle = [
      'The address of the account you are sending to.',
      'The block hash of the pending block you will receive.',
      'The block hash of the pending block you will receive.',
      'N/A',
      'N/A',
    ]

    this.powTitle = [
      'Generated proof of work based on the Previous Hash.',
      'Generated proof of work based on the Previous Hash.',
      'Generated proof of work based on the Opening Address Public Key.',
      'Generated proof of work based on the Previous Hash.',
      'Generated proof of work based on the Input Hash.',
    ]

    // PLACEHOLDERS
    this.linkPlace = [
      'nano_xxx... or xrb_xxx...',
      'ABC123... or abc123...',
      'ABC123... or abc123...',
      'Not needed',
      'N/A',
    ]

    this.amountPlace = [
      'Amount to be sent',
      'Amount to be received',
      'Amount to be received upon opening',
      'N/A',
      'N/A',
    ]

    // Amount dropdown titles
    this.amounts = [
      'Amount NANO',
      'Amount raw',
    ]

    this.sampleText = [
      {
        // SEND
        ADDRESS: 'nano_1xmastiputrdrhnf35jdh4yj1q339tyuk86w3k6oy5knede8zfowpa1rgjpn',
        LINK: 'nano_1xmastreedxwfhpktqxppwgwwhdx1p6hiskpw7jt8g5y19khyy38axg4tohm',
        PREV: '4E5004CA14899B8F9AABA7A76D010F73E6BAE54948912588B8C4FE0A3B558CA5',
        REP: 'nano_3rw4un6ys57hrb39sy1qx8qy5wukst1iiponztrz9qiz6qqa55kxzx4491or',
        BALANCE: '100000000000000000000000000',
        AMOUNT: '0.0001',
        PRIV: '9DFDAF721A0C3CEED3AC09E8667CDC073600B35E6E5A728816C0ABFCAFDC4D47',
        WORK: 'a61abfd34321d0aa',
        BLOCKHASH: '',
        SIGNWORKHASH: '',
      },
      // RECEIVE
      {
        ADDRESS: 'nano_1xmastiputrdrhnf35jdh4yj1q339tyuk86w3k6oy5knede8zfowpa1rgjpn',
        LINK: 'FB0D886948EF4BBC410C0C64C16291E31AB360BEB21B338988A6C37D89C24362',
        PREV: 'B320F9AD2C3341E0FA6EFAF093C2D618036D10DB800F14830A928A44B8DD265C',
        REP: 'nano_3rw4un6ys57hrb39sy1qx8qy5wukst1iiponztrz9qiz6qqa55kxzx4491or',
        BALANCE: '0',
        AMOUNT: '0.0001',
        PRIV: '9DFDAF721A0C3CEED3AC09E8667CDC073600B35E6E5A728816C0ABFCAFDC4D47',
        WORK: '837d0a3484b674a0',
        BLOCKHASH: '',
        SIGNWORKHASH: '',
      },
      // OPEN
      {
        ADDRESS: 'nano_1xmastiputrdrhnf35jdh4yj1q339tyuk86w3k6oy5knede8zfowpa1rgjpn',
        LINK: '2576EB824D38955AE7BBCA02354116AF9378D1BBBD46AC7774C798669732E1CC',
        PREV: '',
        REP: 'nano_1iuz18n4g4wfp9gf7p1s8qkygxw7wx9qfjq6a9aq68uyrdnningdcjontgar',
        BALANCE: '0',
        AMOUNT: '0.0001',
        PRIV: '9DFDAF721A0C3CEED3AC09E8667CDC073600B35E6E5A728816C0ABFCAFDC4D47',
        WORK: '756fa92d08334f3d',
        BLOCKHASH: '',
        SIGNWORKHASH: '',
      },
      {
        // CHANGE
        ADDRESS: 'nano_1xmastiputrdrhnf35jdh4yj1q339tyuk86w3k6oy5knede8zfowpa1rgjpn',
        LINK: '',
        PREV: '0FB9CBDDE171296C53E5CA8FC0FDA0430FEB9E57004FE01F85F043ABBC633BC5',
        REP: 'nano_1iuz18n4g4wfp9gf7p1s8qkygxw7wx9qfjq6a9aq68uyrdnningdcjontgar',
        BALANCE: '200000000000000000000000000',
        AMOUNT: '',
        PRIV: '9DFDAF721A0C3CEED3AC09E8667CDC073600B35E6E5A728816C0ABFCAFDC4D47',
        WORK: '2d6631a7abf4271c',
        BLOCKHASH: '',
        SIGNWORKHASH: '',
      },
      {
        // SIGN
        ADDRESS: '',
        LINK: '',
        PREV: '',
        REP: '',
        BALANCE: '',
        AMOUNT: '',
        PRIV: '9DFDAF721A0C3CEED3AC09E8667CDC073600B35E6E5A728816C0ABFCAFDC4D47',
        WORK: '2d6631a7abf4271c',
        BLOCKHASH: '23D220EE6F51DCE87C72A2E91EB66E7889A9E6AA460D6315DD5DCBEA50DD1FB8',
        SIGNWORKHASH: '0FB9CBDDE171296C53E5CA8FC0FDA0430FEB9E57004FE01F85F043ABBC633BC5',
      },
    ]

    this.state = {
      address: '',
      previous: '',
      rep: '',
      currBalance: '',
      currBalanceRaw: '',
      amount: '',
      link: '',
      privKey: '',
      blockHash: '',
      signature: '',
      work: '',
      output: '',
      outputRaw: '',
      signWorkHash: '', //special work hash field for sign block option
      validAddress: false,
      validPrevious: false,
      validRep: false,
      validCurrBalance: false,
      validAmount: false,
      validLink: false,
      validPrivKey: false,
      validBlockHash: false,
      validWork: false,
      validSignWorkHash: false,
      validOutput: false,
      selectedOption: '0',
      qrActive: '',
      qrContent: '',
      qrHidden: true,
      qrSize: 512,
      qrState: 0,  //qr size
      nanoBalanceActive: false, //if the show NANO button is toggled
      text_address: this.addressText[0],
      text_previous: this.previousText[0],
      text_rep: this.repText[0],
      text_currBalance: this.currBalanceText[0],
      text_amount: this.amountText[0],
      text_link: this.linkText[0],
      title_address: this.addressTitle[0],
      title_previous: this.previousTitle[0],
      title_rep: this.repTitle[0],
      title_currBalance: this.currBalanceTitle[0],
      title_amount: this.amountTitle[0],
      title_link: this.linkTitle[0],
      place_link: this.linkPlace[0],
      place_amount: this.amountPlace[0],
      title_pow: this.powTitle[0],
      activeAmount: this.amounts[0],
      activeAmountId: '0', // NANO=0, raw=1
      jsonOneLine: false, //if the output is one line or not
      jsonOneLineText: 'Simple',
      fetchingRPC: false,
    }

    this.clearText = this.clearText.bind(this)
    this.clearAll = this.clearAll.bind(this)
    this.sample = this.sample.bind(this)
    this.updateQR = this.updateQR.bind(this)
    this.selectAmount = this.selectAmount.bind(this)
    this.generateWork = this.generateWork.bind(this)
    this.double = this.double.bind(this)
    this.oneLine = this.oneLine.bind(this)
    this.publishBlock = this.publishBlock.bind(this)
    this.getRPC = this.getRPC.bind(this)
    this.changeAmountType = this.changeAmountType.bind(this)
    this.handleRPCError = this.handleRPCError.bind(this)
    this.showNanoBalance = this.showNanoBalance.bind(this)

    // Tuning for webGL PoW performance. 512 is default load
    this.webglWidth = 2048
    this.webglHeight = 2048
  }

  // Init component
  componentDidMount() {
    //window.NanoWebglPow.width = this.webglWidth
    //window.NanoWebglPow.height = this.webglHeight

    // Read URL params from parent and construct new quick path
    var type = this.props.state.type
    var address = this.props.state.address
    var link = this.props.state.link
    var previous = this.props.state.previous
    var rep = this.props.state.rep
    var balance = this.props.state.balance
    var amount = this.props.state.amount
    var amountType = this.props.state.amountType
    var hash = this.props.state.hash
    var workHash = this.props.state.workHash

    if (type) {
      this.optionChange(type,false)
    }
    if (address) {
      this.addressChange(address)
    }
    if (link) {
      this.linkChange(link)
    }
    if (previous) {
      this.previousChange(previous)
    }
    if (rep) {
      this.repChange(rep)
    }
    if (balance) {
      this.balanceChange(balance)
    }
    if (amount) {
      this.amountChange(amount)
    }
    if (amountType) {
      this.changeAmountType(amountType)
    }
    if (hash) {
      this.blockHashChange(hash)
    }
    if (workHash) {
      this.signWorkHashChange(workHash)
    }

    if (!type && !address && !link && !previous && !rep && !balance &&!amount &&!amountType && !hash && !workHash) {
      this.setParams()
    }
  }

  // Defines the url params
  setParams(includeHash=false) {
    var params = '?tool='+toolParam + '&type='+this.state.selectedOption

    // Only include hash in parameters when requested
    if (includeHash) {
      params = params + '&hash='+this.state.blockHash + '&workhash='+this.state.signWorkHash
    }
    else {
      params = params + '&address='+this.state.address + '&link='+this.state.link +
      '&previous='+this.state.previous + '&rep='+this.state.rep + '&balance='+this.state.currBalanceRaw + '&amount='+this.state.amount + '&amounttype='+this.state.activeAmountId
    }
    helpers.setURLParams(params)
  }

  //Clear text from input field
  clearText(event) {
    switch(event.target.value) {
      case 'address':
      this.setState({
        address: '',
        validAddress: false
      },
      function() {
        this.hashBlock()
      })
      break

      case 'link':
      this.setState({
        link: '',
        validLink: false
      },
      function() {
        this.hashBlock()
      })
      break

      case 'previous':
      this.setState({
        previous: '',
        validPrevious: false
      },
      function() {
        this.hashBlock()
      })
      break

      case 'rep':
      this.setState({
        rep: '',
        validRep: false
      },
      function() {
        this.hashBlock()
      })
      break

      case 'currBalance':
      this.setState({
        currBalance: '',
        currBalanceRaw: '',
        validCurrBalance: false
      },
      function() {
        this.hashBlock()
      })
      break

      case 'amount':
      this.setState({
        amount: '',
        validAmount: false
      },
      function() {
        this.hashBlock()
      })
      break

      case 'privKey':
      this.setState({
        privKey: '',
        validPrivKey: false
      },
      function() {
        this.hashBlock()
      })
      break

      case 'blockHash':
      this.setState({
        blockHash: '',
        validBlockHash: false
      },
      function() {
        this.hashBlock()
      })
      break

      case 'signature':
      this.setState({
        signature: '',
      },
      function() {
        this.hashBlock()
      })
      break

      case 'work':
      this.setState({
        work: '',
        validWork: false
      },
      function() {
        this.hashBlock()
      })
      break

      case 'signWorkHash':
      this.setState({
        signWorkHash: '',
        validSignWorkHash: false
      },
      function() {
        this.hashBlock()
      })
      break

      default:
        break
    }
  }

  clearAll() {
    this.setState({
      address: '',
      previous: '',
      rep: '',
      currBalance: '',
      currBalanceRaw: '',
      amount: '',
      link: '',
      privKey: '',
      blockHash: '',
      signature: '',
      work: '',
      output: '',
      outputRaw: '',
      signWorkHash: '',
      validAddress: false,
      validPrevious: this.state.selectedOption === '2' ? true:false, //previous not used for open blocks
      validRep: false,
      validCurrBalance: this.state.selectedOption === '2' ? true:false, //balance not used for open blocks
      validAmount: this.state.selectedOption === '3' ? true:false, //amount not used for change blocks
      validLink: this.state.selectedOption === '3' ? true:false, //link not used for change blocks
      validPrivKey: false,
      validBlockHash: false,
      validWork: false,
      validSignWorkHash: false,
      validOutput: false,
      qrActive: '',
      qrContent: '',
      qrHidden: true,
      fetchingRPC: false,
      nanoBalanceActive: false,
      activeAmount: this.amounts[0],
      activeAmountId: '0',
    },function() {
      if (this.state.selectedOption === '4') {
        this.setParams(true) //include block hash in params
      }
      else {
        this.setParams(false)
      }
    })
  }

  handleRPCError(error) {
    this.setState({fetchingRPC: false})
    if (error.code) {
      console.log("RPC request failed: "+error.message)
      // IP blocked
      if (error.code === 429) {
        toast(helpers.constants.RPC_LIMIT, helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
      }
      else {
        toast("RPC request failed: "+error.message, helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
      }
    }
    else {
      console.log("RPC request failed: "+error)
      toast("RPC request failed. See console (CTRL+F12).", helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
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

  // Change active amount unit on dropdown select
  selectAmount(eventKey, event) {
    this.changeAmountType(eventKey)
  }

  changeAmountType(key) {
    this.setState({
      activeAmount: this.amounts[key],
      activeAmountId: key,
    },
    function() {
      this.amountChange(this.state.amount)
    })
  }

  handleAddressChange = changeEvent => {
    this.addressChange(changeEvent.target.value)
  }

  addressChange(address) {
    if (!nano.checkAddress(address)) {
      if (address !== '') {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid Input", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      this.setState({
        address: address,
        validAddress: false
      },
      function() {
        this.hashBlock()
      })
      return
    }
    // check that the private key actually correspond to the address provided
    if (this.state.validPrivKey) {
      let privKey = this.state.privKey
      let nanoAddress = address.replace('xrb', 'nano')
      let pubKey = nano.derivePublicKey(privKey)
      let derivedAddress = nano.deriveAddress(pubKey, {useNanoPrefix: true})
      if (derivedAddress !== nanoAddress) {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("The address does not match the private key given", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
    }

    // invalidate work if changing address if the work was valid before
    // only for open block since is based on public key (address)
    let sendType = this.state.selectedOption
    if (sendType === '2') {
      if (this.state.validWork) {
        let pubKey = nano.derivePublicKey(address)
        if (!nano.validateWork({blockHash:pubKey, work:this.state.work})) {
          if (! toast.isActive(this.inputToast)) {
            this.inputToast = toast("The PoW is no longer valid for the given address", helpers.getToast(helpers.toastType.ERROR_AUTO))
          }
        }
      }
    }

    this.setState({
      address: address,
      validAddress: true
    },
    function() {
      this.hashBlock()
    })
  }

  handleLinkChange = changeEvent => {
    this.linkChange(changeEvent.target.value)
  }

  linkChange(address) {
    if (!nano.checkAddress(address) && !nano.checkKey(address)) {
      if (address !== '') {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid Input", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      this.setState({
        link: address,
        validLink: false
      },
      function() {
        this.hashBlock()
      })
      return
    }
    this.setState({
      link: address,
      validLink: true
    },
    function() {
      this.hashBlock()
    })
  }

  handlePreviousChange = changeEvent => {
    this.previousChange(changeEvent.target.value)
  }

  previousChange(hash) {
    if (!nano.checkKey(hash)) {
      if (hash !== '') {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid Input", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      this.setState({
        previous: hash,
        validPrevious: false
      },
      function() {
        this.hashBlock()
      })
      return
    }
    // invalidate work if changing previous hash if the work was valid before
    // only for send, receive and change because work for open block is based on public key
    let sendType = this.state.selectedOption
    if (sendType === '0' || sendType === '1' || sendType === '3') {
      if (this.state.validWork) {
        if (!nano.validateWork({blockHash:hash, work:this.state.work})) {
          if (! toast.isActive(this.inputToast)) {
            this.inputToast = toast("The PoW is no longer valid for the given previous hash", helpers.getToast(helpers.toastType.ERROR_AUTO))
          }
        }
      }
    }

    this.setState({
      previous: hash,
      validPrevious: true
    },
    function() {
      this.hashBlock()
    })
  }

  handleRepChange = changeEvent => {
    this.repChange(changeEvent.target.value)
  }

  repChange(address) {
    if (!nano.checkAddress(address)) {
      if (address !== '') {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid Input", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      this.setState({
        rep: address,
        validRep: false
      },
      function() {
        this.hashBlock()
      })
      return
    }
    this.setState({
      rep: address,
      validRep: true
    },
    function() {
      this.hashBlock()
    })
  }

  handleCurrBalanceChange = changeEvent => {
    this.balanceChange(changeEvent.target.value)
  }

  balanceChange(balance) {
    if (!nano.checkAmount(balance)) {
      // do not warn when start typing dot
      if (balance !== '' && balance[balance.length -1] !== '.') {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid Nano Amount", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      this.setState({
        currBalance: balance,
        currBalanceRaw: '',
        validCurrBalance: false,
      },
      function() {
        this.hashBlock()
      })
      return
    }
    this.setState({
      currBalance: balance,
      currBalanceRaw: balance, //the real value used downstream
      nanoBalanceActive: false,
      validCurrBalance: true,
    },
    function() {
      this.hashBlock()
    })
  }

  handleAmountChange = changeEvent => {
    this.amountChange(changeEvent.target.value)
  }

  amountChange(amount, isRaw = false) {
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
      if (this.state.activeAmountId === '0') {
        raw = helpers.MnanoToRaw(amount)
      }
    }

    if (!nano.checkAmount(raw)) {
      // do not warn when start typing dot
      if (amount !== '' && amount[amount.length -1] !== '.') {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid Nano Amount", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      this.setState({
        amount: amount,
        validAmount: false
      },
      function() {
        this.hashBlock()
      })
      return
    }
    this.setState({
      amount: amount,
      validAmount: true,
    },
    function() {
      this.hashBlock()
    })
  }

  handleNanoBalance = changeEvent => {
    if (this.state.nanoBalanceActive) {
      this.showNanoBalance(false)
    }
    else {
      this.showNanoBalance(true)
    }
  }

  // Toggle NANO instead of raw
  showNanoBalance(enable = false) {
    // Show NANO
    if (enable) {
      let raw = this.state.currBalanceRaw //original raw value
      if (!nano.checkAmount(raw)) {
        // do not warn when start typing dot
        if (this.state.currBalance !== '') {
          if (! toast.isActive(this.inputToast)) {
            this.inputToast = toast("Invalid Nano Amount", helpers.getToast(helpers.toastType.ERROR_AUTO))
          }
        }
        return
      }
      this.setState({
        currBalance: helpers.rawToMnano(raw),
        nanoBalanceActive: true,
      })
    }
    // Show raw (reset)
    else {
      this.setState({
        currBalance: this.state.currBalanceRaw,
        nanoBalanceActive: false,
      })
    }
  }

  handleBlockHashChange = changeEvent => {
    this.blockHashChange(changeEvent.target.value)
  }

  blockHashChange(hash) {
    if (!nano.checkHash(hash)) {
      if (hash !== '') {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid Hash", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      this.setState({
        blockHash: hash,
        validBlockHash: false
      },
      function() {
        this.signBlock()
      })
      return
    }
    this.setState({
      blockHash: hash,
      validBlockHash: true
    },
    function() {
      this.signBlock()
      this.setParams(true)
    })
  }

  handlePrivKeyChange = changeEvent => {
    this.privKeyChange(changeEvent.target.value)
  }

  privKeyChange(hash) {
    //IS PRIVATE KEY
    if (hash.length <= 64 || this.state.selectedOption === '4') {
      if (!nano.checkKey(hash)) {
        if (hash !== '') {
          if (! toast.isActive(this.inputToast)) {
            this.inputToast = toast("Invalid Key", helpers.getToast(helpers.toastType.ERROR_AUTO))
          }
        }
        this.setState({
          privKey: hash,
          validPrivKey: false
        },
        function() {
          if (this.state.selectedOption === '4') {
            this.signBlock()
          }
          else {
            this.createBlock()
          }
        })
        return
      }
      // check that the private key actually correspond to the address provided. Do not do for SIGN BLOCK
      if (this.state.validAddress && this.state.selectedOption !== '4') {
        let address = this.state.address.replace('xrb', 'nano')
        let pubKey = nano.derivePublicKey(hash)
        let derivedAddress = nano.deriveAddress(pubKey, {useNanoPrefix: true})
        if (derivedAddress !== address) {
          if (! toast.isActive(this.inputToast)) {
            this.inputToast = toast("The private key does not match the address given", helpers.getToast(helpers.toastType.ERROR_AUTO))
          }
        }
      }
      this.setState({
        privKey: hash,
        validPrivKey: true
      },function() {
        if (this.state.selectedOption === '4') {
          this.signBlock()
        }
        else {
          this.createBlock()
        }
      })
    }
    // IS SIGNATURE
    else {
      if (!nano.checkSignature(hash)) {
        if (hash !== '') {
          if (! toast.isActive(this.inputToast)) {
            this.inputToast = toast("Invalid Input", helpers.getToast(helpers.toastType.ERROR_AUTO))
          }
        }
        this.setState({
          privKey: hash,
          validPrivKey: false
        },
        function() {
          this.createBlock()
        })
        return
      }
      this.setState({
        privKey: hash,
        validPrivKey: true
      },function() {
          this.createBlock(true) //indicate the we have a signature and not a priv key
      })
    }
  }


  // only used for SIGN BLOCK
  handleSignWorkHashChange = changeEvent => {
    this.signWorkHashChange(changeEvent.target.value)
  }

  signWorkHashChange(hash) {
    if (!nano.checkHash(hash)) {
      if (hash !== '') {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid Hash", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      this.setState({
        signWorkHash: hash,
        validSignWorkHash: false
      })
      return
    }
    // invalidate work if changing previous hash if the work was valid before
    if (this.state.selectedOption === '4') {
      if (this.state.validWork) {
        if (!nano.validateWork({blockHash:hash, work:this.state.work})) {
          if (! toast.isActive(this.inputToast)) {
            this.inputToast = toast("The PoW is no longer valid for the given input hash", helpers.getToast(helpers.toastType.ERROR_AUTO))
          }
        }
      }
    }

    this.setState({
      signWorkHash: hash,
      validSignWorkHash: true
    })
  }

  handleWorkChange = changeEvent => {
    this.workChange(changeEvent.target.value)
  }

  workChange(hash) {
    var failed = false
    if (nano.checkWork(hash)) {
      let sendType = this.state.selectedOption
      // use previous block hash for send, receive and change block
      if (sendType === '0' || sendType === '1' || sendType === '3') {
        if (this.state.validPrevious) {
          if (!nano.validateWork({blockHash:this.state.previous, work:hash})) {
            failed = true
            if (! toast.isActive(this.inputToast)) {
              this.inputToast = toast("The previous hash is no longer valid for the given PoW", helpers.getToast(helpers.toastType.ERROR_AUTO))
            }
          }
        }
        else {
          failed = true
          if (! toast.isActive(this.inputToast)) {
            this.inputToast = toast("Need a valid previous hash to create the JSON block", helpers.getToast(helpers.toastType.ERROR_AUTO))
          }
        }
      }
      // use public key for open block
      else if (sendType === '2') {
        if (this.state.validAddress) {
          let pubKey = nano.derivePublicKey(this.state.address)
          if (!nano.validateWork({blockHash:pubKey, work:hash})) {
            failed = true
            if (! toast.isActive(this.inputToast)) {
              this.inputToast = toast("The address is no longer valid for the given PoW", helpers.getToast(helpers.toastType.ERROR_AUTO))
            }
          }
        }
        else {
          failed = true
          if (! toast.isActive(this.inputToast)) {
            this.inputToast = toast("Need a valid address to create the JSON block", helpers.getToast(helpers.toastType.ERROR_AUTO))
          }
        }
      }
    }
    else {
      failed = true
      if (hash !== '') {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid Work Value", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
    }

    if (failed) {
      this.setState({
        work: hash,
        validWork: false
      },
      function() {
        this.createBlock()
      })
      return
    }
    this.setState({
      work: hash,
      validWork: true
    },function() {
      if (this.state.privKey.length <= 64 || this.state.selectedOption === '4') {
        this.createBlock()
      }
      else {
        this.createBlock(true) //using signature instead of private key
      }
    })
  }

  handleOptionChange = changeEvent => {
    this.optionChange(changeEvent.target.value)
  }
  optionChange(val, clear=true) {
    this.setState({
      selectedOption: val,
      text_address: this.addressText[val],
      text_previous: this.previousText[val],
      text_rep: this.repText[val],
      text_currBalance: this.currBalanceText[val],
      text_link: this.linkText[val],
      title_address: this.addressTitle[val],
      title_previous: this.previousTitle[val],
      title_rep: this.repTitle[val],
      title_currBalance: this.currBalanceTitle[val],
      title_amount: this.amountTitle[val],
      title_link: this.linkTitle[val],
      place_link: this.linkPlace[val],
      place_amount: this.amountPlace[val],
      title_pow: this.powTitle[val],
    },function() {
      if (clear) {
        this.clearAll()
      }
      //If params needs to be saved, don't clear
      else {
        this.setParams()
      }
    })
  }

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
    this.setState({
      qrState: 0,
    })

    switch(this.state.qrActive) {
      case 'address':
      this.setState({
        qrContent: this.state.address,
      })
      break

      case 'link':
      this.setState({
        qrContent: this.state.link,
      })
      break

      case 'previous':
      this.setState({
        qrContent: this.state.previous,
      })
      break

      case 'rep':
      this.setState({
        qrContent: this.state.rep,
      })
      break

      case 'currBalance':
      this.setState({
        qrContent: this.state.currBalanceRaw,
      })
      break

      case 'amount':
      this.setState({
        qrContent: this.state.amount,
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

      case 'signature':
      this.setState({
        qrContent: this.state.signature,
      })
      break

      case 'work':
      this.setState({
        qrContent: this.state.work,
      })
      break

      case 'output':
      this.setState({
        qrContent: this.state.output,
        qrState: 1,
      })
      break

      case 'signWorkHash':
      this.setState({
        qrContent: this.state.signWorkHash,
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

  sampleSet(i) {
    this.setState({
      address: this.sampleText[i].ADDRESS,
      validAddress: true,
      link:this.sampleText[i].LINK,
      validLink: true,
      previous:this.sampleText[i].PREV,
      validPrevious: true,
      rep: this.sampleText[i].REP,
      validRep: true,
      currBalance:this.sampleText[i].BALANCE,
      currBalanceRaw:this.sampleText[i].BALANCE,
      validCurrBalance: true,
      amount: this.sampleText[i].AMOUNT,
      activeAmount: this.amounts[0],
      activeAmountId: '0',
      validAmount: true,
      privKey:this.sampleText[i].PRIV,
      validPrivKey: true,
      work:this.sampleText[i].WORK,
      validWork: true,
      blockHash:this.sampleText[i].BLOCKHASH,
      validBlockHash: true,
      signWorkHash:this.sampleText[i].SIGNWORKHASH,
      validSignWorkHash: true,
      nanoBalanceActive: false,
    },
    function() {
      // warn if work if not matching
      var hash = ''
      if (i === 0 || i === 1 || i === 3) {
        hash = this.state.previous
      }
      else if (i === 2) {
        let pubKey = nano.derivePublicKey(this.state.address)
        hash = pubKey
      }
      else if (i === 4) {
        hash = this.state.signWorkHash
      }
      if (!nano.validateWork({blockHash:hash, work:this.state.work})) {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("The work value does not match", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }

      this.hashBlock()
    })
  }

  sample() {
    switch (this.state.selectedOption) {
      // SEND BLOCK
      case '0':
      this.sampleSet(0)
      break

      // RECEIVE BLOCK
      case '1':
      this.sampleSet(1)
      break

      // OPEN BLOCK
      case '2':
      this.sampleSet(2)
      break

      // CHANGE BLOCK
      case '3':
      this.sampleSet(3)
      break

      // SIGN BLOCK
      case '4':
      this.sampleSet(4)
      break

      default:
      break
    }
  }

  // valid to hash block. Ignore certain checks for certain block types becasuse they are not needed
  isValidHashInputs() {
    return (this.state.validAddress && (this.state.validLink || this.state.selectedOption === '3') && (this.state.validPrevious || this.state.selectedOption === '2') &&
      this.state.validRep && (this.state.validCurrBalance || this.state.selectedOption === '2') && (this.state.validAmount || this.state.selectedOption === '3'))
  }

  // valid to sign block
  isValidSignInputs() {
    return (this.state.validBlockHash && this.state.validPrivKey)
  }

  // Hash a block with block parameters to get a block hash
  hashBlock() {
    this.updateQR()
    // go directly to sign block if coming from SIGN BLOCK
    if (this.state.selectedOption === '4') {
      this.signBlock()
      this.setParams(true) //include block hash in params
      return
    }
    else {
      this.setParams(false)
    }
    if (!this.isValidHashInputs()) {
      this.setState({
        blockHash: 'Invalid inputs',
        validBlockHash: false
      },
      function() {
        this.createBlock()
      })
      return
    }

    var amount = null
    var newBalance = null

    // if NANO unit, convert to raw
    if (this.state.activeAmountId === '0') {
      amount = helpers.MnanoToRaw(this.state.amount)
    }
    else {
      amount = this.state.amount
    }

    switch (this.state.selectedOption) {
      // SEND BLOCK
      case '0':
      newBalance = helpers.bigSubtract(this.state.currBalanceRaw,amount)

      // check that the new balance is not negative
      if (helpers.bigIsNegative(newBalance)) {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("The amount is larger than available balance!", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
        return
      }
      break

      // RECEIVE BLOCK
      case '1':
      newBalance = helpers.bigAdd(this.state.currBalanceRaw,amount)

      // check that the new balance is valid
      if (!nano.checkAmount(newBalance)) {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("The new amount is invalid", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
        return
      }
      break

      // OPEN BLOCK
      case '2':
      newBalance = amount
      break

      // CHANGE BLOCK
      case '3':
      newBalance = this.state.currBalanceRaw
      break

      // SIGN BLOCK
      case '4':
      //do not create block hash (should not ever reach here)
      return

      default:
      break
    }

    // special hash if open block
    var previous = this.state.previous
    if (previous === '') {
      previous = '0000000000000000000000000000000000000000000000000000000000000000'
    }

    // special link if change block
    var link = this.state.link
    if (link === '') {
      link = '0000000000000000000000000000000000000000000000000000000000000000'
    }

    let blockHash = nano.hashBlock({account:this.state.address, link:link, previous:previous, representative: this.state.rep,
    balance: newBalance})
    if (nano.checkKey(blockHash)) {
      this.setState({
        blockHash: blockHash,
        adjustedBalance: newBalance,
        validBlockHash: true,
      },
      function() {
        this.createBlock()
      })
    }
    else {
      this.setState({
        blockHash: 'Failed to create block hash',
        adjustedBalance: null,
        validBlockHash: false,
      })
      if (! toast.isActive(this.inputToast)) {
        this.inputToast = toast("Failed to create block hash. Please contact the developer.", helpers.getToast(helpers.toastType.ERROR_AUTO))
      }
    }
  }

  generateWork() {
    var workInputHash = null
    var threshold = undefined
    let sendType = this.state.selectedOption
    // use previous block hash for send, receive and change block
    if (sendType === '0' || sendType === '1' || sendType === '3') {
      if (this.state.validPrevious) {
        workInputHash = this.state.previous
      }
      if (sendType === '0' || sendType === '3') {
        threshold = this.defaultSendPow
      }
      else if (sendType === '1') {
        threshold = this.defaultGetPow
      }
    }
    // use public key for open block
    else if (sendType === '2') {
      if (this.state.validAddress) {
        workInputHash = nano.derivePublicKey(this.state.address)
      }
      threshold = this.defaultGetPow
    }
    // sign block is using its own input
    else if (sendType === '4') {
      if (this.state.validSignWorkHash) {
        workInputHash = this.state.signWorkHash
      }
    }

    if (workInputHash) {
      try {
        toast("Started generating PoW...", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
        //window.NanoWebglPow(workInputHash,
        webglpow.calculate(workInputHash, threshold, this.webglWidth, this.webglHeight,
          (work, n) => {
              toast("Successfully generated PoW!", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
              this.workChange(work)
          },
          n => {
            toast("Calculated " + helpers.addCommas(n*this.webglWidth * this.webglHeight) + " hashes...", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
          },
          //threshold
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
        return
      }
    }
    else if (this.state.selectedOption !== '2' && this.state.selectedOption !== '4'){
      if (! toast.isActive(this.inputToast)) {
        this.inputToast = toast("Need a valid previous block hash to generate work.", helpers.getToast(helpers.toastType.ERROR_AUTO))
      }
    }
    else if (this.state.selectedOption === '2'){
      if (! toast.isActive(this.inputToast)) {
        this.inputToast = toast("Need a valid opening address to generate work.", helpers.getToast(helpers.toastType.ERROR_AUTO))
      }
    }
    else if (this.state.selectedOption === '4'){
      if (! toast.isActive(this.inputToast)) {
        this.inputToast = toast("Need a valid input hash to generate work.", helpers.getToast(helpers.toastType.ERROR_AUTO))
      }
    }
  }

  // Create the final JSON block representation
  createBlock(hasSignature=false) {
    this.updateQR()
    var subType = ''
    switch (this.state.selectedOption) {
      // SEND BLOCK
      case '0':
      subType = 'send'
      break

      // RECEIVE BLOCK
      case '1':
      subType = 'receive'
      break

      // OPEN BLOCK
      case '2':
      subType = 'open'
      break

      // CHANGE BLOCK
      case '3':
      subType = 'change'
      break

      // SIGN BLOCK
      case '4':
      return // do not create block, we don't have the required input

      default:
      break
    }

    // All input parameters must be valid
    if (!this.state.validWork || !this.isValidHashInputs() || !this.isValidSignInputs()) {
      this.setState({
        output: 'Invalid input parameters...',
        outputRaw: '',
        validOutput: false,
      })
      return
    }

    var block
    var failed = false

    // special previous if open block
    var previous = this.state.previous
    if (previous === '') {
      previous = null
    }

    // special link if change block
    var link = this.state.link
    if (link === '') {
      link = null
    }

    try {
      // create the block using private key
      if (!hasSignature) {
        block = nano.createBlock(this.state.privKey,{balance:this.state.adjustedBalance, representative:this.state.rep,
        work:this.state.work, link:link, previous:previous})
        // replace xrb with nano (old library)
        block.block.account = block.block.account.replace('xrb', 'nano')
        block.block.link_as_account = block.block.link_as_account.replace('xrb', 'nano')
      }
      // create the block using signature
      else {
        if (!previous) {
          previous = '0000000000000000000000000000000000000000000000000000000000000000'
        }
        if (!link) {
          link = '0000000000000000000000000000000000000000000000000000000000000000'
        }

        //Check if link is address or hash
        var linkAddress
        if (nano.checkAddress(link)) {
          linkAddress = link
          link = nano.derivePublicKey(link)
        }
        else if (nano.checkHash(link)) {
          linkAddress = nano.deriveAddress(link, {useNanoPrefix: true})
        }
        block = {hash: this.state.blockHash, block:
          {type:'state', account:this.state.address, previous:previous, representative:this.state.rep, balance:this.state.adjustedBalance,
          link:link, link_as_account:linkAddress, work:this.state.work, signature:this.state.privKey}}
      }

      // check that the new block is valid
      let pubKey = nano.derivePublicKey(block.block.account)
      if (!nano.verifyBlock({hash:block.hash, publicKey:pubKey, signature:block.block.signature})) {
        toast("Invalid block. Contact developer.", helpers.getToast(helpers.toastType.ERROR))
        failed = true
      }
    }
    catch(error) {
      failed = true
      toast("Invalid block. Contact developer.", helpers.getToast(helpers.toastType.ERROR))
      console.log("Invalid block:" + error)
    }

    // Output json formatted block
    if (!failed) {
      // prepare a RPC process command
      var processJson
      if (subType !== '') {
        processJson = {action: "process",  json_block: "true",  subtype:subType, block: block.block}
      }
      // if just signing block and don't know subtype
      else {
        processJson = {action: "process",  json_block: "true", block: block.block}
      }

      this.setState({
        outputRaw: processJson,
        output: JSON.stringify(processJson, null, 2),
        validOutput: true,
      },function() {
        this.updateQR()
      })
    }
    else {
      this.setState({
        output: 'Bad JSON block generated, please contact the developer',
        validOutput: false,
      })
    }
  }

  // Make output JSON one compact line
  oneLine() {
    if (!this.state.jsonOneLine) {
      this.setState({
        output: JSON.stringify(this.state.outputRaw),
        jsonOneLine: true,
        jsonOneLineText: 'Pretty'
      })
    }
    else {
      this.setState({
        output: JSON.stringify(this.state.outputRaw, null, 2),
        jsonOneLine: false,
        jsonOneLineText: 'Simple'
      })
    }
  }

  // Standalone block signing from block hash
  signBlock() {
    this.updateQR()
    if (!this.isValidSignInputs()) {
      this.setState({
        signature: 'Invalid block hash or private key',
      })
      return
    }

    let signature = nano.signBlock({hash:this.state.blockHash, secretKey:this.state.privKey})
    if (nano.checkSignature(signature)) {
      this.setState({
        signature: signature,
      })
    }
    else {
      this.setState({
        signature: 'Invalid signature',
      })
      if (! toast.isActive(this.inputToast)) {
        this.inputToast = toast("Failed to create signature. Please contact the developer.", helpers.getToast(helpers.toastType.ERROR_AUTO))
      }
    }
  }

  // Publish the json block
  publishBlock() {
    if (this.state.validOutput) {
      let outputBlock = this.state.outputRaw
      // set watch_work to false to avoid the endpoint node to recalculate work
      outputBlock.watch_work = 'false'
      this.setState({fetchingRPC: true})
      helpers.postDataTimeout(outputBlock)
      .then((data) => {
        this.setState({fetchingRPC: false})
        if (data.hash) {
          console.log("Processed block hash: "+data.hash)
          if (data.hash === this.state.blockHash) {
            this.inputToast = toast("Successfully processed with given block hash!", helpers.getToast(helpers.toastType.SUCCESS))
          }
          else {
            this.inputToast = toast("Block processed but the hash does not match. Contact dev.", helpers.getToast(helpers.toastType.ERROR_AUTO))
          }
        }
        else {
          this.inputToast = toast("Failed processing block, see console for info (CTRL+F12).", helpers.getToast(helpers.toastType.ERROR_AUTO))
          console.log("Failed processing block: "+data.error)
          this.setState({
            validOutput: false,
          })
        }
      })
      .catch(function(error) {
        this.handleRPCError(error)
      }.bind(this))
    }
    else {
      this.inputToast = toast("There is no valid block to process.", helpers.getToast(helpers.toastType.ERROR_AUTO))
      this.setState({
        validOutput: false,
      })
    }
  }

  // Make RPC call
  getRPC(event) {
    var command = {}
    var value = event.target.value
    switch (value) {
      case 'previous':
      if (this.state.validAddress) {
        command.action = 'account_info'
        command.account = this.state.address
      }
      else {
        this.inputToast = toast("Need a valid address to get frontier hash.", helpers.getToast(helpers.toastType.ERROR_AUTO))
      }
      break

      case 'rep':
      if (this.state.validAddress) {
        command.action = 'account_representative'
        command.account = this.state.address
      }
      else {
        this.inputToast = toast("Need a valid address to get rep.", helpers.getToast(helpers.toastType.ERROR_AUTO))
      }
      break

      case 'currBalance':
      if (this.state.validAddress) {
        command.action = 'account_info'
        command.account = this.state.address
      }
      else {
        this.inputToast = toast("Need a valid address to get current balance.", helpers.getToast(helpers.toastType.ERROR_AUTO))
      }
      break

      case 'pending':
      if (this.state.validAddress) {
        command.action = 'pending'
        command.account = this.state.address
      }
      else {
        this.inputToast = toast("Need a valid address to get pending transactions.", helpers.getToast(helpers.toastType.ERROR_AUTO))
      }
      break

      case 'amount':
      if (this.state.validLink) {
        command.action = 'block_info'
        command.hash = this.state.link
      }
      else {
        this.inputToast = toast("Need a valid Pending to get the amount.", helpers.getToast(helpers.toastType.ERROR_AUTO))
      }
      break

      default:
      break
    }

    if (Object.keys(command).length > 0) {
      this.setState({fetchingRPC: true})
      helpers.postDataTimeout(command)
      .then((data) => {
        this.setState({fetchingRPC: false})
        var fail = false
        switch (value) {
          case 'previous':
          if (data.frontier) {
            this.previousChange(data.frontier)
          }
          else {
            fail = true
          }
          break

          case 'rep':
          if (data.representative) {
            this.repChange(data.representative)
          }
          else {
            fail = true
          }
          break

          case 'currBalance':
          if (data.balance) {
            this.balanceChange(data.balance)
          }
          else {
            fail = true
          }
          break

          case 'pending':
          if (data.blocks) {
            this.linkChange(data.blocks[0])
          }
          else {
            fail = true
          }
          break

          case 'amount':
          if (data.amount) {
            this.amountChange(data.amount,true)
          }
          else {
            fail = true
          }
          break

          default:
          break
        }

        if (fail) {
          this.inputToast = toast("Bad RPC response. See console (CTRL+F12)", helpers.getToast(helpers.toastType.ERROR_AUTO))
          console.log("Bad RPC: "+data.error)
        }
      })
      .catch(function(error) {
        this.handleRPCError(error)
      }.bind(this))
    }
  }

  render() {
    return (
      <div>
        <div className="noprint">
          <p>Dev Wallet to Create, Sign and Publish Blocks</p>
          <ul>
            <li>Inputs can be obtained from a <a href="https://nanocrawler.cc">block explorer</a> and good reps from <a href="https://nanocharts.info/need-a-representative">nanocharts</a></li>
            <li>Live data comes from the <a href="https://node.nanoticker.info/nano.html">NanoTicker node</a>. Advised to double check with an explorer.</li>
            <li><strong>For security:</strong> Transfer the block hash to an offline device (via QR) to return a signature from a private key.</li>
            <li>Hover on text fields to show more details or have a look at this <a href="https://medium.com/nanocurrency/93713d217377">Video Tutorial</a></li>
            <li>The final block can be published from this site but no rework will be done to increase PoW priority</li>
          </ul>
        </div>
        <InputGroup size="sm" className="mb-3">
          <div className="form-check form-check-inline index-checkbox">
            <input className="form-check-input" type="radio" id="send-check" value="0" checked={this.state.selectedOption === "0"} onChange={this.handleOptionChange}/>
            <label className="form-check-label" htmlFor="send-check">SEND</label>
          </div>
          <div className="form-check form-check-inline index-checkbox">
            <input className="form-check-input" type="radio" id="receive-check" value="1" checked={this.state.selectedOption === "1"} onChange={this.handleOptionChange}/>
            <label className="form-check-label" htmlFor="receive-check">RECEIVE</label>
          </div>
          <div className="form-check form-check-inline index-checkbox">
            <input className="form-check-input" type="radio" id="open-check" value="2" checked={this.state.selectedOption === "2"} onChange={this.handleOptionChange}/>
            <label className="form-check-label" htmlFor="open-check">OPEN ACCOUNT</label>
          </div>
          <div className="form-check form-check-inline index-checkbox">
            <input className="form-check-input" type="radio" id="change-check" value="3" checked={this.state.selectedOption === "3"} onChange={this.handleOptionChange}/>
            <label className="form-check-label" htmlFor="change-check">CHANGE REP</label>
          </div>
          <div className="form-check form-check-inline index-checkbox">
            <input className="form-check-input" type="radio" id="sign-check" value="4" checked={this.state.selectedOption === "4"} onChange={this.handleOptionChange}/>
            <label className="form-check-label" htmlFor="sign-check">SIGN BLOCK</label>
          </div>
        </InputGroup>

        <InputGroup size="sm" className={this.state.text_address === 'N/A' ? 'hidden':'mb-3'}>
          <InputGroup.Prepend>
            <InputGroup.Text id="account">
              {this.state.text_address}
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="account" aria-describedby="account" value={this.state.address} title={this.state.title_address} placeholder={this.state.text_address === 'N/A' ? 'Not needed':'nano_xxx... or xrb_xxx...'} maxLength="65" onChange={this.handleAddressChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='address' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.address} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'address' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='address' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className={this.state.text_link === 'N/A' ? 'hidden':'mb-3'}>
          <InputGroup.Prepend>
            <InputGroup.Text id="link">
              {this.state.text_link}
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="link" aria-describedby="link" value={this.state.link} title={this.state.title_link} placeholder={this.state.place_link} maxLength="65" onChange={this.handleLinkChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='link' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className={this.state.selectedOption === "1" || this.state.selectedOption === "2" ? 'fas fa-cloud-download-alt':'hidden'} title="Live network request: The next pending hash" disabled={this.state.fetchingRPC} value='pending' onClick={this.getRPC}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.link} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'link' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='link' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className={this.state.text_previous === 'N/A' ? 'hidden':'mb-3'}>
          <InputGroup.Prepend>
            <InputGroup.Text id="previous">
              {this.state.text_previous}
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="previous" aria-describedby="previous" value={this.state.previous} title={this.state.title_previous} placeholder={this.state.text_previous === 'N/A' ? 'Not needed':'ABC123... or abc123...'} maxLength="64" onChange={this.handlePreviousChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='previous' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-cloud-download-alt" title="Live network request: Frontier hash of the address" disabled={this.state.fetchingRPC} value='previous' onClick={this.getRPC}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.previous} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'previous' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='previous' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className={this.state.text_rep === 'N/A' ? 'hidden':'mb-3'}>
          <InputGroup.Prepend>
            <InputGroup.Text id="rep">
              {this.state.text_rep}
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="rep" aria-describedby="rep" value={this.state.rep} title={this.state.title_rep} placeholder={this.state.text_rep === 'N/A' ? 'Not needed':'nano_xxx... or xrb_xxx...'} maxLength="65" onChange={this.handleRepChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='rep' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className={this.state.selectedOption === "2" ? 'hidden':'fas fa-cloud-download-alt'} title="Live network request: The address representative" disabled={this.state.fetchingRPC} value='rep' onClick={this.getRPC}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.rep} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'rep' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='rep' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className={this.state.text_currBalance === 'N/A' ? 'hidden':'mb-3'}>
          <InputGroup.Prepend>
            <InputGroup.Text id="currBalance">
              {this.state.text_currBalance}
            </InputGroup.Text>
            <Button variant="outline-secondary" className={this.state.nanoBalanceActive ? "btn-active" : ""} title="Show balance in NANO" onClick={this.handleNanoBalance}><strong>N</strong></Button>
          </InputGroup.Prepend>
          <FormControl id="currBalance" aria-describedby="currBalance" value={this.state.currBalance} disabled={this.state.nanoBalanceActive} title={this.state.title_currBalance} placeholder={this.state.text_currBalance === 'N/A' ? 'Not needed':'Current balance in raw'} maxLength="48" onChange={this.handleCurrBalanceChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='currBalance' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-cloud-download-alt" title="Live network request: Current balance of the address" disabled={this.state.fetchingRPC} value='currBalance' onClick={this.getRPC}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.currBalance} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'currBalance' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='currBalance' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className={this.state.title_amount === 'N/A' ? 'hidden':'mb-3'}>
          <InputGroup.Prepend>
            <DropdownButton
              variant="light"
              className="dropdown-prepend"
              title={this.state.activeAmount}
              key={this.state.activeAmountId}
              id={`dropdown-basic-${this.state.activeAmountId}`}>
              {this.amounts.map(function(amount, index){
                return <Dropdown.Item eventKey={index} key={index} onSelect={this.selectAmount}>{amount}</Dropdown.Item>;
              }.bind(this))}
            </DropdownButton>
          </InputGroup.Prepend>
          <FormControl id="amount" aria-describedby="amount" value={this.state.amount} title={this.state.title_amount} placeholder={this.state.place_amount} maxLength="48" onChange={this.handleAmountChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='amount' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className={this.state.selectedOption === "1" || this.state.selectedOption === "2" ? 'fas fa-cloud-download-alt':'hidden'} title="Live network request: The pending amount" disabled={this.state.fetchingRPC} value='amount' onClick={this.getRPC}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.amount} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'amount' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='amount' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <div className={this.state.selectedOption === "4" ? 'hidden':'input-title'}>OUTPUT</div>
        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="blockHash">
              Block Hash
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="blockHash" aria-describedby="blockHash" value={this.state.blockHash} disabled={this.state.selectedOption !== "4"} title="Block hash used together with the private key to create the signature." placeholder="ABC123... or abc123..." maxLength="64" onChange={this.handleBlockHashChange} autoComplete="off"/>
          <InputGroup.Append>
          <Button variant="outline-secondary" className="fas fa-times-circle" value='blockHash' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.blockHash} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'blockHash' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='blockHash' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <div className={this.state.selectedOption === "4" ? 'hidden':'input-title'}>SIGN WITH PRIVATE KEY OR SIGNATURE AND PROVIDE PROOF OF WORK</div>
        <a className="btn-medium" variant="primary" hidden={!this.state.blockHash} href={window.location.href.split('/').slice(0, 3).join('/') + "/?tool=multisig&parties=2&hash=" + this.state.blockHash} target="_blank">Optional: Create Multi-Signature from the Block Hash</a>
        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="privKey">
              {this.state.selectedOption === "4" ? "Private Key": "Key/Signature"}
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="privKey" aria-describedby="privKey" value={this.state.privKey} title={this.state.selectedOption === "4" ? "Account's 64 length private key for signing the block hash": "Account's 64 length private key for signing the block hash or 128 length block signature"} placeholder="ABC123... or abc123..." maxLength="128" onChange={this.handlePrivKeyChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='privKey' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.privKey} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'privKey' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='privKey' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className={this.state.selectedOption !== "4" ? 'hidden':'mb-3'}>
          <InputGroup.Prepend>
            <InputGroup.Text id="signature">
              Signature
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="signature" aria-describedby="signature" value={this.state.signature} disabled title="Final signature to be used when publishing the block on-chain." placeholder="Final output..."/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='signature' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.signature} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'signature' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='signature' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <div className={this.state.selectedOption !== "4" ? 'hidden':''}>OPTIONALLY PROVIDE PROOF OF WORK</div>
        <InputGroup size="sm" className={this.state.selectedOption === '4' ? 'mb-3':'hidden'}>
          <InputGroup.Prepend>
            <InputGroup.Text id="signWorkHash">
              Work Hash
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="signWorkHash" aria-describedby="signWorkHash" value={this.state.signWorkHash} title="64 char hex hash for generating work." placeholder="ABC123... or abc123..." maxLength="64" onChange={this.handleSignWorkHashChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='signWorkHash' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.signWorkHash} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'signWorkHash' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='signWorkHash' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>
        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="pow">
              PoW
            </InputGroup.Text>
            <Button variant="outline-secondary" className="fas fa-hammer" value='work' title="Use webGL and the GPU to calculate work now. It may take a few seconds." onClick={this.generateWork}></Button>
          </InputGroup.Prepend>
          <FormControl id="pow" aria-describedby="pow" value={this.state.work} disabled={this.state.selectedOption === '4'} title={this.state.title_pow} placeholder="ABC123... or abc123..." maxLength="16" onChange={this.handleWorkChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='work' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.work} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'work' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='work' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className={this.state.selectedOption === '4' ? 'hidden':'mb-3'}>
          <InputGroup.Prepend>
            <InputGroup.Text id="output">
              Process Command
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="output-area" aria-describedby="output" as="textarea" rows="4" placeholder="" value={this.state.output} readOnly/>
          <InputGroup.Append>
            <Button variant="outline-secondary" onClick={this.oneLine}>{this.state.jsonOneLineText}</Button>
            <Button variant="outline-secondary" className="fas fa-copy" onClick={helpers.copyOutput}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'output' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='output' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <Button className="btn-medium" variant="primary" onClick={this.sample}>Sample</Button>
          <Button className="btn-medium" variant="primary" disabled={!this.state.validOutput || this.state.fetchingRPC} onClick={this.publishBlock}>Publish Block</Button>
          <Button className="btn-medium" variant="primary" onClick={this.clearAll}>Clear All</Button>
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
export default SigningTool
