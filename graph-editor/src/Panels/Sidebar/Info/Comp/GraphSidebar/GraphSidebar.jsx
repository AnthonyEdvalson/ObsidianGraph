import React from 'react';
import UI from '../../../../../UI';
import Form from '../../../../../Form';
import { useGraphDispatch } from '../../../../../logic/scope';

function GraphSidebar(props) {
    let dispatch = useGraphDispatch();

    function onChange(change) {
        dispatch({type: "CHANGE_SELECTION", change });
    }
    
    return (
        <Form.Form data={props.data} onChange={onChange}>
            <UI.Foldout label="Graph Settings">
                <UI.TextInput k="name" />
                <UI.TextArea k="description" />
                <UI.Checkbox k="hideInLibrary" />
                <UI.TextInput k="tags" />
                <UI.Label>Tags are spearated by spaces or commas</UI.Label>
            </UI.Foldout>
            {/*<UI.Button onClick={showPackages}>Edit Packages</UI.Button>
            <UI.Button onClick={openTerminal}>Show in Terminal</UI.Button>
    <UI.Button onClick={openFolder}>Show in File System</UI.Button>*/}
        </Form.Form>
    );
}

export default GraphSidebar;
