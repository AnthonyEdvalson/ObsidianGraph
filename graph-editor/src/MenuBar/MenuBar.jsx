import React, { useEffect } from 'react';
import './MenuBar.css';
import Mousetrap from 'mousetrap';


function MenuBar({ layout }) {
    /*const layout = [
        { 
            name: "File", 
            options: [
                {name: "New Graph...", shortcut: "Mod+N", action: "new"},
                {name: "Open Graph...", shortcut: "Mod+O", action: "open"},
                {name: "Save...", shortcut: "Mod+S", action: "save"},
                null,
                //{name: "Save As...", shortcut: "Ctrl+Shift+S", action: "saveAs"},
                {name: "Export...", shortcut: "Mod+E", action: "exportProject"},
                {name: "Open GLIB Folder", action: "showGLIB"},
                {name: "Import Project...", shortcut: "Mod+Shift+O", action: "importProjects"},
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
                //{name: "Import...", shortcut: "Mod+Alt+O", action: "importNode"}
            ]
        }
    ];*/

    return (
        <div className="MenuBar">
            {
                Object.entries(layout).map(([name, options]) => <MenuItem key={name} label={name} options={options} />)
            }
        </div>
    );
}


function MenuItem(props) {
    return (
        <div className="MenuItem">
            <span className="menu-item-label">{props.label}</span>
            <div className="menu-dropdown">
                {
                    props.options.map((option, i) => {
                        if (option === null)
                            return <div key={i} className="menu-sep" />
                        
                        return <MenuOption key={option.name} option={option} />
                    })
                }
            </div>
        </div>
    )
} 


function MenuOption(props) {
    let { name, action, shortcut } = props.option;

    let handleAction = (e) => {
        e.preventDefault();
        action();
    }
    
    useEffect(() => {
        if (shortcut) {
            let keyCode = shortcut.toLowerCase();

            Mousetrap.bind(keyCode, handleAction);
            return () => Mousetrap.unbind(keyCode);
        }
    });

    return (
        <div className="MenuOption" onClick={handleAction}>
            <span>{name}</span>
            <small>{shortcut}</small>
        </div>
    )
}


export default MenuBar;
