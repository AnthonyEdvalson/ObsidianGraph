import React from 'react';
import { useContext } from "react";

const SetMenuItemsContext = React.createContext(null);

function useMenu(name, items, order=0) {
    let setMenuItems = useContext(SetMenuItemsContext);
    setMenuItems(name, items, order);
}

export default useMenu;