import React from 'react';

function App(props) {
  return <span>APP HERE {props.load(props.ins.c1)} {props.load(props.ins.c2)}</span>
}

export default App;
