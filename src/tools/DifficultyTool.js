import React, { Component } from 'react'
import { InputGroup, FormControl, Button} from 'react-bootstrap'
import * as helpers from '../helpers'
import {toast } from 'react-toastify'
const toolParam = 'difficulty'

class DifficultyTool extends Component {
  constructor(props) {
    super(props)

    this.inputToast = null //disallow duplicates

    this.state = {
      baseDifficulty: 'ffffffc000000000',
      newDifficulty: '',
      multiplier: '',
      validBase: true,
      validNew: false,
      validMultiplier: false,
    }

    this.handleBaseChange = this.handleBaseChange.bind(this)
    this.handleNewChange = this.handleNewChange.bind(this)
    this.handleMultiplierChange = this.handleMultiplierChange.bind(this)
    this.clearText = this.clearText.bind(this)
    this.setParams = this.setParams.bind(this)
  }

  componentDidMount = () => {
    // Read URL params from parent and construct new quick path
    var baseDiff = this.props.state.baseDiff
    var newDiff = this.props.state.newDiff
    var multiplier = this.props.state.multiplier

    if (baseDiff && newDiff) {
      this.setState({
        baseDifficulty: baseDiff,
        newDifficulty: newDiff,
        validBase: true,
        validNew: true,
      },
      function() {
        this.newChange(newDiff)
      })
    }
    else if (baseDiff && multiplier) {
      this.setState({
        baseDifficulty: baseDiff,
        multiplier: multiplier,
        validBase: true,
        validMultiplier: true,
      },
      function() {
        this.multiplierChange(multiplier)
      })
    }
    else if (baseDiff) {
      this.setState({
        baseDifficulty: baseDiff,
        validBase: true,
      })
    }
    if (!baseDiff && !newDiff && !multiplier) {
      this.setParams()
    }
  }

  // Defines the url params
  setParams(type) {
    switch (type) {
      case 'baseDiff':
      helpers.setURLParams('?tool='+toolParam + '&basediff='+this.state.baseDifficulty)
      break

      case 'newDiff':
      helpers.setURLParams('?tool='+toolParam + '&basediff='+this.state.baseDifficulty + '&newdiff='+this.state.newDifficulty)
      break

      case 'multiplier':
      helpers.setURLParams('?tool='+toolParam + '&basediff='+this.state.baseDifficulty + '&multiplier='+this.state.multiplier)
      break

      default:
      helpers.setURLParams('?tool='+toolParam)
      break
    }
  }

  //Clear text from input field
  clearText(event) {
    switch(event.target.value) {
      case 'baseDiff':
        this.setState({
          baseDifficulty: '',
        })
        break
      case 'newDiff':
        this.setState({
          newDifficulty: '',
        })
        break
      case 'multiplier':
        this.setState({
          multiplier: '',
        })
        break
      default:
        break
    }
  }

  // Validate if a 16 char hex string
  checkDifficulty(diff) {
    return (helpers.isHex(diff) && diff.length === 16)
  }

  handleBaseChange(event) {
    this.baseChange(event.target.value)
  }
  baseChange(value) {
    let val = value.toLowerCase()
    if (!this.checkDifficulty(val)) {
      if (val !== '') {
        if (!toast.isActive(this.inputToast)) {
          this.inputToast = toast("Not a valid difficulty hex string", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      this.setState({
        baseDifficulty: val,
        validBase: false,
        validMultiplier: false,
        multiplier: '',
      },
      function() {
        this.setParams('baseDiff')
      })
      return
    }
    this.inputToast = toast("Valid threshold entered", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
    this.setState({
      baseDifficulty: val,
      multiplier: this.state.validNew ? helpers.multiplier_from_difficulty(this.state.newDifficulty, val).toString(): '',
      validBase: true,
      validMultiplier: true,
    },
    function() {
      this.setParams('baseDiff')
    })
  }

  handleNewChange(event) {
    this.newChange(event.target.value)
  }
  newChange(value) {
    let val = value.toLowerCase()
    if (!this.checkDifficulty(val)) {
      if (val !== '') {
        if (!toast.isActive(this.inputToast)) {
          this.inputToast = toast("Not a valid difficulty hex string", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      this.setState({
        newDifficulty: val,
        multiplier: '',
        validNew: false,
        validMultiplier: false,
      },
      function() {
        this.setParams('newDiff')
      })
      return
    }
    this.inputToast = toast("Valid threshold entered", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
    this.setState({
      newDifficulty: val,
      validNew: true,
      validMultiplier: true,
      multiplier: this.state.validBase ? helpers.multiplier_from_difficulty(val,this.state.baseDifficulty).toString(): '',
    },
    function() {
      this.setParams('newDiff')
    })
  }

  handleMultiplierChange(event) {
    this.multiplierChange(event.target.value)
  }
  multiplierChange(val) {
    if (!helpers.isValidDiffMultiplier(val)) {
      if (val !== '' && val.slice(-1) !== '.' && val.slice(-1) !== '0') {
        if (!toast.isActive(this.inputToast)) {
          this.inputToast = toast("Not a valid positive natural or decimal number", helpers.getToast(helpers.toastType.ERROR_AUTO))
        }
      }
      this.setState({
        newDifficulty: '',
        multiplier: val,
        validMultiplier: false,
        validNew: false,
      },
      function() {
        this.setParams('multiplier')
      })
      return
    }

    let newDiff = this.state.validBase ? helpers.difficulty_from_multiplier(val,this.state.baseDifficulty): ''
    if (newDiff.charAt(0) === '-' || newDiff.length > 16) {
      newDiff = ''
    }

    this.setState({
      multiplier: val,
      validMultiplier: true,
      validnew: true,
      newDifficulty: newDiff,
    },
    function() {
      this.setParams('multiplier')
    })
  }

  render() {
    return (
      <div>
        <p>Convert PoW difficulty threshold OR multiplier from the Base</p>
        <ul>
          <li>The default base threshold is ffffffc000000000</li>
          <li>Since node v21 send/change blocks are using 8x multiplier and receive blocks 0.125x</li>
        </ul>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="raw">
              Base Threshold
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="raw" aria-describedby="raw" value={this.state.baseDifficulty} title="To base the calculation on. 16 char long hex string." maxLength="16" placeholder="16 char hex string" onChange={this.handleBaseChange} autoComplete="off"/>
          <InputGroup.Append>
            <Button variant="outline-secondary" className="fas fa-times-circle" value='baseDiff' onClick={this.clearText}></Button>
            <Button variant="outline-secondary" className="fas fa-copy" value={this.state.baseDifficulty} onClick={helpers.copyText}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="nano">
              New Threshold
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="nano" aria-describedby="nano" value={this.state.newDifficulty} title="The updated threshold. 16 char long hex string." maxLength="16" placeholder="16 char hex string" onChange={this.handleNewChange} autoComplete="off"/>
          <InputGroup.Append>
          <Button variant="outline-secondary" className="fas fa-times-circle" value='newDiff' onClick={this.clearText}></Button>
          <Button variant="outline-secondary" className="fas fa-copy" value={this.state.newDifficulty} onClick={helpers.copyText}></Button>
          </InputGroup.Append>
        </InputGroup>

        <InputGroup size="sm" className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text id="Mnano">
              Multiplier
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="Mnano" aria-describedby="Mnano" value={this.state.multiplier} title="Difficulty multiplier. Positive Natural or Decimal number" maxLength="50" placeholder="Positive natural or decimal number such as 2 or 13.5" onChange={this.handleMultiplierChange} autoComplete="off"/>
          <InputGroup.Append>
          <Button variant="outline-secondary" className="fas fa-times-circle" value='multiplier' onClick={this.clearText}></Button>
          <Button variant="outline-secondary" className="fas fa-copy" value={this.state.multiplier} onClick={helpers.copyText}></Button>
          </InputGroup.Append>
        </InputGroup>
      </div>
    )
  }
}
export default DifficultyTool
