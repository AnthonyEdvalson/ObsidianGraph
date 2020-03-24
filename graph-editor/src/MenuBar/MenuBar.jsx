import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './MenuBar.css';
import Actions from './Actions';


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
    return (
        <div className="MenuOption" onClick={() => Actions[props.action](props.state, props.dispatch)}>
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
                {name: "New Graph...", shortcut: "Ctrl+N", action: "new"},
                {name: "Open Graph...", shortcut: "Ctrl+O", action: "open"},
                {name: "Save...", shortcut: "Ctrl+S", action: "save"},
                {name: "Save As...", shortcut: "Ctrl+Shift+S", action: "save as"}
            ],
        },
        {
            name: "Edit",
            options: [
                {name: "Undo", shortcut: "Ctrl+Z", action: "undo"},
                {name: "Redo", shortcut: "Ctrl+Y", action: "redo"},
                null
            ]
        },
        {
            name: "Graph",
            options: [
                {name: "Import...", shortcut: "Ctrl+Alt+O", action: "importNode"}
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
