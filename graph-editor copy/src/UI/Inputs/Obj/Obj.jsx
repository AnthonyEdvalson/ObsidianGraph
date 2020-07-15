import React from 'react';
import Form from '../../../Form';
import './Obj.css';
import InputWrapper from '../InputWrapper';


function Obj(props) {
    let key = props.k;

    return (
        <div className="Obj ui-elem">
            <InputWrapper {...props}>
                <Form.Accessor k={key}>
                    <div className="obj-contents">
                            {props.children}
                    </div>
                </Form.Accessor>
            </InputWrapper>
        </div>
    );
}

export default Obj;
