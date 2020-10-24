import { useEffect, useRef } from "react";

function useAutoFocus(_, enable) {
    let ref = useRef(null);

    useEffect(() => {
        if (enable && ref.current)
            ref.current.focus();
    }, [enable]);

    return ref;
}

export default { main: useAutoFocus }