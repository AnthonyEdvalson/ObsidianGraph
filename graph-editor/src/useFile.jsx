import { useState } from 'react';
import paths from './logic/paths';
const fs = window.require('fs');

/*
let fileDefaults = {
    back:  "function main(o) {\n\t\n}\n\nmodule.exports = { main };\n",
    front: "import React from 'react';\n\nfunction Main(o) {\n\t\n}\n\nmodule.exports = { main: Main };\n",
    data:  ""
};

function useFileRef(name, type, folder) {
    let [oldPath, setOldPath] = useState(null);

    let filePath = paths.getFilePath(name, type, folder);

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
*/