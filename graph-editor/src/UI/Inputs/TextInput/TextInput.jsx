import React, { useState, useEffect } from 'react';
import { useForm } from '../../../Form';
import './TextInput.css';
import InputWrapper from '../InputWrapper';
import useAutoFocus from '../useAutoFocus';

function TextEdit(props) {
    let key = props.k;
    let form = useForm(key);
    let data = form.data;
    let [buffer, setBuffer] = useState(data);
    let focus = useAutoFocus(props.autoFocus);

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
            <input 
                className="TextInput ui-line-elem" 
                type="text" 
                value={value} 
                onChange={onChange} 
                onBlur={onBlur} 
                ref={focus}
                placeholder={props.placeholder}
            ></input>
            {props.children}
        </InputWrapper>
    );
}

export default TextEdit;