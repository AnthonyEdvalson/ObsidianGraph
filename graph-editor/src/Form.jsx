import React, { useContext } from 'react';

const FormContext = React.createContext(null);

function useForm(key) {
    let form = useContext(FormContext);

    let setKey = typeof(key) !== "undefined";

    if (setKey && !(key in form.data))
    {
        throw Error("Cannot find key '" + key + "' in " + JSON.stringify(Object.keys(form.data, null, 2)));
    }

    let data = form.data;
    let handleChange = (change, path=[]) => {form.handleChange(change, setKey ? [key, ...path] : [...path])};
    let path = [...form.path]

    if (setKey) {
        data = data[key];
        path = [...form.path, key]
    }

    return {data, handleChange, path}
}

function Form(props) {
    if (typeof(props.data) === "undefined")
        return null;

    const modify = (prevState, path, change) => {
        if (path.length === 0) {
            return change(prevState);
        }
        
        let key = path[0];
        let newState = Array.isArray(prevState) ? [...prevState] : {...prevState};
        newState[key] = modify(prevState[key], path.slice(1), change);
        return newState;
    }

    const handleChange = (change, path=[]) => {
        props.onChange((prevState) => {
            return modify(prevState, path, change);
        })
    }

    let formData = {
        data: props.data,
        handleChange,
        path: []
    }
    
    return (
        <FormContext.Provider value={formData}>
            {props.children}
        </FormContext.Provider>
    )
}

function Accessor(props) {
    let formData = useForm(props.k);

    return (
        <FormContext.Provider value={formData}>
            {props.children}
        </FormContext.Provider>
    )
}

export default {
    Form,
    Accessor,
    FormContext
}

export { useForm }