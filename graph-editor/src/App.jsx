import React from 'react';
import './App.css';
import Graph from './Graph';
import Sidebar from './Sidebar';
import { Provider } from 'react-redux';
import store from './store';
import MenuBar from './MenuBar';
import NewGraph from './Modals/NewGraph';
import Library from './Library';
import OpenGraph from './Modals/OpenGraph';
import Packages from './Modals/Packages';

function App () {
  return (
    <div className="App">
      <Provider store={store}>
        <MenuBar />
        <div className="app-body">
          <Sidebar />
          <Graph />
          <Library />
        </div>
        <NewGraph />
        <OpenGraph />
        <Packages />
      </Provider>
    </div>
  );
}

export default App;
