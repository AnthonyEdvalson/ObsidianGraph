import React from 'react';
import './Errors.css';
import { useSelector, useDispatch } from 'react-redux';
import errorLogic from '../../logic/errors';



function Errors(props) {
  let dispatch = useDispatch();
  let errors = Object.values(useSelector(state => state.errors)).sort((a, b) => b.time.diff(a.time));
  let selected = useSelector(state => state.focus.errorId);

  return (
    <div className="Errors">
      {
        errors.map(error => (
          <div className={"error-item" + (selected === error.errorId ? " error-selected" : "")} 
               key={error.errorId} onClick={() => errorLogic.focusError(dispatch, error.errorId)}>
            
            {error.errorId}
          </div>
        ))
      }
    </div>
  );
}


export default Errors;
