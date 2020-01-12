import React, { Component } from 'react'
import './App.css'
import './print.css';
import MainPage from './mainPage'
import packageJson from '../package.json';
global.appVersion = packageJson.version;

class App extends Component {
  componentDidMount() {
    console.log(`You are running version - ${global.appVersion}. If something is broken, try loading a new version by clearing the cache with CTRL+F5 or Apple + R.`);
  }

  render() {
    return (
      <div className="App">
        <MainPage />
      </div>
    )
  }
}

export default App;
