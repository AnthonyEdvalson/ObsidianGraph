import React from 'react';
import { useGraphDispatch, useGraphSelector } from '../../../logic/scope';

import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-css';
import './CSS.css';

function CSS({ setMenu }) {
    let data = useGraphSelector(graph => graph.css);
    let dispatch = useGraphDispatch();

    if (data === undefined || data === null)
        return null;

    return (
        <div className="CSS">
            <Editor
                value={ data }
                onValueChange={ css => dispatch({type: "SET_GRAPH_CSS", css }) }
                highlight={code => highlight(code, languages.css)}
                tabSize={2}
            />  
        </div>
    )
}

export default CSS;