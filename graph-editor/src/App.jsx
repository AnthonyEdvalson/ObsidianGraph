import React, { useState, useCallback } from 'react';

import './App.css';
import Graphs from './Panels/Graphs';
import Sidebar from './Panels/Sidebar';
import { Provider, useSelector } from 'react-redux';
import store from './store';
import MenuBar from './MenuBar';
import { ToastContainer, Slide } from 'react-toastify';
import "react-toastify/dist/ReactToastify.min.css";
import { GraphIdContext, ProjectIdContext } from './logic/scope';
import { util } from 'obsidian';
import engine from './logic/engine';
import Panel from './Panels/Panel';
import TimeTravel from './Panels/TimeTravel';

function Editor() {
  let [menuBarLayout, setMenuBarLayout] = useState({ Obsidian: [
    { name: "Dev Tools", shortcut: "F12", action: "devtools" },
    { name: "Refresh", shortcut: "F5", action: "refresh" },
    { name: "Exit", action: "exit" }
  ]});

  let focusProject = useSelector(state => state.focus.projectId);
  let focusGraph = useSelector(state => state.focus.graphId);

  const setMenu = useCallback((name, options) => {
    setMenuBarLayout(prevState => util.graft(prevState, name, options));
  }, [setMenuBarLayout]);

  return (
    <>
      <MenuBar layout={menuBarLayout}/>
      <div className="app-body">
        <ToastContainer position="top-center" autoClose={4000} transition={Slide} hideProgressBar />
        <ProjectIdContext.Provider value={focusProject}>
          <GraphIdContext.Provider value={focusGraph}>
            <Panel horizontal>
              <Sidebar setMenu={setMenu} />
              <Panel vertical>
                <Graphs setMenu={setMenu} />
                <TimeTravel setMenu={setMenu} />
              </Panel>
            </Panel>
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
        <engine.Engine href="http://localhost:5000/editor">
          <Editor />
        </engine.Engine>
      </Provider>
    </div>
  );
}

export default App;
