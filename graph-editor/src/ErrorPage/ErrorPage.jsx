import React from 'react';
import Traceback from './Traceback';
import './ErrorPage.css';

class ErrorPage extends React.Component{
  closePage() {
    window.alert("Well, this is awkward...\nThe close button isn't implemented");
  }

	render()
	{
		let msg = this.props.error.msg;
    let tb = this.props.error.tb;
    let type = this.props.error.type;
    let remote = this.props.remote;
    let ftb = this.props.frontStack;
    let reqJson = this.props.requestJson;

		return (
			<div className="ErrorPage">
        <div className="head">
          <div className="close" onClick={this.closePage}>X</div>
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
}

export default ErrorPage;
