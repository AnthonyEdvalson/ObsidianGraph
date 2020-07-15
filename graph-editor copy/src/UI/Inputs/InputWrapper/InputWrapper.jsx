import React from 'react';
import Label from '../../Label';
import Indent from '../../Indent';
import './InputWrapper.css';

function titleCase(str) {
    return str.toLowerCase().split(' ').map(function(word) {
        return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
}

function spaceText(str) {
    return str.replace(/[-_]|(?<=[a-z])(?=[^a-z\s])|(?<=[A-Z])(?=[A-Z][a-z]|[0-9])|(?<=[0-9])(?=[^0-9\s])/g, " ");
}

function formatKey(key) {
    let spaced = spaceText(key);
    let title = titleCase(spaced);
    return title;
}

function InputWrapper(props) {
    let label = null;
    
    if (props.label !== null) {
        if (typeof(props.label) === "undefined" && typeof(props.k) !== "undefined")
            label = (<Label>{formatKey(props.k)}</Label>);
        else if (typeof(props.label) !== "undefined")
            label = (<Label>{props.label}</Label>);
    }

    let body = props.children;

    if (label !== null) {
        body = (<Indent>{body}</Indent>);
    }

    return (
        <div className="InputWrapper ui-elem">
            {label}
            {body}
        </div>
    );
}

export default InputWrapper;