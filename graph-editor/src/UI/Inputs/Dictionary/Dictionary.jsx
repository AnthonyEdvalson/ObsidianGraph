import React from 'react';
import './Dictionary.css';
import InputWrapper from '../InputWrapper';
import TextInput from '../TextInput';
import Indent from '../../Indent';
import Form, { useForm } from '../../../Form';

function Dictionary(props) {
    let { data, handleChange } = useForm()

    function renameKey(oldName, newName) {
        if (oldName === newName || Object.keys(data).includes(newName))
            return;

        handleChange(oldData => {
            let newData = {
                ...oldData
            };
            newData[newName] = oldData[oldName];
            delete newData[oldName];
            return newData;
        });
    }

    return (
        <div className="Dictionary ui-elem">
            <InputWrapper {...props}>
                {
                    Object.entries(data).map(([name, value]) => 
                        <>
                            <Form.Form data={name} onChange={newName => renameKey(name, newName)}>
                                <TextInput updateOn="blur" />
                            </Form.Form>
                            <Form.Accessor k={name}>
                                {props.children}
                            </Form.Accessor>
                        </>
                    )
                }
                <Form.Accessor>

                </Form.Accessor>
                <Indent>
                    {props.children}
                </Indent>
            </InputWrapper>
        </div>
    );
}

export default Dictionary;
