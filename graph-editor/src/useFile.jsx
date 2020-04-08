import { useState } from 'react';
import path from 'path';
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

let fileDatas = {
    py:   {ext: "py",   folder: "back", content: "def main(o):\n\t\n"},
    js:   {ext: "js",   folder: "front", content: "import React from 'react';\n\nfunction main(o) {\n\t\n}\n\nexport default main;\n"},
    data: {ext: "json", folder: "resources", content: ""}
};

function getFilePath(name, type, projectFolder) {
    if (!(type in fileDatas))
        return null;

    let fd = fileDatas[type];
    let fileName = name + "." + fd.ext;

    try {
        return path.normalize(path.join(projectFolder, fd.folder, fileName));
    } catch (error) {
        console.log([projectFolder, fd.folder, fileName])
        throw error;
    }
}

function useFileRef(name, type, folder) {
    let [oldPath, setOldPath] = useState(null);

    let filePath = getFilePath(name, type, folder);

    if (!filePath)
        return;
        
    let fd = fileDatas[type];

    if (filePath !== oldPath) {
        if (oldPath === null) {
            // First load, make sure the file exists

            fs.access(filePath, err => {
                if (err) {
                    // File does not exist, so create an empty one
                    fs.writeFile(filePath, fd.content, err => {
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
export { getFilePath }
