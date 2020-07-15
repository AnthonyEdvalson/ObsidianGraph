import React from 'react';
import UI from '../../../../UI';
import Form from '../../../../Form';
import { useDispatch } from 'react-redux';

function GraphSidebar(props) {
    let dispatch = useDispatch();

    function onChange(change) {
        dispatch({type: "CHANGE_SELECTION", change });
    }
    
    return (
        <Form.Form data={props.data} onChange={onChange}>
            <UI.TextInput k="name" />
            <UI.Checkbox k="hideInLibrary" />
            <UI.TextInput k="tags" />
            <UI.Label>Tags are spearated by spaces or commas</UI.Label>
            {/*<UI.Button onClick={showPackages}>Edit Packages</UI.Button>
            <UI.Button onClick={openTerminal}>Show in Terminal</UI.Button>
    <UI.Button onClick={openFolder}>Show in File System</UI.Button>*/}
        </Form.Form>
    );
}

export default GraphSidebar;
