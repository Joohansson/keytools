import React from 'react'
import './App.css'
import './print.css';
import MainPage from './mainPage'
import { useClearCache } from "react-clear-cache";

const App: React.FC<{}> = () => {
  // Internet Explorer 6-11
  const isIE = /*@cc_on!@*/false || !!document.documentMode;
  // Edge 20+
  const isEdge = !isIE && !!window.StyleMedia;
  // If a new version is detected, reload page automatically. The below snippet is just there to be able to use auto=false
  var auto = false
  if (!isIE && !isEdge) {
    auto = true
  }
  const { isLatestVersion, emptyCacheStorage } = useClearCache({'auto':auto});

  return (
    <div className="App">
      <div className="new-version-snippet">
        {(!isLatestVersion && !isIE && !isEdge) && (
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
      <MainPage />
    </div>
  );
};

export default App;
