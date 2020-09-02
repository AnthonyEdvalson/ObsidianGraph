import moment from 'moment';
import { util } from 'obsidian'
import { useSelector } from 'react-redux';

function addError(dispatch, baseError) {
    let errorId = util.uuid4();
    
    let data = { 
        ...baseError, 
        errorId,
        time: moment(),
        new: true
    };

    dispatch({ type: "NEW_ERROR", data });

    return data;
}

function focusError(dispatch, errorId) {
    dispatch({ type: "SET_FOCUS", focus: { errorId }});
}


function useErrorSelector(selector = () => {}) {
    let errorId = useSelector(state => state.focus.errorId);

    return useSelector(state => {
        let error = state.errors[errorId];
        if (!error)
            return null;

        return selector(error);
    });
}

export default {
    addError,
    focusError,
    useErrorSelector
}