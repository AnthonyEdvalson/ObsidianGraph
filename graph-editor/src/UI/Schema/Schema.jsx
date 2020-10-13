import React from 'react';
import Obj from '../Inputs/Obj';
import TextInput from '../Inputs/TextInput';
import NumberInput from '../Inputs/NumberInput';
import Checkbox from '../Inputs/Checkbox';
import List from '../Inputs/List';
import Dropdown from '../Inputs/Dropdown';
import TextArea from '../Inputs/TextArea';
import Form, { useForm } from '../../Form';
import './Schema.css';


function getDefaultParams(schema) {
    switch (schema.type) {
        case "text":
        case "textarea":
            return schema.default || "";
        case "number":
            return schema.default || 0;
        case "bool":
            return schema.default || false;
        case "enum":
            return schema.default || schema.options[0];
        case "list":
            let lis = [];
            let count = schema.defaultCount === undefined ? 1 : schema.defaultCount;
            for (let i = 0; i < count ; i++)
                lis.push(getDefaultParams(schema.field));
            return lis;
        case "object":
            let obj = {};
            for (let [k, v] of Object.entries(schema.fields))
                obj[k] = getDefaultParams(v);
            return obj;
        default:
            throw new Error("Unknown type " + schema.type + " in " + JSON.stringify(schema, null, 2));
    }
}


function Schema(props) {
    let data = useForm(props.dk);
    let schema = useForm(props.k);

    if (schema.data === null)
        return null;
    
    return (
        <Form.Form onChange={data.handleChange} data={data.data}>
            <SchemaElement { ...schema.data } />
        </Form.Form>
    );
}

function SchemaElement(props) {
    switch (props.type) {
        case "text":
            return <TextInput { ...props } />
        case "textArea":
            return <TextArea { ...props } />
        case "number":
            return <NumberInput { ...props } />
        case "bool":
            return <Checkbox { ...props } />
        case "list":
            return (
                <List { ...props } defaultFactory={() => getDefaultParams(props.field)}>
                    <SchemaElement { ...props.field } />
                </List>
            );
        case "enum":
            return <Dropdown { ...props } />
        case "object":
            return (
                <Obj { ...props }>
                    { Object.entries(props.fields).map(([k, v]) => <SchemaElement { ...v } k={k} key={k} />) }
                </Obj>
            );
        default:
            return <div className="schema-error">{"unknown type: " + props.type + " in " + JSON.stringify(props, null, 2)}</div>
    }
}

export default Schema;
export { getDefaultParams };
