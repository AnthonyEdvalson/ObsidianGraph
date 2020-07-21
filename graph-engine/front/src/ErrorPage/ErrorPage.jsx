import React from 'react';
import Traceback from './Traceback';
import './ErrorPage.css';

function ErrorPage(props) {
  let trace = props.error;
  
  return (
    <div className="ErrorPage">
      <div className="head">
        <div className="close" onClick={props.close}>X</div>
        <span className="type">Server Error: {type}</span>
        <span className="msg">{msg}</span>
        <pre className="request">{reqJson}</pre>
      </div>
      <div className="row">
        <div className="col">
          <Traceback tb={tb} remote={remote} title="Backend"/>
        </div>
        <div className="col">
          <Traceback tb={ftb} remote={remote} title="Fontend"/>
        </div>
      </div>
    </div>
	);
}

export default ErrorPage;
