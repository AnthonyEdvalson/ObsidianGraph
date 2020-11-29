import React from 'react';
import { util } from 'obsidian';
import './Pin.css';
import { useGraphDispatch } from '../../../../../logic/scope';

function Pin(props) {

    let inout = props.inout;
    let key = props.k;
    let create = props.create;
    
    const dispatch = useGraphDispatch();

    const handleMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.__stop = true;

        if (e.shiftKey)
            dispatch({type: "RELINK", pin: key, inout, transaction: util.uuid4()}); // TODO move to logic, remove transaction???
        else if (create)
            dispatch({type: "START_LINK_LIST", port: props.port, inout, transaction: util.uuid4()});
        else
            dispatch({type: "START_LINK", pin: key, inout, transaction: util.uuid4()});
    }

    const handleMouseUp = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (create)
            dispatch({type: "END_LINK_LIST", port: props.port, inout});
        else
            dispatch({type: "END_LINK", pin: key, inout});
    }

    return (
        <div className={"Pin" + (props.create ? " pin-create" : "")} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
            <div className="pin-capture" />
            <div className="pin-ring" />
        </div>
    );
}

export default Pin;
