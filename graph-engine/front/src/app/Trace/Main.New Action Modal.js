import React, { useState } from 'react';

function Main({actions}, props) {
  let [action, setAction] = useState({name: ""});

  if (!props.open)
    return null;

  function save() {
    actions().create(action).then(props.close);
  }

  function onChange(event) {
    let v = event.target.value;
    setAction(prev => ({ ...prev, name: v }));
  }

  console.log(action);
  return (
    <div className="NewActionModal">
      <input type="text" value={action.name} onChange={onChange} />
      <button onClick={save}>Save</button>
      <button onClick={props.close}>Close</button>
    </div>
  )
}

export default { main: Main };
