import React from 'react';

function Main({ config, useAutoFocus }, props) {
  config = config();
  let focus = useAutoFocus(config.autoFocus);

  return (
    <div className="ui-Checkbox">
      <input type="checkbox" { ...props } ref={focus} />
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path className="ui-check" fill="none" d="M3.0 12.0l5.0 5.0 12.0 -12.0"/></svg>
    </div>
  );
}

export default { main: Main }
