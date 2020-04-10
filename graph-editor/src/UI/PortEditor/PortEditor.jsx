import React from 'react';
import TextInput from '../Inputs/TextInput';
import './PortEditor.css';
import Dropdown from '../Inputs/Dropdown';
import Form, { useForm } from '../../Form';
import { useSelector, useDispatch } from 'react-redux';


function PortEditor(props) {
    let key = useForm(props.k);
    let data = useSelector(state => state.graph.present.ports[key.data]);
    let dispatch = useDispatch();

    function handleChange(change) {
        dispatch({type: "CHANGE_PORT", change, port: key.data});
    }

    return (
        <Form.Form onChange={handleChange} data={data}>
            <TextInput k="label" />
            <Dropdown k="type" options={props.typeOptions} />
        </Form.Form>
    );
}

export default PortEditor;