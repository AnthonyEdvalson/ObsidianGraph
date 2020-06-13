function makeLookupReducer(handlers, defaultVal, assertGraphId=false) {
    return (state, action) => {
        if (typeof(state) === "undefined")
            return defaultVal;

        if (action.type in handlers) {
            if (assertGraphId && typeof(action.graphId) === "undefined")
                throw new Error("Cannot run " + JSON.stringify(action) + " without specifying a graphId");

            return handlers[action.type](state, action);
        }
        
        return state;
    }
}

export { makeLookupReducer };
