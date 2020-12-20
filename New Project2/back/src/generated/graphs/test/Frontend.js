import React, {useState, useEffect} from 'react';

function Main({input}) {
	let [msg, setMsg] = useState("...");

  useEffect(() => {
    input("World!").then(setMsg);
  }, []);

  return <span>{msg}</span>
}

export default { main: Main };
