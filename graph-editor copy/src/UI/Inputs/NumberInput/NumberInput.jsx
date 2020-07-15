import React from 'react';
import { useForm } from '../../../Form';
import './NumberInput.css';
import InputWrapper from '../InputWrapper';

function NumberInput(props) {
    let key = props.k;
    let form = useForm(key);
    
    let value = parseInt(form.data);

    let handleChange = e => {
        let v = e.target.value; 
        form.handleChange(() => parseInt(v));
    }

    return (
        <InputWrapper {...props}>
            <input className="NumberInput ui-line-elem" type="number" value={value} onChange={handleChange}></input>
        </InputWrapper>
    );
}
    

export default NumberInput;
