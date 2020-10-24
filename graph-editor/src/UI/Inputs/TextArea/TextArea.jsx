import React from 'react';
import { useForm } from '../../../Form';
import './TextArea.css';
import InputWrapper from '../InputWrapper';
import useAutoFocus from '../useAutoFocus';

function MultilineEdit(props) {
    let key = props.k;
    let form = useForm(key);
    let focus = useAutoFocus(props.autoFocus);

    let updateOn = props.updateOn || "change";

    function onChange(e) {
        if (updateOn === "change") {
            let v = e.target.value; 
            form.handleChange(() => v);
        }
    }

    function onBlur(e) {
        if (updateOn === "blur") {
            let v = e.target.value; 
            form.handleChange(() => v);
        }
    }

    return (
        <InputWrapper {...props}>
            <textarea className="TextArea ui-elem" value={form.data} onChange={onChange} onBlur={onBlur} ref={focus}></textarea>
        </InputWrapper>
    );
}

export default MultilineEdit;
