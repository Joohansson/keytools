import React, { Component } from 'react'
import { Dropdown, DropdownButton, InputGroup, FormControl, Button} from 'react-bootstrap'
import * as helpers from '../helpers'
import {toast } from 'react-toastify'
import * as nano from 'nanocurrency'
import QrImageStyle from './components/qrImageStyle'
const toolParam = 'inspector'

class InspectTool extends Component {
  constructor(props) {
    super(props)

    this.inputToast = null //disallow duplicates
    this.commandNames = ['Account Info', 'Account History', 'Active Difficulty', 'Available Supply', 'Block Info', 'Block Count', 'Block Chain', 'Delegators', 'Frontiers',
    'Pending Blocks', 'Process Block', 'Reps Online']
    this.commands = ['ACCINFO', 'ACCHISTORY', 'ACTIVEDIFF', 'SUPPLY', 'BLOCKINFO', 'COUNT', 'CHAIN', 'DELEGATORS', 'FRONTIERS',
    'PENDING', 'PROCESS', 'REPSONLINE']
    this.commandHelps = [
      'Retreieves information for a given address/account. Only works for accounts that have received their first transaction and have an entry on the ledger, will return "Account not found" otherwise.',
      'Reports send/receive information for an address/account. Response will start with the latest block for the account (the frontier), and will list all blocks back to the open block of this account or limited by Count.',
      'Returns the difficulty values for the minimum required on the network as well as the current active difficulty seen on the network (5 minute trended average of adjusted difficulty seen on confirmed transactions) which can be used to perform rework for better prioritization of transaction processing.',
      'Returns how many raw are in the public supply.',
      'Retrieves a json representation of the block hash with info like transaction amount, balance etc.',
      'Reports the number of blocks in the ledger, unchecked synchronizing blocks and cemented/confirmed blocks.',
      'Returns a consecutive list of block hashes in the account chain starting at block back to count (direction from frontier back to open block, from newer blocks to older). Reverse Direction: From open block up to frontier, from older blocks to newer.',
      'Returns the delegators and their balance for given address/account.',
      'Returns a list of pairs of account and block hash representing the head block starting at given address/account up to count.',
      'Returns a list of block hashes which have not yet been received by this account. Only includes confirmed blocks.',
      'Publish a JSON block to the network. Rework will NOT be done if the network is busy and PoW difficulty is low.',
      'Returns a list of online representative accounts that have voted recently',
    ]
    this.commandURLS = [
      'https://docs.nano.org/commands/rpc-protocol/#account_info',
      'https://docs.nano.org/commands/rpc-protocol/#account_history',
      'https://docs.nano.org/commands/rpc-protocol/#active_difficulty',
      'https://docs.nano.org/commands/rpc-protocol/#available_supply',
      'https://docs.nano.org/commands/rpc-protocol/#block_info',
      'https://docs.nano.org/commands/rpc-protocol/#block_count',
      'https://docs.nano.org/commands/rpc-protocol/#chain',
      'https://docs.nano.org/commands/rpc-protocol/#delegators',
      'https://docs.nano.org/commands/rpc-protocol/#frontiers',
      'https://docs.nano.org/commands/rpc-protocol/#pending',
      'https://docs.nano.org/commands/rpc-protocol/#process',
      'https://docs.nano.org/commands/rpc-protocol/#representatives_online',
    ]

    // Amount dropdown titles
    this.amounts = [
      'Threshold NANO',
      'Threshold raw',
    ]

    this.state = {
      address: '',
      block: '',
      count: '10',
      reverse: false,
      amount: '', //threshold
      raw: '', //amount in raw
      json: '', //json input
      qrContent: '',
      qrSize: 512,
      activeQR: '',
      qrState: 0,  //qr size
      qrHidden: true,
      activeCommandId: 0,
      activeCommandName: this.commandNames[0],
      activeCommandHelp: this.commandHelps[0],
      activeCommandURL: this.commandURLS[0],
      accountVisible: false,
      blockVisible: false,
      countVisible: false,
      reverseVisible: false,
      thresholdVisible: false,
      jsonVisible: false,
      output: '',
      validAddress: false,
      validBlock: false,
      validCount: true,
      validAmount: true, //threshold
      activeAmount: this.amounts[0],
      activeAmountId: '0', // NANO=0, raw=1
      outputRows: 16,
      fetchingRPC: false,
    }

    this.updateQR = this.updateQR.bind(this)
    this.clearText = this.clearText.bind(this)
    this.clearAll = this.clearAll.bind(this)
    this.double = this.double.bind(this)
    this.setParams = this.setParams.bind(this)
    this.selectCommand = this.selectCommand.bind(this)
    this.getRPC = this.getRPC.bind(this)
    this.handleAddressChange = this.handleAddressChange.bind(this)
    this.handleBlockChange = this.handleBlockChange.bind(this)
    this.handleCountChange = this.handleCountChange.bind(this)
    this.handleReverse = this.handleReverse.bind(this)
    this.handleThresholdChange = this.handleThresholdChange.bind(this)
    this.handleJsonChange = this.handleJsonChange.bind(this)
    this.setMax = this.setMax.bind(this)
    this.selectThreshold = this.selectThreshold.bind(this)
    this.handleRPCError = this.handleRPCError.bind(this)
  }

  componentDidMount = () => {
    // Read URL params from parent and construct new quick path
    var type = this.props.state.type
    var address = this.props.state.address
    var block = this.props.state.block
    var count = this.props.state.count
    var reverse = this.props.state.reverse
    var threshold = this.props.state.threshold
    var threstype = this.props.state.threstype

    if (address) {
      this.addressChange(address)
    }

    if (block) {
      this.blockChange(block)
    }

    if (count) {
      this.countChange(count)
    }

    if (typeof reverse !== 'undefined') {
      this.setState({
        reverse: (reverse === 'true')
      })
    }

    if (threshold) {
      this.thresholdChange(threshold)
    }

    if (threstype) {
      this.changeAmountType(threstype)
    }

    if (typeof type !== 'undefined') {
      this.selectCommand(type)
    }
    if(!type) {
      this.setParams()
      this.selectCommand(0)
    }
  }

  // Defines the url params
  setParams() {
    var defaultParam = '?tool='+toolParam + '&type='+this.state.activeCommandId
    switch (this.state.activeCommand) {
      case 'ACCINFO':
      defaultParam = defaultParam + '&address='+this.state.address
      break

      case 'ACCHISTORY':
      defaultParam = defaultParam + '&address='+this.state.address + '&count='+this.state.count
      break

      case 'BLOCKINFO':
      defaultParam = defaultParam + '&block='+this.state.block
      break

      case 'CHAIN':
      defaultParam = defaultParam + '&block='+this.state.block + '&count='+this.state.count + '&reverse='+this.state.reverse
      break

      case 'DELEGATORS':
      defaultParam = defaultParam + '&address='+this.state.address
      break

      case 'FRONTIERS':
      defaultParam = defaultParam + '&address='+this.state.address + '&count='+this.state.count
      break

      case 'PENDING':
      defaultParam = defaultParam + '&address='+this.state.address + '&count='+this.state.count + '&threshold='+this.state.amount + '&threstype='+this.state.activeAmountId
      break

      default:
      break
    }
    helpers.setURLParams(defaultParam)
  }

  // Change tool to view on main page
  selectCommand(eventKey) {
    this.setState({
      activeCommand: this.commands[eventKey],
      activeCommandId: eventKey,
      activeCommandName: this.commandNames[eventKey],
      activeCommandHelp: this.commandHelps[eventKey],
      activeCommandURL: this.commandURLS[eventKey],
      output: '',
    },function() {
      // Choose which input elements to be visible on the DOM
      this.setState({
        outputRows: 16, //default
      })

      switch (this.state.activeCommand) {
        case 'ACCINFO':
        this.setState({
          accountVisible: true,
          blockVisible: false,
          countVisible: false,
          reverseVisible: false,
          thresholdVisible: false,
          jsonVisible: false,
        })
        break

        case 'ACCHISTORY':
        this.setState({
          accountVisible: true,
          blockVisible: false,
          countVisible: true,
          reverseVisible: false,
          thresholdVisible: false,
          jsonVisible: false,
        })
        break

        case 'ACTIVEDIFF':
        this.setState({
          accountVisible: false,
          blockVisible: false,
          countVisible: false,
          reverseVisible: false,
          thresholdVisible: false,
          jsonVisible: false,
        })
        break

        case 'SUPPLY':
        this.setState({
          accountVisible: false,
          blockVisible: false,
          countVisible: false,
          reverseVisible: false,
          thresholdVisible: false,
          jsonVisible: false,
        })
        break

        case 'BLOCKINFO':
        this.setState({
          accountVisible: false,
          blockVisible: true,
          countVisible: false,
          reverseVisible: false,
          thresholdVisible: false,
          jsonVisible: false,
        })
        break

        case 'COUNT':
        this.setState({
          accountVisible: false,
          blockVisible: false,
          countVisible: false,
          reverseVisible: false,
          thresholdVisible: false,
          jsonVisible: false,
        })
        break

        case 'CHAIN':
        this.setState({
          accountVisible: false,
          blockVisible: true,
          countVisible: true,
          reverseVisible: true,
          thresholdVisible: false,
          jsonVisible: false,
        })
        break

        case 'DELEGATORS':
        this.setState({
          accountVisible: true,
          blockVisible: false,
          countVisible: false,
          reverseVisible: false,
          thresholdVisible: false,
          jsonVisible: false,
        })
        break

        case 'FRONTIERS':
        this.setState({
          accountVisible: true,
          blockVisible: false,
          countVisible: true,
          reverseVisible: false,
          thresholdVisible: false,
          jsonVisible: false,
        })
        break

        case 'PENDING':
        this.setState({
          accountVisible: true,
          blockVisible: false,
          countVisible: true,
          reverseVisible: false,
          thresholdVisible: true,
          jsonVisible: false,
        })
        break

        case 'PROCESS':
        this.setState({
          accountVisible: false,
          blockVisible: false,
          countVisible: false,
          reverseVisible: false,
          thresholdVisible: false,
          jsonVisible: true,
          outputRows: 3,
        })
        break

        case 'REPSONLINE':
        this.setState({
          accountVisible: false,
          blockVisible: false,
          countVisible: false,
          reverseVisible: false,
          thresholdVisible: false,
          jsonVisible: false,
        })
        break

        default:
        break
      }
      this.clearAll()
    })
  }

  //Clear text from input field
  clearText(event) {
    switch(event.target.value) {
      case 'address':
      this.setState({
        address: '',
        validAddress: false,
      },
      function() {
        this.setParams()
      })
      break

      case 'block':
      this.setState({
        block: '',
        validBlock: false,
      },
      function() {
        this.setParams()
      })
      break

      case 'json':
      this.setState({
        json: '',
      },
      function() {
        this.setParams()
      })
      break

      default:
      break
    }
  }

  clearAll() {
    this.setState({
      address: '',
      block: '',
      count: '10',
      amount: '', //threshold
      raw: '', //amount in raw
      json: '', //json input
      output: '',
      reverse: false,
      qrActive: '',
      qrContent: '',
      qrHidden: true,
      validAddress: false,
      validBlock: false,
      validCount: true,
      validAmount: true, //threshold
      activeAmount: this.amounts[0],
      activeAmountId: '0', // NANO=0, raw=1
      fetchingRPC: false,
    },function() {
        this.updateQR()
        this.setParams()
      }
    )
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

  handleReverse(event) {
    this.setState({
      reverse: event.target.checked
    },
    function() {
      this.setParams()
    })
  }

  // Any QR button is pressed. Handle active button.
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
      case 'output':
      this.setState({
        qrContent: this.state.output,
      })
      break

      default:
      break
    }
  }

  setMax() {
    this.setState({
      count: helpers.constants.RPC_MAX
    },function() {
      this.setParams()
    })
  }

  handleAddressChange(event) {
    this.addressChange(event.target.value)
  }

  addressChange(address) {
    this.setState({
      address: address
    })

    if (!nano.checkAddress(address)) {
      if (address !== '') {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid Address", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      this.setState({
        validAddress: false
      })
      return
    }
    this.setState({
      validAddress: true
    },
    function() {
      this.setParams()
    })
  }

  handleBlockChange(event) {
    this.blockChange(event.target.value)
  }

  blockChange(block) {
    this.setState({
      block: block
    })

    if (!nano.checkKey(block)) {
      if (block !== '') {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Invalid Block Hash", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      this.setState({
        validBlock: false
      })
      return
    }
    this.setState({
      validBlock: true
    },
    function() {
      this.setParams()
    })
  }

  handleCountChange(event) {
    this.countChange(event.target.value)
  }

  countChange(count) {
    if (count > helpers.constants.RPC_MAX) {
      count = helpers.constants.RPC_MAX
    }
    if (count < 1) {
      count = 1
    }
    this.setState({
      count: count
    },
    function() {
      if (!helpers.isNumeric(count)) {
        this.setState({
          validCount: false
        })
        if (count !== '') {
          if (! toast.isActive(this.inputToast)) {
            this.inputToast = toast("Not a valid limit", helpers.getToast(helpers.toastType.ERROR_AUTO))
          }
        }
      }
      else {
        this.setParams()
        this.setState({
          validCount: true
        })
      }
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

  handleJsonChange(event) {
    this.setState({
      json: event.target.value
    })
  }

  writeOutput(json) {
    try {
      this.setState({
        output: JSON.stringify(json, null, 2)
      })
    }
    catch(error) {
      toast("Bad output JSON, check console (CTRL+F12)", helpers.getToast(helpers.toastType.ERROR_AUTO))
      console.log("Bad JSON: "+error)
    }
    this.updateQR()
  }

  checkValidJson(json) {
    let output
    try {
      output = JSON.parse(json)
    }
    catch (error) {
      console.log("Bad input json")
      return false
    }
    return output
  }

  // Make RPC call
  getRPC(event) {
    var command = {}
    let value = this.state.activeCommand
    var fail = false
    switch (value) {
      case 'ACCINFO':
      if (this.state.validAddress) {
        command.action = 'account_info'
        command.account = this.state.address
        command.representative = "true"
        command.weight = "true"
        command.pending = "true"
      }
      else {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Need a valid address.", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
        fail = true
      }
      break

      case 'ACCHISTORY':
      if (this.state.validAddress && this.state.validCount) {
        command.action = 'account_history'
        command.account = this.state.address
        command.count = this.state.count
      }
      else {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Need a valid address and count.", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
        fail = true
      }
      break

      case 'ACTIVEDIFF':
      command.action = 'active_difficulty'
      command.include_trend = 'true'
      break

      case 'SUPPLY':
      command.action = 'available_supply'
      break

      case 'BLOCKINFO':
      if (this.state.validBlock) {
        command.action = 'block_info'
        command.hash = this.state.block
        command.json_block = "true"
      }
      else {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Need a valid block hash.", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
        fail = true
      }
      break

      case 'COUNT':
      command.action = 'block_count'
      break

      case 'CHAIN':
      if (this.state.validBlock && this.state.validCount) {
        command.action = 'chain'
        command.block = this.state.block
        command.count = this.state.count
        command.reverse = this.state.reverse
      }
      else {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Need a valid block hash and count.", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
        fail = true
      }
      break

      case 'DELEGATORS':
      if (this.state.validAddress) {
        command.action = 'delegators'
        command.account = this.state.address
      }
      else {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Need a valid address.", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
        fail = true
      }
      break

      case 'FRONTIERS':
      if (this.state.validAddress && this.state.validCount) {
        command.action = 'frontiers'
        command.account = this.state.address
        command.count = this.state.count
      }
      else {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Need a valid address and count.", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
        fail = true
      }
      break

      case 'PENDING':
      if (this.state.validAddress && this.state.validCount) {
        command.action = 'pending'
        command.account = this.state.address
        command.count = this.state.count
        command.source = 'true'
        command.sorting = 'true'
        command.include_only_confirmed = 'true'
        if (this.state.raw !== '') {
          command.threshold = this.state.raw
        }
      }
      else {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Need a valid address and count.", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
        fail = true
      }
      break

      case 'PROCESS':
      let block = this.checkValidJson(this.state.json)
      if (block) {
        command.action = 'process'
        command.json_block = 'true'
        command.watch_work = 'false'
        command.block = block
      }
      else {
        if (! toast.isActive(this.inputToast)) {
          this.inputToast = toast("Need a valid JSON block.", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
        fail = true
      }
      break

      case 'REPSONLINE':
      command.action = 'representatives_online'
      break

      default:
      break
    }
    if (fail) {
      this.setState({
        output: '',
      })
    }

    if (Object.keys(command).length > 0) {
      this.setState({fetchingRPC: true})
      helpers.postDataTimeout(command)
      //helpers.postData(command)
      .then((data) => {
        this.setState({fetchingRPC: false})
        var fail = false
        switch (value) {
          case 'ACCINFO':
          this.writeOutput(data)
          break

          case 'ACCHISTORY':
          this.writeOutput(data)
          break

          case 'ACTIVEDIFF':
          this.writeOutput(data)
          break

          case 'SUPPLY':
          this.writeOutput(data)
          break

          case 'BLOCKINFO':
          this.writeOutput(data)
          break

          case 'COUNT':
          this.writeOutput(data)
          break

          case 'CHAIN':
          this.writeOutput(data)
          break

          case 'DELEGATORS':
          if (data.delegators) {
            this.writeOutput({count: Object.keys(data.delegators).length, delegators: data.delegators})
          }
          else {
            toast("No delegators found.", helpers.getToast(helpers.toastType.ERROR_AUTO))
            this.writeOutput(data)
          }
          break

          case 'FRONTIERS':
          this.writeOutput(data)
          break

          case 'PENDING':
          if (data.blocks) {
            // sum all raw amounts
            var raw = '0'
            Object.keys(data.blocks).forEach(function(key) {
                raw = helpers.bigAdd(raw,data.blocks[key].amount)
            })
            console.log(raw)
            let nanoAmount = helpers.rawToMnano(raw)
            this.writeOutput({count: Object.keys(data.blocks).length, raw: raw, NANO: nanoAmount, blocks: data.blocks})
          }
          else {
            toast("No pending found.", helpers.getToast(helpers.toastType.ERROR_AUTO))
            this.writeOutput(data)
          }
          break

          case 'PROCESS':
          this.writeOutput(data)
          break

          case 'REPSONLINE':
          this.writeOutput(data)
          break

          default:
          break
        }

        if (fail) {
          toast("Bad RPC response.", helpers.getToast(helpers.toastType.ERROR_AUTO))
          this.writeOutput(data)
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
        <p>Communicate with the live network using common requests</p>

        <DropdownButton
          className="command-dropdown"
          title={this.state.activeCommandName}
          key={this.state.activeCommandId}
          id={`dropdown-basic-${this.state.activeCommandId}`}>
          {this.commandNames.map(function(command, index){
            return <Dropdown.Item eventKey={index} key={index} onSelect={this.selectCommand}>{command}</Dropdown.Item>;
          }.bind(this))}
        </DropdownButton>

        <div className="command-help">
          {this.state.activeCommandHelp} <a href={this.state.activeCommandURL}>DOC</a>
        </div>

        <InputGroup size="sm" className={this.state.accountVisible ? "mb-3":'hidden'}>
          <InputGroup.Prepend>
            <InputGroup.Text id="account">
              Address
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="account" aria-describedby="account" value={this.state.address} title="" maxLength="65" placeholder="nano_xxx... or xrb_xxx..." onChange={this.handleAddressChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='address' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.address} onClick={helpers.copyText}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className={this.state.blockVisible ? "mb-3":'hidden'}>
          <InputGroup.Prepend>
            <InputGroup.Text id="block">
              Block Hash
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="block" aria-describedby="block" value={this.state.block} title="" maxLength="64" placeholder="ABC123... or abc123..." onChange={this.handleBlockChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='block' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.block} onClick={helpers.copyText}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className={this.state.countVisible ? "mb-3 count-input":'hidden'}>
          <InputGroup.Prepend>
            <InputGroup.Text id="count">
              Count Limit
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="count" aria-describedby="count" value={this.state.count} title="Number of entities to request." maxLength="5" onChange={this.handleCountChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="max-btn" onClick={this.setMax}>Max</Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className={this.state.thresholdVisible ? "mb-3":'hidden'}>
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
          <FormControl id="threshold" aria-describedby="threshold" value={this.state.amount} title="Pending amounts below this limit will not be included." maxLength="39" placeholder="Leave blank for no limit" onChange={this.handleThresholdChange} autoComplete="off"/>
        </InputGroup>

        <InputGroup size="sm" className={this.state.reverseVisible ? "mb-3":'hidden'}>
          <div className="form-check form-check-inline index-checkbox">
            <input className="form-check-input" type="checkbox" id="reverse" value="walletNo" checked={this.state.reverse} onChange={this.handleReverse}/>
            <label className="form-check-label" htmlFor="reverse">Reverse Direction</label>
          </div>
        </InputGroup>

        <InputGroup size="sm" className={this.state.jsonVisible ? "mb-3":'hidden'}>
          <InputGroup.Prepend>
            <InputGroup.Text id="json">
              JSON Block
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="json-area" aria-describedby="json" as="textarea" rows="12" placeholder="JSON representation of a NANO block, see DOC link above" value={this.state.json} onChange={this.handleJsonChange}/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='json' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" onClick={helpers.copyOutput}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <FormControl id="output-area" aria-describedby="output" as="textarea" rows={this.state.outputRows} placeholder="" value={this.state.output} readOnly/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-copy" onClick={helpers.copyOutput}></Button>
            <Button variant="outline-secondary" className={this.state.qrActive === 'output' ? "btn-active fas fa-qrcode" : "fas fa-qrcode"} value='output' onClick={this.handleQRChange}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <Button className="btn-medium" variant="primary" disabled={this.state.fetchingRPC} onClick={this.getRPC}>Node Request</Button>
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
export default InspectTool
