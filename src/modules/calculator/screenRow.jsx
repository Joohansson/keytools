import React from 'react';
import { PropTypes } from 'prop-types';
import * as helpers from '../../helpers'
import { InputGroup, FormControl, Button} from 'react-bootstrap'

// Screen row component is written as a functional component
// it receives and displays (in an input field) a props (property) of value from
// it's parent component
const ScreenRow = (props) => {
  return (
    <div className="screen-row">
      <InputGroup size="sm" className="mb-3 calc-input">
        <FormControl readOnly value={props.value}/>
        <InputGroup.Append>
          <Button variant="outline-secondary" className="fas fa-copy" value={props.value} onClick={helpers.copyText}></Button>
        </InputGroup.Append>
      </InputGroup>
    </div>
  )
}

// we describe the props (property) that the parent element is required to pass
// into this component
ScreenRow.propTypes = {
  value: PropTypes.string.isRequired
}

export default ScreenRow;
