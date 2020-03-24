import React, { useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import Draggable from '../Draggable';
import './Node.css';
import Port from './Port';
import { useSelector, useDispatch } from 'react-redux'

function useNodeMove(x, y, portRefs, dispatch, key) {
    const drag = Draggable(x, y, null, useCallback(e => {
        if (x !== e.x || y !== e.y) {
            let ports = [];
            for (const [port, ref] of Object.entries(portRefs)) {
                let rect = ReactDOM.findDOMNode(ref.current).getBoundingClientRect();
                let mx = rect.x + rect.height / 2;
                let my = rect.y + rect.width / 2;
                ports.push({port, x: mx, y: my});
            }
            dispatch({type: "MOVE_NODE", node: key, x: e.x, y: e.y, ports})
        }
    }, [key, dispatch, portRefs, x, y]));
    return drag.handleMouseDown;
}

function useKeyStore(defaultValue={}) {
    const [data, setData] = useState(defaultValue);
    const setKey = useCallback((key, value) => {
        setData(prevState => {
            let newState = {...prevState};
            newState[key] = value;
            return newState;
        });
    }, []);

    return [data, setKey];
}

function Node(props) {
    const key = props.k;

    const data = useSelector(state => state.nodes[key]);
    const selection = useSelector(state => state.selection);

    let {x, y, name, type, inputs, output, preview} = data;
    let hasError = preview.state === "error";
    let [portRefs, setRef] = useKeyStore();
    let selected = selection.some(item => item.type === "node" && item.key === key);

    const dispatch = useDispatch();

    let dragHandleMouseDown = useNodeMove(x, y, portRefs, dispatch, key);

    const makePort = useCallback((pIndex, pdata, inout) => {
        return <Port data={pdata} key={pIndex} k={pIndex} inout={inout} setRef={setRef} />
    }, [setRef]);

    const handleMouseDown = useCallback((e) => {
        dispatch({type: "SET_SELECTION", items: [{type: "node", key}]});
        dragHandleMouseDown(e);
    }, [dragHandleMouseDown, dispatch, key]);

    let className = `Node node-${type}`;
    if (hasError)
        className += " node-error";
    if (selected)
        className += " node-selected"

    return (
        <div style={{transform: `translate(${x}px, ${y}px)`}} onMouseDown={handleMouseDown} className={className}>
            <div className="node-info">
                {name}
            </div>
            {
                (preview.state === "loaded" || hasError) && (
                <div className="node-preview">
                    {JSON.stringify(preview.data, null, 2)}
                </div>)
            }
            <div className="node-ports-in">
            {
                inputs.map((port) => (makePort(port.key, port, "in")))
            }
            </div>
            <div className="node-ports-out">
                {output && makePort(output.key, output, "out")}
            </div>
        </div>
    );
}
/*
function usePreview(port, args) {
    let hasPreview = typeof(port) !== "undefined" && port.type !== "js" && port.type !== "graph";

    const [state, setState] = useState({
        data: null,
        loaded: !hasPreview,
        state: hasPreview ? "loading" : "empty"
    });
    
    let key = port && port.key;
    useEffect(() => {
        if (hasPreview) {
            call(key, args, true).then(data => {
                setState({
                    data,
                    loaded: true,
                    state: "success"
                });
            }).catch(e => {
                setState({
                    data: e.message,
                    loaded: false,
                    state: "error"
                });
            });
        }
    }, [key, hasPreview, args]);

    return state;
}
*/

export default Node;
