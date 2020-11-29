import React from 'react';

function Main({Content, Header}, props) {
	return (
    <div className="ui-Modal">
      <div className="ui-modal-header">
        <Header { ...props }/>
      </div>
      <div className="ui-modal-body">
        <Content { ...props }/>
      </div>
    </div>
  )
}

export default { main: Main };
