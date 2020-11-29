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
    if (schema === null)
        return null;

    switch (schema.type) {
        case "text":
        case "textarea":
            return schema.default || "";
        case "number":
            return schema.default || 0;
        case "bool":
            return schema.default || false;
        case "enum":
            return schema.default || (Array.isArray(schema.options[0]) ? schema.options[0][0] : schema.options[0]);
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

function conformToSchema(schema, param) {
    let pType = typeof(param);
    let forceType = type => (type === pType) ? param : getDefaultParams(schema);

    if (schema == null)
        return null;

    switch (schema.type){
        case "text":
        case "textarea":
            return forceType("string");
        case "number":
            return forceType("number");
        case "bool":
            return forceType("boolean");
        case "enum":
            if (schema.options.some(x => (Array.isArray(x) ? x[0] : x) === param ))
                return param;

            return getDefaultParams(schema);
        case "list":
            if (Array.isArray(param))
                return param.map(i => conformToSchema(schema.field, i));

            return getDefaultParams(schema);
        case "object":
            if (pType !== "object")
                return getDefaultParams(schema);
            
            let obj = {};  
            for (let [k, v] of Object.entries(schema.fields))
                obj[k] = conformToSchema(v, param[k]);
            return obj;
        default:
            throw new Error("Unknown type " + schema.type + " in " + JSON.stringify(schema, null, 2));
    }
}

class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
  
    static getDerivedStateFromError(error) {
      // Update state so the next render will show the fallback UI.
      return { hasError: true };
    }
  
    componentDidCatch(error, errorInfo) {
        console.error(error);
    }
  
    render() {
      if (this.state.hasError) {
        // You can render any custom fallback UI
        return <h1>Something went wrong.</h1>;
      }
  
      return this.props.children; 
    }
  }

function Schema(props) {
    let data = useForm(props.dk);
    let schema = useForm(props.k);

    if (schema.data === null)
        return null;
    
    return (
        <ErrorBoundary>
            <Form.Form onChange={data.handleChange} data={data.data}>
                <SchemaElement { ...schema.data } />
            </Form.Form>
        </ErrorBoundary>
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
            return <Dropdown { ...props } onlyValueTypes />
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
export { getDefaultParams, conformToSchema };
