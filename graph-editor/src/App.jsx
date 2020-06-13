import React from 'react';
import './App.css';
import Graph from './Editors/Graph';
import Sidebar from './Editors/Sidebar';
import { Provider, useSelector } from 'react-redux';
import store from './store';
import MenuBar from './MenuBar';
import NewGraph from './Modals/NewGraph';
import Packages from './Modals/Packages';
import OpenProject from './Modals/OpenProject';
import NewProject from './Modals/NewProject';
import EditNode from './Modals/EditNode';
import { OpenGraphContext } from './logic/graphs';
import { ToastContainer, Slide } from 'react-toastify';
import "react-toastify/dist/ReactToastify.min.css";

function AppBody() {
  let project = useSelector(state => state.project);

  if (!project)
    return null;

  return (
    <div className="app-body">
      <ToastContainer position="top-center" autoClose={3000} transition={Slide} hideProgressBar />
      <OpenGraphContext.Provider value={project.graphs[project.openGraph].present}>
        <Sidebar />
        <Graph />
      </OpenGraphContext.Provider>
    </div>
  )
}

function Modals() {
  return (
    <>
      <NewGraph />
      <Packages />
      <OpenProject />
      <NewProject />
      <EditNode />
    </>
  )
}

function App () {

  return (
    <div className="App">
      <Provider store={store}>
        <MenuBar />
        <AppBody />
        <Modals />
      </Provider>
    </div>
  );
}

export default App;
