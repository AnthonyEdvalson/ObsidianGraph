function makeLookupReducer(handlers, defaultVal) {
    return (state, action) => {
        if (typeof(state) === "undefined")
            return defaultVal;

        if (action.type in handlers)
            return handlers[action.type](state, action);
        
        return state;
    }
}

export { makeLookupReducer };
