import React from "react";

function Comp1(props) {
  let [loaded, data] = props.useRemote(props.ins["control"], {"user_id": 1});
  //let data = props.load(props.ins["control"]);
  return <span>COMPONENT 1 {loaded && JSON.stringify(data, null, 2)}</span>
}

export default Comp1;