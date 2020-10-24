import React from 'react';
import './Checkbox.css';
import { useForm } from '../../../Form';
import useAutoFocus from '../useAutoFocus';
import InputWrapper from '../InputWrapper';


function Checkbox(props) {
    let key = props.k;
    let form = useForm(key);
    let focus = useAutoFocus(props.autoFocus);
    

    let handleChange = e => {
        let v = e.target.checked;
        form.handleChange(() => v);
    }

    return (
        <InputWrapper {...props}>
            <div className="Checkbox ui-line-elem">
                <input type="checkbox" checked={form.data} onChange={handleChange} ref={focus}/>
                <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path className="check" fill="none" d="M3.0 12.0l5.0 5.0 12.0 -12.0"/></svg>
            </div>
        </InputWrapper>
    );
}

export default Checkbox;
