import React from 'react';
import { useForm } from '../../../Form';
import './PathInput.css';
import TextInput from '../TextInput';
import Button from '../../Button';
const { dialog } = window.require("electron").remote;


function PathInput(props) {
    let key = props.k;
    let form = useForm(key);

    function handleDialog() {
        let options = {
            ...props.dialogOptions,
            multiSelections: false
        };

        dialog.showSaveDialog(options).then(result => {
            if (!result.canceled && result.filePaths.length > 0) {
                let path = result.filePaths[0];
                form.handleChange(() => path);
            }
        });
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
