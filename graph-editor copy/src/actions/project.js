const fs = window.require('fs');
const path = window.require('path');


function LOAD_PROJECT(state, action) {
    let newState = {
        ...action.data,
        path: action.folderPath || path.dirname(action.filePath),
    };

    return newState;
}

function NEW_PROJECT(state, action) {
    let name = action.name;
    let dir = path.join(action.directory, name);
    let obpPath = path.join(dir, name + ".obp");

    let obp = {
        name,
        author: action.author,
        description: action.description,
        tags: "",
        hideInLibrary: false
    };
    
    fs.access(dir, err => {
        if (!err) throw(new Error(dir + " already exists"));

        fs.mkdir(dir, { recursive: true }, err => {
            if (err) throw(err);
            
            fs.writeFile(obpPath, JSON.stringify(obp, null, 2), err => {
                if (err) throw err;
            });
        });
    });

    return LOAD_PROJECT(state, { folderPath: dir, data: obp });
}

export default { LOAD_PROJECT, NEW_PROJECT };
