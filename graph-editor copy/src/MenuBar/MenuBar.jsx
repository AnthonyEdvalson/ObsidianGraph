import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './MenuBar.css';
import Actions from './Actions';
import Mousetrap from 'mousetrap';

function MenuItem(props) {
    return (
        <div className="MenuItem">
            <span className="menu-item-label">{props.label}</span>
            <div className="menu-dropdown">
                {props.children}
            </div>
        </div>
    )
} 

 
function MenuOption(props) {
    let action = (e) => {
        e.preventDefault();
        Actions[props.action](props.state, props.dispatch);
    }
    
    useEffect(() => {
        if (props.shortcut) {
            Mousetrap.bind(props.shortcut.toLowerCase(), action)
            return () => {
                 Mousetrap.unbind(props.shortcut.toLowerCase());
            }
        }
    });

    return (
        <div className="MenuOption" onClick={action}>
            <span>{props.children}</span>
            <small>{props.shortcut}</small>
        </div>
    )
}


function MenuBar() {
    const state = useSelector(s => s);
    const dispatch = useDispatch();

    const layout = [
        { 
            name: "File", 
            options: [
                {name: "New Graph...", shortcut: "Mod+N", action: "new"},
                {name: "Open Graph...", shortcut: "Mod+O", action: "open"},
                {name: "Save...", shortcut: "Mod+S", action: "save"},
                null,
                //{name: "Save As...", shortcut: "Ctrl+Shift+S", action: "saveAs"},
                {name: "Export...", shortcut: "Mod+E", action: "exportGraph"},
                {name: "Open GLIB Folder", action: "showGLIB"},
                null,
                {name: "Dev Tools", shortcut: "F12", action: "devtools"},
                {name: "Refresh", shortcut: "F5", action: "refresh"},
                {name: "Exit", action: "exit"}
            ],
        },
        {
            name: "Edit",
            options: [
                {name: "Undo", shortcut: "Mod+Z", action: "undo"},
                {name: "Redo", shortcut: "Mod+Y", action: "redo"},
                null,
                {name: "Select All", shortcut: "Mod+A", action: "selectAll"},
                {name: "Copy", shortcut: "Mod+C", action: "copy"},
                {name: "Paste", shortcut: "Mod+V", action: "paste"},
                {name: "Duplicate", shortcut: "Mod+D", action: "duplicate"}
            ]
        },
        {
            name: "Graph",
            options: [
                {name: "Import...", shortcut: "Mod+Alt+O", action: "importNode"}
            ]
        }
    ];

    return (
        <div className="MenuBar">
            {
                layout.map(item => 
                    <MenuItem key={item.name} label={item.name}>
                        {
                            item.options.map((option, i) => 
                                option ? 
                                    (<MenuOption key={option.name} action={option.action} shortcut={option.shortcut} state={state} dispatch={dispatch}>
                                        {option.name}
                                    </MenuOption>)
                                : <div key={i} className="menu-sep" />
                            )
                        }
                    </MenuItem>
                )
            }
        </div>
    );
}


export default MenuBar;
