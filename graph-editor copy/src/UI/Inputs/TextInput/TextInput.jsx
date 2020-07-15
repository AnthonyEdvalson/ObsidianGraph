import React, { useState, useEffect } from 'react';
import { useForm } from '../../../Form';
import './TextInput.css';
import InputWrapper from '../InputWrapper';

function TextEdit(props) {
    let key = props.k;
    let form = useForm(key);
    let data = form.data;
    let [buffer, setBuffer] = useState(data);

    function save(v) {
        form.handleChange(() => v);
    }

    useEffect(() => {
        setBuffer(data);
    }, [data]);

    let updateOn = props.updateOn || "change";

    let onChange = () => {};
    let onBlur = () => {};
    let value = "";

    if (updateOn === "blur") {
        onBlur = e => { save(e.target.value); };
        onChange = e => {
            let v = e.target.value;
            setBuffer(v);
        }
        value = buffer;
    }
    else {
        onChange = e => { save(e.target.value); };
        value = form.data;
    }
    
    return (
        <InputWrapper {...props}>
            <input className="TextInput ui-line-elem" type="text" value={value} onChange={onChange} onBlur={onBlur}></input>
            {props.children}
        </InputWrapper>
    );
}

export default TextEdit;