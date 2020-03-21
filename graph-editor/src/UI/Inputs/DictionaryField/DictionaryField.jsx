import React from 'react';
//import { useForm } from '../../../Form';
import './DictionaryField.css';
import InputWrapper from '../InputWrapper';
import TextInput from '../TextInput';
import Indent from '../../Indent';

function DictionaryField(props) {
    //let key = props.k;
    //let form = useForm(key);

    /*let handleChange = e => {
        let v = e.target.value; 
        form.handleChange(() => v);
    }*/

    return (
        <div className="DictionaryField ui-elem">
            <InputWrapper {...props}>
                <TextInput />
                <Indent>
                    {props.children}
                </Indent>
            </InputWrapper>
        </div>
    );
}

export default DictionaryField;
