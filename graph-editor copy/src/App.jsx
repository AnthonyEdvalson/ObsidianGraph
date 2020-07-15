import React from 'react';
import './App.css';
import Graph from './Editors/Graph';
import Sidebar from './Editors/Sidebar';
import { Provider, useSelector } from 'react-redux';
import store from './store';
import MenuBar from './MenuBar';
import NewGraph from './Modals/NewGraph';
import OpenGraph from './Modals/OpenGraph';
import Packages from './Modals/Packages';
import OpenProject from './Modals/OpenProject';
import NewProject from './Modals/NewProject';

function AppBody() {
  let project = useSelector(state => state.project);

  if (!project)
    return null;

  return (
    <div className="app-body">
      <Sidebar />
      <Graph />
    </div>
  )
}

function Modals() {
  return (
    <>
      <NewGraph />
      <OpenGraph />
      <Packages />
      <OpenProject />
      <NewProject />
    </>
  )
}

function App () {
  //let projPath = useSelector(state => state.graph.present.path);

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
