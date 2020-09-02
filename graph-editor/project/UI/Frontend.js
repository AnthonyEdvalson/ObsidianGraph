import React, { useEffect, useCallback } from 'react'

function Main({ input, insert }) {
  let [state, setState] = React.useState(null);
  let [val, setVal] = React.useState("Hello, ");
    
  let refresh = useCallback(() => {
    input().then(value => {
      console.log("GOT", value);
      setState(value);
    });
  }, []);
  
  let sendVal = async () => {
    await insert(val);
    refresh();
  }

  useEffect(() => {
    refresh();
  }, [refresh])
  
  return (
    <div>
      {state || "Loading..."}
      <button onClick={refresh}>Refresh</button>
      <input type="text" value={val} onChange={e => setVal(e.target.value)} />
      <button onClick={sendVal}>SEND</button>
    </div>
  );
}



export default { main: Main }