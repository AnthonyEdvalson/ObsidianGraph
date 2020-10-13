import React from 'react';

function Main({a, b}) {
	return (
    <div>
      {a()}
      <br />
      {b()}
    </div>
  )
}

export default { main: Main }
