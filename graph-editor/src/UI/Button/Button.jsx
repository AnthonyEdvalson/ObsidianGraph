import React from 'react';
import useAutoFocus from '../Inputs/useAutoFocus';
import './Button.css';

function Button(props) {
    let focus = useAutoFocus(props.autoFocus);
    let type = props.type || props.submit ? "submit" : "button";

    let className = "Button ui-line-elem";
    if (type === "submit")
        className += " button-submit";

    return (
        <div className={className}>
            <button onClick={props.onClick} ref={focus} type={type}>{props.children}</button>
        </div>
    );
}

export default Button;
