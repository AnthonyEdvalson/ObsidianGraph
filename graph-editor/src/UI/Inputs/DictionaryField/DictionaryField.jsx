import React from 'react';
import './DictionaryField.css';
import InputWrapper from '../InputWrapper';
import TextInput from '../TextInput';
import Indent from '../../Indent';

function DictionaryField(props) {
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
