import React from 'react';
import './Button.css';

function Button(props) {
    return (
        <div className="Button ui-line-elem">
            <button onClick={props.onClick}>{props.children}</button>
        </div>
    );
}

export default Button;
