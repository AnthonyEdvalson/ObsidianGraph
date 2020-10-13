import React from 'react';
import { useForm } from '../../../Form';
import './Dropdown.css';
import InputWrapper from '../InputWrapper';

function Dropdown(props) {
    let key = props.k;
    let form = useForm(key);

    let handleChange = e => {
        let v = e.target.value; 
        form.handleChange(() => JSON.parse(v));
    }

    return (
        <InputWrapper {...props}>
            <div className="Dropdown ui-line-elem">
                <select className="ui-line-elem" value={JSON.stringify(form.data)} onChange={handleChange}>
                    {
                        props.options.map(([value, label]) => (
                          <option key={label} value={JSON.stringify(value)}>{label}</option>  
                        ))
                    }
                </select>
            </div>
        </InputWrapper>
    );
}

export default Dropdown;
