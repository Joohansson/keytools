import React from 'react'; // import react module
import { PropTypes } from 'prop-types';

// create our Button component as a functional component
const Button = (props) => {
  return (
    <input
      type="button"
      className={props.type}
      onClick={props.handleClick}
      value={props.label}
    />
  );
}

// describe our expected props types
Button.propTypes = {
  type: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired
}

// export our button component.
export default Button;
