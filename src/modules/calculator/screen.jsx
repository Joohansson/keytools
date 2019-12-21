import React from 'react'; // Import react module
import ScreenRow from './screenRow';
import { PropTypes } from 'prop-types';

// Create our screen component as a functional component.
// It would display two screen rows, 1 for questions and the other for the answer
// The value would be passed down from it's parent component as a prop
const Screen = (props) => {
  return (
    <div className="screen">
      <ScreenRow value={props.question}/>
      <ScreenRow value={props.answer}/>
    </div>
  );
}

// Define our props expected from the parent component
Screen.propTypes = {
  question: PropTypes.string.isRequired,
  answer: PropTypes.string.isRequired
}

// export our component
export default Screen;
