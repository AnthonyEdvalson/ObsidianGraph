import { useCallback, useEffect } from "react";
import { useGraphDispatch, useGraphSelector } from "../../logic/scope";

function useSelectable(type, key) {
    const selection = useGraphSelector(graph => graph.selection);
    const dispatch = useGraphDispatch();
    let selectSet = !!selection;

    const selected = selectSet && selection.items.some(item => item.type === type && item.key === key);
    const dragging = selected && selection.dragging;
    
    let handleSelect = useCallback((e) => {
        if (!selected) {
            let ctrl = e && e.ctrlKey;
            dispatch({type: "SET_SELECTION", items: [{type, key}], ctrl});
        }
    }, [dispatch, key, type, selected]);

    useEffect(() => {
        if (selectSet) {
            dispatch({type: "REGISTER_SELECTABLE", item: {type, key}});
            return () => { dispatch({type: "UNREGISTER_SELECTABLE", item: {type, key}}) };
        }
    }, [selectSet, type, key, dispatch]);

    return [selected, handleSelect, dragging];
}

export default useSelectable;