import React from 'react';
import packageJson from '../package.json';
global.appVersion = packageJson.version;

// version from response - first param, local version second param
const semverGreaterThan = (versionA, versionB) => {
  const versionsA = versionA.split(/\./g);

  const versionsB = versionB.split(/\./g);
  while (versionsA.length || versionsB.length) {
    const a = Number(versionsA.shift());

    const b = Number(versionsB.shift());
    // eslint-disable-next-line no-continue
    if (a === b) continue;
    // eslint-disable-next-line no-restricted-globals
    return a > b || isNaN(b);
  }
  return false;
};

class CacheBuster extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      isLatestVersion: false,
      refreshCacheAndReload: () => {
        console.log('Clearing cache and hard reloading...')
        if (caches) {
          // Service worker cache should be cleared with caches.delete()
          caches.keys().then(function(names) {
            for (let name of names) caches.delete(name);
          });
        }

        // delete browser cache and hard reload
        window.location.reload(true);
      }
    };
  }

  componentDidMount() {
    fetch('/meta.json')
      .then((response) => response.json())
      .then((meta) => {
        const latestVersion = meta.version;
        const currentVersion = global.appVersion;

        const shouldForceRefresh = semverGreaterThan(latestVersion, currentVersion);
        if (shouldForceRefresh) {
          console.log(`Found a new version - ${latestVersion}. Forcing refresh`);
          this.setState({ loading: false, isLatestVersion: false });
        } else {
          console.log(`You are running version - ${latestVersion}. If something is broken, try loading a new version by clearing the cache with CTRL+F5 or Apple + R.`);
          this.setState({ loading: false, isLatestVersion: true });
        }
      });
  }
  render() {
    const { loading, isLatestVersion, refreshCacheAndReload } = this.state;
    return this.props.children({ loading, isLatestVersion, refreshCacheAndReload });
  }
}

export default CacheBuster;
