import React from 'react';
import UI from '../../../../UI';
import { useForm } from '../../../../Form';
import { useGraphDispatch, useGraphSelector } from '../../../../logic/scope';
import { useCourier } from '../../../../logic/engine';

function Node(props) {
    let { data } = useForm();
    let dispatch = useGraphDispatch();
    let ports = useGraphSelector(graph => graph.ports);

    let node = props.nodeKey;
    let inputs = data.inputs;

    let addSample = () => {
        dispatch({type: "ADD_SAMPLE", node});
    };

    return (
        <UI.Foldout label="Code Properties">
            <UI.PortsEditor k="inputs" nodeKey={node} typeOptions={["back", "data"]} />

            <UI.List k="samples" handleAdd={addSample}>
                <Sample inputs={inputs} ports={ports} nodeKey={node} />
            </UI.List>
        </UI.Foldout>
    );
}

function Sample({ inputs, ports, nodeKey }) {
    //let { data } = useForm();
    let courier = useCourier();
    //let graph = useGraphSelector(graph => graph.graphId);

    /*runTest = () => {
        courier.test({ functionName: nodeKey)
    };*/

    return (
        <UI.Obj>
            <UI.TextInput k="name" />
            <UI.JSONInput k="args" /> 
            <UI.Obj k="inputs">
            {
                inputs.map(input => (
                    <UI.JSONInput k={input} key={input} label={ports[input].label} />
                ))
            }
            </UI.Obj>
            <UI.Button onClick={runTest}>Test</UI.Button>
        </UI.Obj>
    )
}


export default Node;
