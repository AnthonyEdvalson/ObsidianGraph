import React, { useEffect, useState, useCallback } from 'react';
import SocketIO from 'socket.io-client';

import './App.css';
import Graphs from './Panels/Graphs';
import Sidebar from './Panels/Sidebar';
import { Provider, useSelector, useDispatch } from 'react-redux';
import store from './store';
import MenuBar from './MenuBar';
import { ToastContainer, Slide } from 'react-toastify';
import "react-toastify/dist/ReactToastify.min.css";
import { GraphIdContext, ProjectIdContext } from './logic/scope';
import { graft } from './util';
import Errors from './Panels/Errors';
import { uuid4 } from './reducers/node';

function Editor() {
  let dispatch = useDispatch();

  useEffect(() => {
    let socket = SocketIO("http://localhost:5000/editor");

    socket.on("report", (data) => {
      data = { ...data, errorId: uuid4() }
      dispatch({ type: "NEW_ERROR", data });
      dispatch({ type: "SET_FOCUS", focus: { errorId: data.errorId }});
    });

    return socket.disconnect;
  }, [dispatch]);

  let [menuBarLayout, setMenuBarLayout] = useState({ Obsidian: [
    { name: "Dev Tools", shortcut: "F12", action: "devtools" },
    { name: "Refresh", shortcut: "F5", action: "refresh" },
    { name: "Exit", action: "exit" }
  ]});

  let focusProject = useSelector(state => state.focus.projectId);
  let focusGraph = useSelector(state => state.focus.graphId);
  //let focusError = useSelector(state => state.focus.errorId);

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
            {/*<ErrorIdContext.Provider value={focusError}>*/}
              <Sidebar setMenu={setMenu} />
              <Graphs setMenu={setMenu} />
              <Errors setMenu={setMenu} />
            {/*</ErrorIdContext.Provider>*/}
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

export default App;
