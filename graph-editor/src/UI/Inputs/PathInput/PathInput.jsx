import React from 'react';
import { useForm } from '../../../Form';
import './PathInput.css';
import TextInput from '../TextInput';
import Button from '../../Button';
const { dialog } = window.require("electron").remote;


function PathInput(props) {
    let key = props.k;
    let form = useForm(key);

    async function handleDialog() {
        let options = {
            ...props.dialogOptions,
            multiSelections: false
        };

        let result = await dialog.showSaveDialog(options);

        if (!result.canceled) {
            let path = result.filePath;
            form.handleChange(() => path);
        }
    }

    return (
        <div className="PathInput">
            <TextInput { ...props }>
                <Button onClick={handleDialog}>...</Button>
            </TextInput>
        </div>
    )
}

export default PathInput;
