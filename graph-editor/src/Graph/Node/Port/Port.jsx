import React from 'react';
import './Port.css';
import { useDispatch, useSelector } from 'react-redux';
import { uuid4 } from '../../../actions/node';


function Port(props) {
    let {inout} = props;
    let key = props.k;
    let {label} = useSelector(state => state.graph.present.ports[key]);
    
    const dispatch = useDispatch();

    const handleMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey)
            dispatch({type: "RELINK", port: key, inout, transaction: uuid4()});
        else
            dispatch({type: "START_LINK", port: key, inout, transaction: uuid4()});
    }

    const handleMouseUp = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch({type: "END_LINK", port: key, inout});
    }

    return (
        <div className={"Port node-io"/* + type*/}>
            <div className="port-ring" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
                <span className="port-label">{label}</span>
            </div>
        </div>
    );
}

export default Port;
