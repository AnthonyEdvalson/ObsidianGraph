import React from 'react';
import UI from '../../../UI';
import Form from '../../../Form';
import { useDispatch } from 'react-redux';


function GraphSidebar(props) {
    let dispatch = useDispatch();

    function onChange(change) {
        dispatch({type: "CHANGE_SELECTION", change});
    }

    return (
        <Form.Form data={props.data} onChange={onChange}>
            <UI.TextInput k="name" />
            <UI.TextArea k="description" />
            <UI.TextInput k="author" />
            <UI.Checkbox k="hideInLibrary" />
            <UI.TextInput k="tags" />
            <UI.Label>Tags are spearated by spaces or commas</UI.Label>
        </Form.Form>
    );
}

export default GraphSidebar;
