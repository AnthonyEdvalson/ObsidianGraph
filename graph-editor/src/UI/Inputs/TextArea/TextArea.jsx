import React from 'react';
import { useForm } from '../../../Form';
import './TextArea.css';
import InputWrapper from '../InputWrapper';

function MultilineEdit(props) {
    let key = props.k;
    let form = useForm(key);
    
    const handleKeyDown = (event) => {
        if (event.keyCode === 9) {
            event.preventDefault();
            
            let start = event.target.selectionStart;
            let stop = event.target.selectionEnd;

            let val = form.data.substring(0, start) + "    " + form.data.substring(stop);
            onchange(e => { let v = val; form.handleChange(prevState => v)});
        }
    }

    return (
        <InputWrapper {...props}>
            <textarea className="TextArea ui-elem" value={form.data} onKeyDown={handleKeyDown} onChange={e => { let v = e.target.value; form.handleChange(() => v)}}></textarea>
        </InputWrapper>
    );
}

export default MultilineEdit;
