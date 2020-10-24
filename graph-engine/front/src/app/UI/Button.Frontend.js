import React from 'react';

function Button({config, onClick, useAutoFocus}, props) {
  config = config();
  
  let focus = useAutoFocus(config.autoFocus);
  let type = config.type;

  let className = "ui-Button";
  if (type === "submit")
    className += " ui-button-submit";

  return (
    <div className={className}>
      <button onClick={onClick} ref={focus} type={type}>{config.label}</button>
    </div>
  );
}

export default { main: Button };
