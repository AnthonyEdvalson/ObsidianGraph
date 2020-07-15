import React from 'react';
import './Button.css';

function Button(props) {
    return <button className="Button ui-line-elem" onClick={props.onClick}>{props.children}</button>;
}

export default Button;
