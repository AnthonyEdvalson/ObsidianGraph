import { useState } from 'react';
import { getFilePath } from './logic/paths';
const fs = window.require('fs');

/*function read(filePath, handleChange) {
    fs.readFile(filePath, 'utf8', (err, content) => {
        if (err) throw err;

        handleChange(prevState => ({
            ...prevState,
            content
        }));
    });
}

function write(filePath, content) {
    fs.writeFile(filePath, content, (err) => {
        if (err) throw err;
    });
}

function rename(oldPath, newPath, handleChange) {
    fs.rename(oldPath, newPath, err => {
        if (err) throw err;
        handleChange(prevState => ({ ...prevState, path: newPath }));
    });
}

function useFile(file, handleChange) {
    const filePath = file.path;
    const content = file.content;

    const setFile = (newContent) => write(file, newContent);
    const [watcher, setWatcher] = useState(null);
    const renameFile = (newPath) => rename(filePath, newPath, handleChange);

    useEffect(() => {
        read(filePath, handleChange);

        setWatcher(() => (
            fs.watch(filePath, { persistent: false }, (etype) => {
                if (etype !== "change")
                    return;
                read(filePath, handleChange);
            })
        ));

        return watcher.close;
    }, [filePath, handleChange]);

    return [content, setFile, renameFile];
}*/

let fileDefaults = {
    back:  "function main(o) {\n\t\n}\n\nmodule.exports = { main };\n",
    front: "import React from 'react';\n\nfunction Main(o) {\n\t\n}\n\nmodule.exports = { main: Main };\n",
    data:  ""
};

function useFileRef(name, type, folder) {
    let [oldPath, setOldPath] = useState(null);

    let filePath = getFilePath(name, type, folder);

    if (!filePath)
        return;

    if (filePath !== oldPath) {
        if (oldPath === null) {
            // First load, make sure the file exists

            fs.access(filePath, err => {
                if (err) {
                    // File does not exist, so create an empty one
                    fs.writeFile(filePath, fileDefaults[type], err => {
                        if (err) throw err;
                    });
                }
            });
        }
        else
        {
            // File name has been changed, rename

            fs.rename(oldPath, filePath, err => {
                if (err) throw err;
            });
        }
        setOldPath(filePath);
    }

    return filePath;
}

export default useFileRef;
