import React, { useState, useEffect } from 'react';

function Main({actions, logs, NewActionModal, allocationControl}, props) {
  let [allActions, setAllActions] = useState([]);
  let [createNew, setCreateNew] = useState(false);
  let [allocation, setAllocation] = useState({});

  useEffect(refresh, []); 

  function refresh() {
    actions().readAll().then(setAllActions);
    allocationControl().then(setAllocation);
  }

  function close() {
    setCreateNew(false);
    refresh();
  }

  function del(id) {
    console.log(id);
    actions().del(id).then(refresh);
  }

  function log(id) {
    logs().create({ action: id }).then(refresh);
  }

	return (
    <div className="ActionTable">
      <button onClick={() => setCreateNew(true)}>New Action</button>
      <NewActionModal open={createNew} close={close} />
      {
        allActions.map(action => (
          <div className="entry">
            <span>{action.name}</span>
            <span>
              <button onClick={() => del(action.id)}>Delete</button>
              <button onClick={() => log(action.id)}>Log</button>
            </span>
          </div>
        ))
      }
      {JSON.stringify(allocation)}
    </div>
  )
}

export default { main: Main };
