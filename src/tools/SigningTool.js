import React, { Component } from 'react'
import * as nano from 'nanocurrency'
import { Dropdown, DropdownButton, InputGroup, FormControl, Button} from 'react-bootstrap'
import * as helpers from '../helpers'
import MainPage from '../mainPage'
import {toast } from 'react-toastify'
import 'nano-webgl-pow'
import QrImageStyle from './components/qrImageStyle'
const toolParam = 'sign'

class SigningTool extends Component {
  constructor(props) {
    super(props)

    this.addressText = [
      'Sending Address',
      'Receiving Address',
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
      'Current Balance',
      'Current Balance',
      'N/A',
      'Current Balance',
      'N/A',
    ]

    this.amountText = [
      'Amount NANO',
      'Amount raw',
    ]

    this.linkText = [
      'Receiving Address',
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
      'The last recorded block hash for the sending address.',
      'The last recorded block hash for the receiving address.',
      'N/A',
      'The last recorded block hash for the account address.',
      'N/A',
    ]

    this.repTitle = [
      'The sending account\'s representative. If it differs from currently set, it will force a change to the new one.',
      'The receving account\'s representative. If it differs from currently set, it will force a change to the new one.',
      'The receving account\'s representative. If it differs from currently set, it will force a change to the new one.',
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

    // PLACEHOLDERS
    this.linkPlace = [
      'nano_xxx... or xrb_xxx...',
      'ABC123... or abc123...',
      'ABC123... or abc123...',
      'Not needed',
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
        PRIV: '4F30562EB814E3576C5ADA81F6C64E9E858C175D6099ADAB01AA75BBC176F45C',
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
        PRIV: '4F30562EB814E3576C5ADA81F6C64E9E858C175D6099ADAB01AA75BBC176F45C',
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
        PRIV: '4F30562EB814E3576C5ADA81F6C64E9E858C175D6099ADAB01AA75BBC176F45C',
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
        PRIV: '4F30562EB814E3576C5ADA81F6C64E9E858C175D6099ADAB01AA75BBC176F45C',
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
        PRIV: '4F30562EB814E3576C5ADA81F6C64E9E858C175D6099ADAB01AA75BBC176F45C',
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
      amount: '',
      link: '',
      privKey: '',
      blockHash: '',
      signature: '',
      work: '',
      output: '',
      signWorkHash: '', //special work hash field for sign block option
      validAddress: false,
      validPrevious: false,
      validRep: false,
      validCurrBalance: false,
      validAmount: false,
      validLink: false,
      validPrivKey: false,
      validBlockHash: false,
      validSignature: false,
      validWork: false,
      validSignWorkHash: false,
      selectedOption: '0',
      qrActive: '',
      qrContent: '',
      qrHidden: true,
      qrSize: 512,
      qrState: 0,  //qr size
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
      activeAmount: this.amounts[0],
      activeAmountId: '0', // NANO=0, raw=1
    }

    this.clearText = this.clearText.bind(this)
    this.clearAll = this.clearAll.bind(this)
    this.sample = this.sample.bind(this)
    this.updateQR = this.updateQR.bind(this)
    this.selectAmount = this.selectAmount.bind(this)
    this.generateWork = this.generateWork.bind(this)
    this.double = this.double.bind(this)

    // Tuning for webGL PoW performance. 512 is default load
    this.webGLWidth = 512
    this.webGLHeight = 1024
  }

  // Init component
  componentDidMount() {
    window.NanoWebglPow.width = this.webGLWidth
    window.NanoWebglPow.height = this.webGLHeight

    // Read URL params from parent and construct new quick path
    var type = this.props.state.type
    var address = this.props.state.address
    var link = this.props.state.link
    var previous = this.props.state.previous
    var rep = this.props.state.rep
    var balance = this.props.state.balance
    var amount = this.props.state.amount
    var hash = this.props.state.hash

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
    if (hash) {
      this.blockHashChange(hash)
    }

    if (!type && !address && !link && !previous && !rep && !balance &&!amount && !hash) {
      this.setParams()
    }
  }

  // Defines the url params
  setParams(includeHash=false) {
    var params = '?tool='+toolParam + '&type='+this.state.selectedOption + '&address='+this.state.address + '&link='+this.state.link +
    '&previous='+this.state.previous + '&rep='+this.state.rep + '&balance='+this.state.currBalance + '&amount='+this.state.amount

    // Only include hash in parameters when requested
    if (includeHash) {
      params = params + '&hash='+this.state.blockHash
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
        validSignature: false
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
      amount: '',
      link: '',
      privKey: '',
      blockHash: '',
      signature: '',
      work: '',
      output: '',
      signWorkHash: '',
      validAddress: false,
      validPrevious: this.state.selectedOption === '2' ? true:false, //previous not used for open blocks
      validRep: false,
      validCurrBalance: this.state.selectedOption === '2' ? true:false, //balance not used for open blocks
      validAmount: this.state.selectedOption === '3' ? true:false, //amount not used for change blocks
      validLink: this.state.selectedOption === '3' ? true:false, //link not used for change blocks
      validPrivKey: false,
      validBlockHash: false,
      validSignature: false,
      validWork: false,
      validSignWorkHash: false,
      qrActive: '',
      qrContent: '',
      qrHidden: true,
    },function() {
      if (this.state.selectedOption === '4') {
        this.setParams(true) //include block hash in params
      }
      else {
        this.setParams(false)
      }
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

  // Change active amount unit on dropdown select
  selectAmount(eventKey, event) {
    this.setState({
      activeAmount: this.amounts[eventKey],
      activeAmountId: eventKey,
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
        new MainPage().notifyInvalidFormat()
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
        toast("The address does not match the private key given", helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
      }
    }

    // invalidate work if changing address if the work was valid before
    // only for open block since is based on public key (address)
    let sendType = this.state.selectedOption
    if (sendType === '2') {
      if (this.state.validWork) {
        let pubKey = nano.derivePublicKey(address)
        if (!nano.validateWork({blockHash:pubKey, work:this.state.work})) {
          toast("The PoW is no longer valid for the given address.", helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
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
        new MainPage().notifyInvalidFormat()
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
        new MainPage().notifyInvalidFormat()
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
          toast("The PoW is no longer valid for the given previous hash.", helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
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
        new MainPage().notifyInvalidFormat()
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
        new MainPage().notifyInvalidFormat()
      }
      this.setState({
        currBalance: balance,
        validCurrBalance: false
      },
      function() {
        this.hashBlock()
      })
      return
    }
    this.setState({
      currBalance: balance,
      validCurrBalance: true,
    },
    function() {
      this.hashBlock()
    })
  }

  handleAmountChange = changeEvent => {
    this.amountChange(changeEvent.target.value)
  }

  amountChange(amount) {
    //convert to raw if needed
    var raw = amount
    if (this.state.activeAmountId === '0') {
      raw = helpers.MnanoToRaw(amount)
    }
    if (!nano.checkAmount(raw)) {
      // do not warn when start typing dot
      if (amount !== '' && amount[amount.length -1] !== '.') {
        new MainPage().notifyInvalidFormat()
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

  handleBlockHashChange = changeEvent => {
    this.blockHashChange(changeEvent.target.value)
  }

  blockHashChange(hash) {
    if (!nano.checkHash(hash)) {
      if (hash !== '') {
        new MainPage().notifyInvalidFormat()
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
    if (!nano.checkKey(hash)) {
      if (hash !== '') {
        new MainPage().notifyInvalidFormat()
      }
      this.setState({
        privKey: hash,
        validPrivKey: false
      },
      function() {
        this.signBlock()
      })
      return
    }
    // check that the private key actually correspond to the address provided. Do not do for SIGN BLOCK
    if (this.state.validAddress && this.state.selectedOption !== '4') {
      let address = this.state.address.replace('xrb', 'nano')
      let pubKey = nano.derivePublicKey(hash)
      let derivedAddress = nano.deriveAddress(pubKey, {useNanoPrefix: true})
      if (derivedAddress !== address) {
        toast("The private key does not match the address given", helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
      }
    }
    this.setState({
      privKey: hash,
      validPrivKey: true
    },function() {
      this.signBlock()
    })
  }

  // only used for SIGN BLOCK
  handleSignWorkHashChange = changeEvent => {
    this.signWorkHashChange(changeEvent.target.value)
  }

  signWorkHashChange(hash) {
    if (!nano.checkHash(hash)) {
      if (hash !== '') {
        new MainPage().notifyInvalidFormat()
      }
      this.setState({
        signWorkHash: hash,
        validSignWorkHash: false
      },
      function() {
        this.hashBlock()
      })
      return
    }
    // invalidate work if changing previous hash if the work was valid before
    // only for send, receive and change because work for open block is based on public key
    if (this.state.selectedOption === '4') {
      if (this.state.validWork) {
        if (!nano.validateWork({blockHash:hash, work:this.state.work})) {
          toast("The PoW is no longer valid for the given input hash.", helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
        }
      }
    }

    this.setState({
      signWorkHash: hash,
      validSignWorkHash: true
    },
    function() {
      this.hashBlock()
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
            toast("The previous hash is no longer valid for the given PoW.", helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
          }
        }
        else {
          failed = true
          toast("Need a valid previous hash to create the JSON block", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      // use public key for open block
      else if (sendType === '2') {
        if (this.state.validAddress) {
          let pubKey = nano.derivePublicKey(this.state.address)
          if (!nano.validateWork({blockHash:pubKey, work:hash})) {
            failed = true
            toast("The address is no longer valid for the given PoW.", helpers.getToast(helpers.toastType.ERROR))
          }
        }
        else {
          failed = true
          toast("Need a valid address to create the JSON block", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
    }
    else {
      failed = true
      if (hash !== '') {
        new MainPage().notifyInvalidFormat()
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
      this.createBlock()
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
        qrContent: this.state.currBalance,
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
      validCurrBalance: true,
      amount: this.sampleText[i].AMOUNT,
      validAmount: true,
      privKey:this.sampleText[i].PRIV,
      validPrivKey: true,
      work:this.sampleText[i].WORK,
      validWork: true,
      blockHash:this.sampleText[i].BLOCKHASH,
      validBlockHash: true,
      signWorkHash:this.sampleText[i].SIGNWORKHASH,
      validSignWorkHash: true,
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
        toast("The work value does not match", helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
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
        this.signBlock()
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
      newBalance = helpers.bigSubtract(this.state.currBalance,amount)

      // check that the new balance is not negative
      if (helpers.bigIsNegative(newBalance)) {
        toast("The amount is larger than available balance!", helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
        return
      }
      break

      // RECEIVE BLOCK
      case '1':
      newBalance = helpers.bigAdd(this.state.currBalance,amount)

      // check that the new balance is valid
      if (!nano.checkAmount(newBalance)) {
        toast("The new amount is invalid", helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
        return
      }
      break

      // OPEN BLOCK
      case '2':
      newBalance = amount
      break

      // CHANGE BLOCK
      case '3':
      newBalance = this.state.currBalance
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
        this.signBlock()
      })
    }
    else {
      this.setState({
        blockHash: 'Failed to create block hash',
        adjustedBalance: null,
        validBlockHash: false,
      })
      toast("Failed to create block hash. Please contact the developer.", helpers.getToast(helpers.toastType.ERROR))
    }
  }

  // Sign a block hash with private key to get a signature
  signBlock() {
    this.updateQR()
    if (!this.isValidSignInputs()) {
      this.setState({
        signature: 'Invalid inputs',
        validSignature: false
      },
      function() {
        this.createBlock()
      })
      return
    }

    let signature = nano.signBlock({hash:this.state.blockHash, secretKey:this.state.privKey})
    if (nano.checkSignature(signature)) {
      this.setState({
        signature: signature,
        validSignature: true,
      },
      function() {
        this.createBlock()
      })
    }
    else {
      this.setState({
        signature: 'Failed to create signature',
        validSignature: false,
      },
      function() {
        this.createBlock()
      })
      toast("Failed to create signature. Please contact the developer.", helpers.getToast(helpers.toastType.ERROR))
    }
  }

  generateWork() {
    var workInputHash = null
    let sendType = this.state.selectedOption
    // use previous block hash for send, receive and change block
    if (sendType === '0' || sendType === '1' || sendType === '3') {
      if (this.state.validPrevious) {
        workInputHash = this.state.previous
      }
    }
    // use public key for open block
    else if (sendType === '2') {
      if (this.state.validAddress) {
        workInputHash = nano.derivePublicKey(this.state.address)
      }
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
        window.NanoWebglPow(workInputHash,
          (work, n) => {
              toast("Successfully generated PoW!", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
              this.workChange(work)
          },
          n => {
            toast("Calculated " + helpers.addCommas(n*window.NanoWebglPow.width * window.NanoWebglPow.height) + " hashes...", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
          }
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
      toast("Need a valid previous block hash to generate work.", helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
    }
    else if (this.state.selectedOption === '2'){
      toast("Need a valid opening address to generate work.", helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
    }
    else if (this.state.selectedOption === '4'){
      toast("Need a valid input hash to generate work.", helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
    }
  }

  // Create the final JSON block representation
  createBlock() {
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
        output: 'Invalid input parameters...'
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
      // create the block
      block = nano.createBlock(this.state.privKey,{balance:this.state.adjustedBalance, representative:this.state.rep,
      work:this.state.work, link:link, previous:previous})

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
        output: JSON.stringify(processJson, null, 2)
      })
    }
    else {
      this.setState({
        output: 'Bad JSON block generated, please contact the developer'
      })
    }
  }

  render() {
    return (
      <div>
        <div className="noprint">
          <p>Create and Sign blocks off-chain to be published with an on-chain node</p>
          <ul>
            <li>Most of the inputs can be obtained from a <a href="https://nanocrawler.cc">block explorer</a></li>
            <li>PoW can be done directly with this tool or done elsewhere</li>
            <li>For simplicity, the final JSON block can be published directly via <a href="https://nanoo.tools/nano-rpc-playground">RPC Playground</a></li>
            <li>Hover on text fields to show more details or have a look at this <a href="#">Video Tutorial</a></li>
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
            <input className="form-check-input" type="radio" id="change-check" value="4" checked={this.state.selectedOption === "4"} onChange={this.handleOptionChange}/>
            <label className="form-check-label" htmlFor="change-check">SIGN BLOCK</label>
          </div>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <Button variant="primary" onClick={this.sample}>Sample</Button>
          <Button variant="primary" onClick={this.clearAll}>Clear All</Button>
        </InputGroup>

        <InputGroup size="sm" className={this.state.text_address === 'N/A' ? 'hidden':'mb-3'}>
          <InputGroup.Prepend>
            <InputGroup.Text id="address">
              {this.state.text_address}
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="address" aria-describedby="address" value={this.state.address} title={this.state.title_address} placeholder={this.state.text_address === 'N/A' ? 'Not needed':'nano_xxx... or xrb_xxx...'} maxLength="65" onChange={this.handleAddressChange}/>
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
          <FormControl id="link" aria-describedby="link" value={this.state.link} title={this.state.title_link} placeholder={this.state.place_link} maxLength="65" onChange={this.handleLinkChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='link' onClick={this.clearText}></Button>
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
          <FormControl id="previous" aria-describedby="previous" value={this.state.previous} title={this.state.title_previous} placeholder={this.state.text_previous === 'N/A' ? 'Not needed':'ABC123... or abc123...'} maxLength="64" onChange={this.handlePreviousChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='previous' onClick={this.clearText}></Button>
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
          <FormControl id="rep" aria-describedby="rep" value={this.state.rep} title={this.state.title_rep} placeholder={this.state.text_rep === 'N/A' ? 'Not needed':'nano_xxx... or xrb_xxx...'} maxLength="65" onChange={this.handleRepChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='rep' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.rep} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'rep' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='rep' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className={this.state.text_currBalance === 'N/A' ? 'hidden':'mb-3'}>
          <InputGroup.Prepend>
            <InputGroup.Text id="currBalance">
              {this.state.text_currBalance}
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="currBalance" aria-describedby="currBalance" value={this.state.currBalance} title={this.state.title_currBalance} placeholder={this.state.text_currBalance === 'N/A' ? 'Not needed':'Current balance in raw'} maxLength="48" onChange={this.handleCurrBalanceChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='currBalance' onClick={this.clearText}></Button>
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
          <FormControl id="amount" aria-describedby="amount" value={this.state.amount} title={this.state.title_amount} placeholder={this.state.title_amount === 'N/A' ? 'Not needed':'Amount to be sent'} maxLength="48" onChange={this.handleAmountChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='amount' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.amount} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'amount' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='amount' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <div className={this.state.selectedOption === "4" ? 'hidden':''}>OUTPUT</div>
        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="blockHash">
              Block Hash
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="blockHash" aria-describedby="blockHash" value={this.state.blockHash} disabled={this.state.selectedOption !== "4"} title="Block hash used together with the private key to create the signature." placeholder="ABC123... or abc123..." maxLength="64" onChange={this.handleBlockHashChange}/>
          <InputGroup.Append>
          <Button variant="outline-secondary" className="fas fa-times-circle" value='blockHash' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.blockHash} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'blockHash' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='blockHash' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <div className={this.state.selectedOption === "4" ? 'hidden':''}>SIGN BLOCK HASH</div>
        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="privKey">
              Private Key
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="privKey" aria-describedby="privKey" value={this.state.privKey} title="Account's private key for signing the block hash" placeholder="ABC123... or abc123..." maxLength="64" onChange={this.handlePrivKeyChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='privKey' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.privKey} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'privKey' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='privKey' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
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

        GENERATED WORK
        <InputGroup size="sm" className={this.state.selectedOption === '4' ? 'mb-3':'hidden'}>
          <InputGroup.Prepend>
            <InputGroup.Text id="signWorkHash">
              Input Hash
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="signWorkHash" aria-describedby="signWorkHash" value={this.state.signWorkHash} title="64 char hex hash for generating work." placeholder="ABC123... or abc123..." maxLength="64" onChange={this.handleSignWorkHashChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='signWorkHash' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.signWorkHash} onClick={helpers.copyText}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'signWorkHash' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='signWorkHash' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>
        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="work">
              PoW
            </InputGroup.Text>
            <Button variant="outline-secondary" className="fas fa-hammer" value='work' title="Use webGL and the GPU to calculate work now. It may take a few seconds." onClick={this.generateWork}></Button>
          </InputGroup.Prepend>
          <FormControl id="work" aria-describedby="work" value={this.state.work} disabled={this.state.selectedOption === '4'} title="The generated proof of work for given input." placeholder="ABC123... or abc123..." maxLength="16" onChange={this.handleWorkChange}/>
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
          <FormControl id="output-area" aria-describedby="output" as="textarea" rows="6" placeholder="" value={this.state.output} readOnly/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-copy" onClick={helpers.copyOutput}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'output' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='output' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
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
