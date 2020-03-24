import React from 'react';
import Form, { useForm } from '../../../Form';
import InputWrapper from '../InputWrapper';
import './List.css';
import Foldout from '../../Foldout';

function ListEdit(props) {
    let key = props.k;
    let form = useForm(key);

    const handleAdd = props.handleAdd || ((e) => {
        form.handleChange(prevState => ([...prevState, props.defaultFactory()]));
    });

    const handleDelete = props.handleChange || ((k) => {
        form.handleChange(prevState => {
            let newData = [...prevState];
            newData.splice(k, 1);
            return newData;
        });
    });

    const handleUp = (k) => {
        form.handleChange(prevState => {
            let newData = [...prevState];
            let t = newData[k-1];
            newData[k-1] = newData[k];
            newData[k] = t;
            return newData;
        })
    }

    React.Children.only(props.children);
    
    if ("k" in props.children.props)
        throw new Error("The child of <List> cannot have the 'k' property set, it will be assigned by the list");

    return (
        <div className="List ui-elem">
            <Form.Accessor k={key}>
                <InputWrapper {...props}>
                    <div className="list-items">
                    {
                        form.data.map((v, i) => {
                            return <Item i={i} key={i} handleDelete={handleDelete} handleUp={handleUp} child={props.children} />
                        })
                    }
                    </div>
                    <div className="list-add" onClick={handleAdd}>+</div>
                </InputWrapper>
            </Form.Accessor>
        </div>
    );
}

function Item(props) {
    let i = props.i;

    let foldoutActions = (
        <>
            <div className="heading-action-right" onClick={e => props.handleDelete(i)}>−</div>
            {i > 0 && <div className="heading-action-right" onClick={e => props.handleUp(i)}>🠅</div> }
        </>
    )

    return (
        <div className="list-item">
            <Foldout label={"Index " + i.toString()} actions={foldoutActions} open={false}>
                <Form.Accessor k={i}>
                    {React.cloneElement(props.child, { key: i })}
                </Form.Accessor>
            </Foldout>
        </div>
    );
}

export default ListEdit;