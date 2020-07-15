import React from 'react';
import './Collapse.css';

function Collapse(props) {
    return (<div className={"Collapse heading-action" + (props.open ? " collapse-open" : "")} onClick={props.onClick} />);
}

export default Collapse;
