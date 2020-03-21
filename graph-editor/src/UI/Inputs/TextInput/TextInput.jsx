import React from 'react';
import { useForm } from '../../../Form';
import './TextInput.css';
import InputWrapper from '../InputWrapper';

function TextEdit(props) {
    let key = props.k;
    let form = useForm(key);
    
    return (
        <InputWrapper {...props}>
            <input className="TextInput ui-line-elem" type="text" value={form.data} onChange={e => { let v = e.target.value; form.handleChange(prevState => v)}}></input>
        </InputWrapper>
    );
}

export default TextEdit;