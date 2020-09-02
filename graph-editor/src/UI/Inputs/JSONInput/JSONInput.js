import React from 'react';
import { useForm } from '../../../Form';
import InputWrapper from '../InputWrapper/InputWrapper';
import './JSONInput.css';

import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
// test

function JSEditor(props) {
    let { data, handleChange } = useForm(props.k);
    
    return (
        <InputWrapper {...props}>
            <div className="JSEditor">
                <Editor
                    value={ data }
                    onValueChange={ code => handleChange(() => code)}
                    highlight={code => highlight(code, languages.js)}
                    tabSize={2}
                />  
            </div>
        </InputWrapper>
    );
}

export default JSEditor;