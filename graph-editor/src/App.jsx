import React from 'react';
import './App.css';
import Graphs from './Panels/Graphs';
import Sidebar from './Panels/Sidebar';
import { Provider, useSelector } from 'react-redux';
import store from './store';
import MenuBar from './MenuBar';
import { ToastContainer, Slide } from 'react-toastify';
import "react-toastify/dist/ReactToastify.min.css";
import { useState } from 'react';
import { useCallback } from 'react';
import { GraphIdContext, ProjectIdContext } from './logic/scope';
import { graft } from './util';

function Editor() {
  let [menuBarLayout, setMenuBarLayout] = useState({ Obsidian: menu });
  let focusProject = useSelector(state => state.focus.projectId);
  let focusGraph = useSelector(state => state.focus.graphId);
  
  const setMenu = useCallback((name, options) => {
    setMenuBarLayout(prevState => graft(prevState, name, options));
  }, [setMenuBarLayout]);
  return (
    <>
      <MenuBar layout={menuBarLayout}/>
      <div className="app-body">
        <ToastContainer position="top-center" autoClose={3000} transition={Slide} hideProgressBar />
        <ProjectIdContext.Provider value={focusProject}>
          <GraphIdContext.Provider value={focusGraph}>
            <Sidebar setMenu={setMenu} />
            <Graphs setMenu={setMenu} />
          </GraphIdContext.Provider>
        </ProjectIdContext.Provider>
      </div>
    </>
  );
}

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <Editor />
      </Provider>
    </div>
  );
}


const menu = [
  {name: "Dev Tools", shortcut: "F12", action: "devtools"},
  {name: "Refresh", shortcut: "F5", action: "refresh"},
  {name: "Exit", action: "exit"}
];

export default App;
