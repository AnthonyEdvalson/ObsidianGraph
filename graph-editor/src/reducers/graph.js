import { makeLookupReducer } from "./util";  

function clientToGraph(x, y, gt) {
    return {
        x: (x - gt.x) / gt.scale,
        y: (y - gt.y) / gt.scale
    }
}

function MOVE_GRAPH(state, {ds, dy, dx, pivot}) {
    let newState = {
        ...state,
        transform: { ...state.transform }
    };

    if (ds) {
        let {x, y} = clientToGraph(pivot.x, pivot.y, newState.transform);
        newState.transform.scale *= ds;
        newState.transform.x -= (x * (1 - 1 / ds)) * newState.transform.scale;
        newState.transform.y -= (y * (1 - 1 / ds)) * newState.transform.scale;
    }
    if (dx)
        newState.transform.x += dx;
    if (dy)
        newState.transform.y += dy;
    return newState;
}


export default makeLookupReducer({ MOVE_GRAPH }, {}, true);
