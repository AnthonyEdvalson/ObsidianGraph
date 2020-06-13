import { useDispatch } from "react-redux";
import { useCallback, useEffect } from "react";
import { useGraphSelector, useGraphKey } from "../../logic/graphs";

function useSelectable(type, key) {
    const selection = useGraphSelector(graph => graph.selection);
    const graphId = useGraphKey();
    console.log(selection, graphId)
    const dispatch = useDispatch();
    let selectSet = !!selection;

    const selected = selectSet && selection.items.some(item => item.type === type && item.key === key);
    const dragging = selected && selection.dragging;
    
    let handleSelect = useCallback((e) => {
        if (!selected) {
            let ctrl = e && e.ctrlKey;
            dispatch({type: "SET_SELECTION", items: [{type, key}], ctrl, graphId});
        }
    }, [dispatch, key, type, selected, graphId]);

    useEffect(() => {
        if (selectSet) {
            dispatch({type: "REGISTER_SELECTABLE", item: {type, key}, graphId });
            return () => { dispatch({type: "UNREGISTER_SELECTABLE", item: {type, key}, graphId }) };
        }
    }, [selectSet, type, key, dispatch, graphId])

    return [selected, handleSelect, dragging];
}

export default useSelectable;