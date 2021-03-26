import React from 'react'
import './App.css'
import './print.css';
import MainPage from './mainPage'
import ClearCache from 'react-clear-cache';

const App: React.FC<{}> = () => {
  return (
    <div className="App">
      <div className="new-version-snippet">
        <ClearCache>
        {({ isLatestVersion, emptyCacheStorage }) => (
          <div>
            {!isLatestVersion && (
              <p>
                <a
                  href="https://tools.nanos.cc"
                  onClick={e => {
                    e.preventDefault();
                    emptyCacheStorage();
                  }}
                >
                  CLICK TO LOAD LATEST VERSION
                </a>
              </p>
            )}
          </div>
        )}
      </ClearCache>
      </div>
      <MainPage />
    </div>
  );
};

export default App;
