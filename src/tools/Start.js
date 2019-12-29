import React, { Component } from 'react'
import * as helpers from '../helpers'
import Logo from '../img/logo.png'

class Start extends Component {
  componentDidMount = () => {
    this.setParams()
  }

  // Defines the url params
  setParams(type) {
    helpers.setURLParams('')
  }

  render() {
    return (
      <div>
        <img src={Logo} width="300" alt="logo"/>
        <p>NANO KeyTools is a set of high performance web tools for <a href="https://nano.org">Nano Currency</a></p>
        <br/>
        <h4>SECURE</h4>
        <ul>
          <li>Secret keys comes from <a href="https://tweetnacl.js.org/#/">TweetNaCl</a>, a high-security cryptographic library</li>
          <li>The site works offline or by <a href="https://github.com/Joohansson/keytools/raw/master/keytools.zip">downloading</a> and run the index.html from a secure local file system</li>
          <li>The are zero cookies and trackers and no secret keys are shared via URL</li>
        </ul>
        <h4>QUICKLY ACCESSIBLE</h4>
        <ul>
          <li>Each tool support URL params which can be bookmarked, shared or implemented in other tools.<br/>
          <strong>NOTE:</strong> The URL won't be updated if running from a file system, though the parameters will still work. A valid workaround is to use this <a href="https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb">chrome webserver extension</a> and launch from <a href="http://localhost:8887/">localhost</a>.</li>
          <li>Access tools with hotkeys SHIFT+ALT+0-9 and CTRL+SHIFT+ALT+0-9</li>
        </ul>
        <h4>AUDITABLE</h4>
        <ul>
          <li>Open sourced on <a href="https://github.com/Joohansson/keytools">Github</a></li>
          <li>This site is directly hosted on <a href="https://github.com/Joohansson/keytools/tree/gh-pages">Github Pages</a></li>
        </ul>
        <h4>FREE</h4>
        <ul>
          <li>Contributions to this project can be done via Github PRs or by a Nano Donation below</li>
        </ul>
      </div>
    )
  }
}
export default Start
