import React from 'react';
import './Port.css';
import { useGraphSelector } from '../../../../../logic/scope';
import Pin from '../Pin';


function Port(props) {
    let port = useGraphSelector(graph => graph.ports[props.k]);
    let label = port.label;

    let content = null;

    let t = port.pins ? "port-list" : "port-value"

    if (t === "port-list") {
        content = (
            <>
                {
                    port.pins.map(pin => 
                        <Pin k={pin} key={pin} inout={props.inout} />
                    )
                }
                <Pin inout={props.inout} create port={props.k}/>
            </>
        )
    }

    if (t === "port-value") {
        content = <Pin k={port.pin} inout={props.inout} />
    }

    return (
        <div className={"Port " + t}>
            { content }
            <span className="port-label">{label}</span>
        </div>
    )
}

export default Port;
