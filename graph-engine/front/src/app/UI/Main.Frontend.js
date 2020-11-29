import React, {useState} from 'react';

function Main({Check}) {
  console.log(4);
  let [checked, setChecked] = useState(false);
  return <Check checked={checked} onClick={() => setChecked(s => !s)}/>
}

export default { main: Main };
