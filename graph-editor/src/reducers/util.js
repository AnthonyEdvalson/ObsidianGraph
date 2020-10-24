import { util } from 'obsidian';

function lookupReducerFactory(handlers, defaultVal) {
    return (state, action, fullState) => {
        if (state === undefined)
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
                return util.graft(state, id, newProjectState);
        }

        return state;
    }
}

function combineReducers(reducers) {
    // First get an array with all the keys of the reducers (the reducer names)
    const reducerKeys = Object.keys(reducers);
  
    return function combination(state = {}, action, ...args) {
        const nextState = {}  
        for (let i = 0; i < reducerKeys.length; i++) {
            const key = reducerKeys[i];
            const reducer = reducers[key];
            const previousStateForKey = state[key];
            const nextStateForKey = reducer(previousStateForKey, action, ...args);
            nextState[key] = nextStateForKey;
        }
        return nextState;
    }
  }

export { lookupReducerFactory, indexedReducerFactory, combineReducers };
