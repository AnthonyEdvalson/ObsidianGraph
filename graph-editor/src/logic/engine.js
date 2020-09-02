import React, { useContext, useEffect, useMemo } from 'react';
import { Courier } from 'obsidian';

const CourierContext = React.createContext(null);

function useCourier() {
    return useContext(CourierContext);
}

function useListener(event, listener) {
    let courier = useCourier();

    useEffect(() => {
        let handler = courier.on(event, listener);
        return () => courier.off(event, handler);
    }, [courier, event, listener]);
}

function Engine({ href, children }) {
    const courier = useMemo(() => new Courier(href), [href], []); //TODO: destructor???

    return (
        <CourierContext.Provider value={courier}>
            {children}
        </CourierContext.Provider>
    );
}

export default {
    Engine,
    useCourier,
    useListener
}