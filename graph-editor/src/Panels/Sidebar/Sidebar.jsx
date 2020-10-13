import React from 'react';
import './Sidebar.css';
import Project from '../Project';
import Info from './Info';
import Library from './Library';
import { useState } from 'react';

function Sidebar({ setMenu }) {
    let [currentView, setView] = useState("Info");
    
    let views = {
        "Info": {
            content: (
                <>
                    <div className="select-info">
                        <Info setMenu={setMenu} />
                    </div>
                    <Project setMenu={setMenu} />
                </>
            )
        },
        "Library": {
            content: (
                <Library setMenu={setMenu} />
            )
        }
    }

    return (
        <div className="Sidebar">
            <div className="sidebar-view-selector">
                {
                    Object.entries(views).map(([name, v]) => (
                        <div key={name} className={name === currentView ? "active" : ""} onClick={() => setView(name)}>
                            {name}
                        </div>
                    ))
                }
            </div>
            { 
                Object.entries(views).map(([k, v]) => (
                    <div key={k} className={"sidebar-view" + (k === currentView ? " active" : "")}>
                        {v.content}
                    </div>
                ))
            }
        </div>
    );
}

export default Sidebar;