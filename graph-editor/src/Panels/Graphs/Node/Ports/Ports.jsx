import React from 'react';
import Port from './Port';
import './Ports.css';


function Ports(props) {
    let inout = props.in ? "in" : "out";

    if (props.ports.length === 0)
        return null;


    return (
        <div className={"Ports ports-" + inout}>
        {
            props.ports.map(portId => (
                <Port key={portId} k={portId} inout={inout} />
            ))
        }
        </div>
    )
}

export default Ports;
