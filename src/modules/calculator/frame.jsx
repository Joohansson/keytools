import React from 'react'; // import react module
import Screen from './screen'; // Import our screen component from this directory
import Button from './button'; // Import our button component from this directory
import './calc.css';

// create a class which extends react component
class Calculator extends React.Component {
  constructor() {
    super();
    // set our default state
    this.state = {
      question: '',
      answer: ''
    }
    // Bind our handleClick method (sets 'this' explicitly to refer to this componenent)
    // We did this because 'this' would refer to the source of the click events
    this.handleClick = this.handleClick.bind(this);
  }

  // Render function to creat component to be rendered on the DOM.
  // This method must return a single parent element as you can see here.
  // The component is wrapped around () to make it a single expression.
  render() {
    return (
      <div className="calc-frame">
        <Screen question={this.state.question} answer={this.state.answer}/>
        <div className="button-row">
          <Button label={'1'} handleClick={this.handleClick} type='input-button' />
          <Button label={'2'} handleClick={this.handleClick} type='input-button' />
          <Button label={'3'} handleClick={this.handleClick} type='input-button' />
          <Button label={'4'} handleClick={this.handleClick} type='input-button' />
          <Button label={'-'} handleClick={this.handleClick} type='action-button' />
          <Button label={'+'} handleClick={this.handleClick} type='action-button' />
        </div>
        <div className="button-row">
          <Button label={'5'} handleClick={this.handleClick} type='input-button' />
          <Button label={'6'} handleClick={this.handleClick} type='input-button' />
          <Button label={'7'} handleClick={this.handleClick} type='input-button' />
          <Button label={'8'} handleClick={this.handleClick} type='input-button' />
          <Button label={'*'} handleClick={this.handleClick} type='action-button' />
          <Button label={'/'} handleClick={this.handleClick} type='action-button' />
        </div>
        <div className="button-row">
          <Button label={'9'} handleClick={this.handleClick} type='input-button' />
          <Button label={'0'} handleClick={this.handleClick} type='input-button' />
          <div className='dummy-button' disabled></div>
          <Button label={'.'} handleClick={this.handleClick} type='input-button' />
          <Button label={'Cls'} handleClick={this.handleClick} type='action-button'/>
          <Button label={'='} handleClick={this.handleClick} type='action-button' />
        </div>
      </div>
    );
  }

  // our method to handle all click events from our buttons
  handleClick(event){
    const value = event.target.value; // get the value from the target element (button)
    switch (value) {
      case '=': { // if it's an equal sign, use the eval module to evaluate the question
        // convert the answer (in number) to String
        var answer
        try {
          if (eval(this.state.question) !== undefined) {
            answer = eval(this.state.question).toString();
          }
          else {
            return //no value to calculate
          }
        }
        catch(err) {
          answer = ''
        }
        // update answer in our state.
        this.setState({ answer });
        break;
      }
      case 'Cls': {
        // if it's the Cls sign, just clean our question and answer in the state
        this.setState({ question: '', answer: '' });
        break;
      }
      default: {
        // for every other commmand, update the answer in the state
        let val = this.state.question
        val += value
        this.setState({
          question: val
        })
        break;
      }
    }
  }
}

// export our frame component. To be used in our client/index.js file
export default Calculator;
