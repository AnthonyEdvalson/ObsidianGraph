import { useSelector, useDispatch } from "react-redux";
import { useCallback, useEffect } from "react";

function useSelectable(type, key) {
    const selection = useSelector(state => state.graph.present.selection);
    const dispatch = useDispatch();
    let selectSet = !!selection;

    const selected = selectSet && selection.items.some(item => item.type === type && item.key === key);
    
    let handleSelect = useCallback((e) => {
        if (!selected) {
            let ctrl = e.ctrlKey;
            dispatch({type: "SET_SELECTION", items: [{type, key}], ctrl});
        }
    }, [dispatch, key, type, selected]);

    useEffect(() => {
        if (selectSet) {
            dispatch({type: "REGISTER_SELECTABLE", item: {type, key}});
            return () => { dispatch({type: "UNREGISTER_SELECTABLE", item: {type, key}}) };
        }
    }, [selectSet, type, key, dispatch])

    return [selected, handleSelect];
}

export default useSelectable;