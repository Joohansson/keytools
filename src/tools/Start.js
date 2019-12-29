import React, { Component } from 'react'
import * as helpers from '../helpers'

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
        <h1>NANO KEYTOOLS</h1>
        <p>A set of high performance web tools for <a href="https://nano.org">Nano Currency</a></p>
        <br/>
        <h4>SECURE</h4>
        <ul>
          <li>Secret keys comes from <a href="https://tweetnacl.js.org/#/">TweetNaCl</a>, a high-security cryptographic library</li>
          <li>The site works offline or by <a href="#">downloading</a> and run the index.html from a secure local file system</li>
          <li>The are zero cookies and trackers and no secret keys are shared via URL</li>
        </ul>
        <h4>QUICKLY ACCESSIBLE</h4>
        <ul>
          <li>Each tool support URL params which can be bookmarked, shared or implemented in other tools<br/>
          <strong>NOTE:</strong> The URL won't be updated if running from a file system, though the parameters will still work. To generate URL params locally you can use <a href="https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb">this chrome extension webserver</a> and launch from <a href="http://localhost:8887/">localhost</a>.</li>
          <li>Access tools by hotkeys SHIFT+ALT+0-9 and CTRL+SHIFT+ALT+0-9</li>
        </ul>
        <h4>AUDITABLE</h4>
        <ul>
          <li>Open sourced on <a href="https://github.com/Joohansson/keytools">Github</a></li>
          <li>This site is directly hosted on <a href="#">Github Pages</a></li>
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
