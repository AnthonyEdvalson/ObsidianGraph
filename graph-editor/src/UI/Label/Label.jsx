import React from 'react';
import './Label.css';

function Label(props) {
    return (<span className="Label ui-elem">{props.children}</span>);
}

export default Label;
