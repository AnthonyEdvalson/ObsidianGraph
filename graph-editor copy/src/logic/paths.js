const path = window.require("path");

let fileMimes = {
    back:  {ext: "js",   folder: "back"     },
    front: {ext: "js",   folder: "front"    },
    data:  {ext: "json", folder: "resources"}
};

function getFilePath(name, type, projectFolder) {
    if (!(type in fileMimes))
        return null;

    let fd = fileMimes[type];
    let fileName = name + "." + fd.ext;

    try {
        return path.normalize(path.join(projectFolder, fd.folder, fileName));
    } catch (error) {
        console.log([projectFolder, fd.folder, fileName])
        throw error;
    }
}

function getGraphPath(targetLocation, currentLocation, projectPath) {
    if (targetLocation.type === "imported")
        return path.join(projectPath, ...targetLocation.dirs);
    
    if (targetLocation.type === "local")
        return path.join(projectPath, ...currentLocation, ...targetLocation);
}

function localPathToGraphLocation(graphPath, relativePath) {
    console.log();
    let parsedGraphPath = path.parse(graphPath);
    if (parsedGraphPath.ext === ".obg")
        graphPath = parsedGraphPath.dir;

    let parentDir = path.parse(relativePath).dir;    

    return {
        type: "local",
        dirs: path.relative(parentDir, graphPath).split(path.sep)
    }
}

export { getFilePath, getGraphPath, localPathToGraphLocation };
