import React, { useRef, useEffect } from 'react';
import './Port.css';
import { useDispatch } from 'react-redux';


function Port(props) {
    let {data, inout, setRef} = props;
    let {type, label} = data;
    let key = props.k;
    
    const dispatch = useDispatch();
    const ref = useRef(null);

    useEffect(() => {
        setRef(key, ref);
    }, [ref, key, setRef]);

    const handleMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch({type: "START_NEW_LINK", port: key, inout});
    }

    const handleMouseUp = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch({type: "END_NEW_LINK", port: key, inout});
    }

    return (
        <div className={"Port node-" + type}>
            <div ref={ref} className="port-ring" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
                <span className="port-label">{label}</span>
            </div>
        </div>
    );
}

export default Port;
