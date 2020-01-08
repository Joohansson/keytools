import React, { Component } from 'react'
import './App.css'
import './print.css';
import MainPage from './mainPage'
// https://github.com/flexdinesh/cache-busting-example
//https://dev.to/flexdinesh/cache-busting-a-react-app-22lk
import CacheBuster from './CacheBuster'

class App extends Component {
  render() {
    return (
      <CacheBuster>
        {({ loading, isLatestVersion, refreshCacheAndReload }) => {
          if (loading) return null;
          if (!loading && !isLatestVersion) {
            refreshCacheAndReload();
          }

          return (
            <div className="App">
              <MainPage />
            </div>
          );
        }}
      </CacheBuster>
    );
  }
}

export default App;
