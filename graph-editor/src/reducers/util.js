import { graft } from '../util';

function lookupReducerFactory(handlers, defaultVal) {
    return (state, action, fullState) => {
        if (typeof(state) === "undefined")
            return defaultVal;

        if (action.type in handlers)
            return handlers[action.type](state, action, fullState);
        
        return state;
    }
}

function indexedReducerFactory(itemReducer, itemId) {
    return (state, action, fullState) => {
        if (itemId in action) {
            let id = action[itemId];

            if (!(id in state))
                throw new Error(`${id} is not a loaded ${itemId}. valid ones include ${JSON.stringify(Object.keys(state))}`);
            
            let projectState = state[id];
            let newProjectState = itemReducer(projectState, action, fullState);
    
            if (newProjectState !== projectState)
                return graft(state, id, newProjectState);
        }

        return state;
    }
}

export { lookupReducerFactory, indexedReducerFactory };
