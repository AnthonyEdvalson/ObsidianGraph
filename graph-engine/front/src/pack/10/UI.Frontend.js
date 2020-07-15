const React = require('react');

function Main({ input, insert }) {
  let [state, setState] = React.useState(null);
  let [val, setVal] = React.useState("Hello, ");
  
  let refresh = React.useCallback(() => {
    input().then(setState);
  }, []);

  let sendVal = () => {
    insert(val).then(refresh);
  }

  React.useEffect(() => {
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

module.exports = { main: Main };
