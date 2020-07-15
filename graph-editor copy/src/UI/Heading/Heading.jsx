import React from 'react';
import './Heading.css';
import Label from '../Label';

function Heading(props) {
    return (<div className="Heading">
        {props.children}
        <Label>{props.label}</Label>
    </div>);
}

export default Heading;
