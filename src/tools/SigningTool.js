import React, { Component } from 'react'
import * as nano from 'nanocurrency'
import { Dropdown, DropdownButton, InputGroup, FormControl, Button} from 'react-bootstrap'
import QrImageStyle from '../modules/qrImageStyle'
import * as helpers from '../helpers'
import MainPage from '../mainPage'
import {toast } from 'react-toastify'

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

    this.sampleSend = {
      ADDRESS: 'nano_1xmastiputrdrhnf35jdh4yj1q339tyuk86w3k6oy5knede8zfowpa1rgjpn',
      LINK: 'nano_1xmastreedxwfhpktqxppwgwwhdx1p6hiskpw7jt8g5y19khyy38axg4tohm',
      PREV: 'B320F9AD2C3341E0FA6EFAF093C2D618036D10DB800F14830A928A44B8DD265C',
      REP: 'nano_3rw4un6ys57hrb39sy1qx8qy5wukst1iiponztrz9qiz6qqa55kxzx4491or',
      BALANCE: '5080000000000000000000000000000',
      AMOUNT: '5.08',
      PRIV: '4F30562EB814E3576C5ADA81F6C64E9E858C175D6099ADAB01AA75BBC176F45C',
    }

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
      validAddress: false,
      validPrevious: false,
      validRep: false,
      validCurrBalance: false,
      validAmount: false,
      validLink: false,
      validPrivKey: false,
      validBlockHash: false,
      validSignature: false,
      selectedOption: '0',
      qrContent: '',
      qrHidden: true,
      qrSize: 512,
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
    this.sample = this.sample.bind(this)
    this.updateQR = this.updateQR.bind(this)
    this.selectAmount = this.selectAmount.bind(this)
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
        this.updateQR()
        this.hashBlock()
      })
      break

      case 'link':
      this.setState({
        link: '',
        validLink: false
      },
      function() {
        this.updateQR()
        this.ashBlock()
      })
      break

      case 'previous':
      this.setState({
        previous: '',
        validPrevious: false
      },
      function() {
        this.updateQR()
        this.hashBlock()
      })
      break

      case 'rep':
      this.setState({
        rep: '',
        validRep: false
      },
      function() {
        this.updateQR()
        this.hashBlock()
      })
      break

      case 'currBalance':
      this.setState({
        currBalance: '',
        validCurrBalance: false
      },
      function() {
        this.updateQR()
        this.hashBlock()
      })
      break

      case 'amount':
      this.setState({
        amount: '',
        validAmount: false
      },
      function() {
        this.updateQR()
        this.hashBlock()
      })
      break

      case 'privKey':
      this.setState({
        privKey: '',
        validPrivKey: false
      },
      function() {
        this.updateQR()
        this.hashBlock()
      })
      break

      case 'blockHash':
      this.setState({
        blockHash: '',
        validBlockHash: false
      },
      function() {
        this.updateQR()
        this.hashBlock()
      })
      break

      case 'signature':
      this.setState({
        signature: '',
        validSignature: false
      },
      function() {
        this.updateQR()
        this.hashBlock()
      })
      break

      default:
        break
    }
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
        validAmount: false
      },
      function() {
        this.hashBlock()
      })
      return
    }
    this.setState({
      currBalance: balance,
      validAmount: true,
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

  handleBlochHashChange = changeEvent => {
    this.blockHashChange(changeEvent.target.value)
  }

  blockHashChange(hash) {
    if (!nano.checkKey(hash)) {
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
    this.setState({
      privKey: hash,
      validPrivKey: true
    },function() {
      this.signBlock()
    })
  }

  updateQR() {

  }

  sample() {
    this.setState({
      address: this.sampleSend.ADDRESS,
      validAddress: true,
      link:this.sampleSend.LINK,
      validLink: true,
      previous:this.sampleSend.PREV,
      validPrevious: true,
      rep: this.sampleSend.REP,
      validRep: true,
      currBalance:this.sampleSend.BALANCE,
      validCurrBalance: true,
      amount: this.sampleSend.AMOUNT,
      validAmount: true,
      privKey:this.sampleSend.PRIV,
      validPrivKey: true,
    },
    function() {
      this.hashBlock()
      this.updateQR()
    })
  }

  // valid to hash block
  isValidHashInputs() {
    return (this.state.validAddress && this.state.validLink && this.state.validPrevious &&
      this.state.validRep && this.state.validCurrBalance && this.state.validAmount)
  }

  // valid to sign block
  isValidSignInputs() {
    return (this.state.validBlockHash && this.state.validPrivKey)
  }

  // Hash a block with block parameters to get a block hash
  hashBlock() {
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
    switch (this.state.selectedOption) {
      // SEND BLOCK
      case '0':
      // if NANO unit, convert to raw
      if (this.state.activeAmountId === '0') {
        amount = helpers.MnanoToRaw(this.state.amount)
      }
      else {
        amount = this.state.amount
      }
      newBalance = helpers.bigSubtract(this.state.currBalance,amount)

      // check that the new balance is not negative
      if (helpers.bigIsNegative(newBalance)) {
        toast("The amount is larger than available balance!", helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
        return
      }
      break

      default:
      break
    }

    let blockHash = nano.hashBlock({account:this.state.address, link:this.state.link, previous:this.state.previous, representative: this.state.rep,
    balance: newBalance})
    if (nano.checkKey(blockHash)) {
      this.setState({
        blockHash: blockHash,
        validBlockHash: true,
      },
      function() {
        this.signBlock()
      })
    }
    else {
      this.setState({
        blockHash: 'Failed to create block hash',
        validBlockHash: false,
      })
      toast("Failed to create block hash. Please contact the developer.", helpers.getToast(helpers.toastType.ERROR))
    }
  }

  // Sign a block hash with private key to get a signature
  signBlock() {
    if (!this.isValidSignInputs()) {
      this.setState({
        signature: 'Invalid inputs',
        validSignature: false
      })
      return
    }

    let signature = nano.signBlock({hash:this.state.blockHash, secretKey:this.state.privKey})
    if (nano.checkSignature(signature)) {
      this.setState({
        signature: signature,
        validSignature: true,
      })
    }
    else {
      this.setState({
        signature: 'Failed to create signature',
        validSignature: false,
      })
      toast("Failed to create signature. Please contact the developer.", helpers.getToast(helpers.toastType.ERROR))
    }
  }

  handleOptionChange = changeEvent => {
    let val = changeEvent.target.value
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
    })
}

  render() {
    return (
      <div>
        <div className="noprint">
          <p>Create and Sign blocks off-chain to be published with an on-chain node</p>
          <ul>
            <li>Most of the inputs can be obtained from a <a href="https://nanocrawler.cc">block explorer</a></li>
            <li>You can get the current raw balance with "action":"account_balance" or publish the final JSON block directly via <a href="https://nanoo.tools/nano-rpc-playground">RPC Playground</a></li>
            <li>Generating work is optional and can be done elsewhere using the previous block hash</li>
            <li>Hover on text fields to show more details</li>
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
        </InputGroup>

        <InputGroup size="sm" className={this.state.text_address === 'N/A' ? 'hidden':'mb-3'}>
          <InputGroup.Prepend>
            <InputGroup.Text id="address">
              {this.state.text_address}
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="address" aria-describedby="address" value={this.state.address} title={this.state.title_address} placeholder={this.state.text_address === 'N/A' ? 'Not needed':'nano_xxx... or xrb_xxx...'} onChange={this.handleAddressChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='address' onClick={this.clearText.bind(this)}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.address} onClick={helpers.copyText.bind(this)}></Button>
            <Button variant="outline-secondary" className={this.state.signatureActive === 'signature' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='address' onClick={this.updateQR.bind(this)}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className={this.state.text_link === 'N/A' ? 'hidden':'mb-3'}>
          <InputGroup.Prepend>
            <InputGroup.Text id="link">
              {this.state.text_link}
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="link" aria-describedby="link" value={this.state.link} title={this.state.title_link} placeholder={this.state.place_link} onChange={this.handleLinkChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='link' onClick={this.clearText.bind(this)}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.link} onClick={helpers.copyText.bind(this)}></Button>
            <Button variant="outline-secondary" className={this.state.signatureActive === 'signature' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='link' onClick={this.updateQR.bind(this)}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className={this.state.text_previous === 'N/A' ? 'hidden':'mb-3'}>
          <InputGroup.Prepend>
            <InputGroup.Text id="previous">
              {this.state.text_previous}
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="previous" aria-describedby="previous" value={this.state.previous} title={this.state.title_previous} placeholder={this.state.text_previous === 'N/A' ? 'Not needed':'ABC123... or abc123...'} onChange={this.handlePreviousChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='previous' onClick={this.clearText.bind(this)}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.previous} onClick={helpers.copyText.bind(this)}></Button>
            <Button variant="outline-secondary" className={this.state.signatureActive === 'signature' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='previous' onClick={this.updateQR.bind(this)}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className={this.state.text_rep === 'N/A' ? 'hidden':'mb-3'}>
          <InputGroup.Prepend>
            <InputGroup.Text id="rep">
              {this.state.text_rep}
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="rep" aria-describedby="rep" value={this.state.rep} title={this.state.title_rep} placeholder={this.state.text_rep === 'N/A' ? 'Not needed':'nano_xxx... or xrb_xxx...'} onChange={this.handleRepChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='rep' onClick={this.clearText.bind(this)}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.rep} onClick={helpers.copyText.bind(this)}></Button>
            <Button variant="outline-secondary" className={this.state.signatureActive === 'signature' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='rep' onClick={this.updateQR.bind(this)}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className={this.state.text_currBalance === 'N/A' ? 'hidden':'mb-3'}>
          <InputGroup.Prepend>
            <InputGroup.Text id="currBalance">
              {this.state.text_currBalance}
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="currBalance" aria-describedby="currBalance" value={this.state.currBalance} title={this.state.title_currBalance} placeholder={this.state.text_currBalance === 'N/A' ? 'Not needed':'Current balance in raw'} onChange={this.handleCurrBalanceChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='currBalance' onClick={this.clearText.bind(this)}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.currBalance} onClick={helpers.copyText.bind(this)}></Button>
            <Button variant="outline-secondary" className={this.state.signatureActive === 'signature' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='currBalance' onClick={this.updateQR.bind(this)}></Button>
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
          <FormControl id="amount" aria-describedby="amount" value={this.state.amount} title={this.state.title_amount} placeholder={this.state.title_amount === 'N/A' ? 'Not needed':'Amount to be sent'} onChange={this.handleAmountChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='amount' onClick={this.clearText.bind(this)}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.amount} onClick={helpers.copyText.bind(this)}></Button>
            <Button variant="outline-secondary" className={this.state.signatureActive === 'signature' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='amount' onClick={this.updateQR.bind(this)}></Button>
          </InputGroup.Append>
        </InputGroup>

        <div className={this.state.selectedOption === "4" ? 'hidden':''}>OUTPUT</div>
        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="blockHash">
              Block Hash
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="blockHash" aria-describedby="blockHash" value={this.state.blockHash} disabled={this.state.selectedOption !== "4"} title="Block hash used together with the private key to create the signature." placeholder="ABC123... or abc123..." onChange={this.handleBlockHashChange}/>
          <InputGroup.Append>
          <Button variant="outline-secondary" className="fas fa-times-circle" value='blockHash' onClick={this.clearText.bind(this)}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.blockHash} onClick={helpers.copyText.bind(this)}></Button>
            <Button variant="outline-secondary" className={this.state.signatureActive === 'blockHash' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='blockHash' onClick={this.updateQR.bind(this)}></Button>
          </InputGroup.Append>
        </InputGroup>

        <div className={this.state.selectedOption === "4" ? 'hidden':''}>SIGN BLOCK HASH</div>
        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="privKey">
              Private Key
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="privKey" aria-describedby="privKey" value={this.state.privKey} title="Account's private key for signing the block hash" placeholder="ABC123... or abc123..." onChange={this.handlePrivKeyChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='privKey' onClick={this.clearText.bind(this)}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.privKey} onClick={helpers.copyText.bind(this)}></Button>
            <Button variant="outline-secondary" className={this.state.signatureActive === 'signature' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='privKey' onClick={this.updateQR.bind(this)}></Button>
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
            <Button variant="outline-secondary" className="fas fa-times-circle" value='signature' onClick={this.clearText.bind(this)}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.signature} onClick={helpers.copyText.bind(this)}></Button>
            <Button variant="outline-secondary" className={this.state.signatureActive === 'signature' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='signature' onClick={this.updateQR.bind(this)}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="output">
              JSON Block
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="output-area" aria-describedby="output" as="textarea" rows="6" placeholder="" value={this.state.output} readOnly/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-copy" onClick={helpers.copyOutput}></Button>
            <Button variant="outline-secondary" className={this.state.signatureActive === 'output' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='output' onClick={this.updateQR.bind(this)}></Button>
          </InputGroup.Append>
        </InputGroup>

        <div className={ this.state.qrHidden ? "hidden" : "QR-container"}>
          <QrImageStyle className="QR-img-payment" content={this.state.qrContent} size={this.state.qrSize} />
        </div>
      </div>
    )
  }
}
export default SigningTool
