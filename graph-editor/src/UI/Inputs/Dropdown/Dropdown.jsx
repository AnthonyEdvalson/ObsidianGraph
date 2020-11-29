import React from 'react';
import { useForm } from '../../../Form';
import './Dropdown.css';
import InputWrapper from '../InputWrapper';
import useAutoFocus from '../useAutoFocus';
import { formatKey } from '../InputWrapper/InputWrapper';

function Dropdown(props) {
    let key = props.k;
    let form = useForm(key);
    let focus = useAutoFocus(props.autoFocus);

    let handleChange = e => {
        let v = e.target.value; 
        form.handleChange(() => JSON.parse(v));
    }

    return (
        <InputWrapper {...props}>
            <div className="Dropdown ui-line-elem">
                <select className="ui-line-elem" value={JSON.stringify(form.data)} onChange={handleChange} ref={focus}>
                    {
                        props.options.map(o => {
                            let value, label;

                            if (typeof(o) === "string"){
                                value = o;
                                label = formatKey(o);
                            }
                            else if (Array.isArray(o)) {
                                value = o[0];
                                label = o[1];
                            }

                            let isValType = !["function", "object", "undefined", "symbol"].includes(typeof(value));
                            if (value === null)
                                isValType = true;

                            if (props.onlyValueTypes && !isValType)
                                throw new Error("This dropdown only allows value values, no objects, functions, etc.\n" +
                                                "Dropdown was given the data " + JSON.stringify(value) + " with the label " + label);
                            
                            return <option key={label} value={JSON.stringify(value)}>{label}</option>  
                        })
                    }
                </select>
            </div>
        </InputWrapper>
    );
}

export default Dropdown;
