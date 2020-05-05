import React from 'react';
import UI from '../../../UI';
import Form from '../../../Form';
import { useDispatch, useSelector } from 'react-redux';
const { shell } = window.require("electron").remote;


function GraphSidebar(props) {
    let dispatch = useDispatch();

    let path = useSelector(state => state.graph.present.path);

    function onChange(change) {
        dispatch({type: "CHANGE_SELECTION", change});
    }

    function showPackages() {
        dispatch({type: "SET_MODAL_OPEN", name: "packages", open: true});
    }

    function openTerminal() {
        
    }

    function openFolder() {
        shell.openItem(path);
    }
    
    return (
        <Form.Form data={props.data} onChange={onChange}>
            <UI.TextInput k="name" />
            <UI.TextArea k="description" />
            <UI.TextInput k="author" />
            <UI.Checkbox k="hideInLibrary" />
            <UI.TextInput k="tags" />
            <UI.Label>Tags are spearated by spaces or commas</UI.Label>
            <UI.Button onClick={showPackages}>Edit Packages</UI.Button>
            <UI.Button onClick={openTerminal}>Show in Terminal</UI.Button>
            <UI.Button onClick={openFolder}>Show in File System</UI.Button>
        </Form.Form>
    );
}

export default GraphSidebar;
