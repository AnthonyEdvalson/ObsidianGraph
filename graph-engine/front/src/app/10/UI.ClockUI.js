import React, {useState} from 'react';

function Main({clock}) {
  let [t, setT] = useState("___");

  clock(1000, v => {
    setT(v);
    console.log("tock");
    return 123;
  });

	return (
    <div>{t}</div>
  )
}

export default { main: Main }
