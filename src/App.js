import React, { Component } from 'react'
import './App.css'
import './print.css';
import MainPage from './mainPage'
import packageJson from '../package.json';
import ClearCache from 'react-clear-cache';
import { confirmAlert } from 'react-confirm-alert'; // Import
global.appVersion = packageJson.version;

class App extends Component {
  componentDidMount() {
    console.log(`You are running version - ${global.appVersion}. If something is broken, try loading a new version by clearing the cache with CTRL+F5 or Apple + R.`);
  }

  render() {
    return (
      <div className="App">
        <ClearCache>
        {({ isLatestVersion, emptyCacheStorage }) =>
          <div className="new-version-snippet">
            {!isLatestVersion && (
              <p>
                <a
                  href="https://tools.nanos.cc"
                  onClick={e => {
                    e.preventDefault();
                    emptyCacheStorage();
                  }}
                >
                  CLICK TO LOAD NEW VERSION
                </a>
              </p>
            )}
          </div>
        }
        </ClearCache>
        <MainPage />
      </div>
    )
  }
}

export default App;
