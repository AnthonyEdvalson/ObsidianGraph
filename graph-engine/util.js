function graft(map, key, value) {
    let newMap = { ...map };
    newMap[key] = value;
    return newMap;
}

function access(object, ...keys) {
    let current = object;

    for (let key of keys) {
        if (!(key in current))
            throw new Error(`Cannot find ${key} when resolving ${keys.join(".")}\nValid Keys: ${Object.keys(current).join(", ")}`);
        
        current = current[key];
    }

    return current;
}

function transform(object, mapper) {
    let newObject = {};

    for (let [k, v] of Object.entries(object))
        newObject[k] = mapper(v);
    
    return newObject
}

export {
    graft,
    access,
    transform
}
