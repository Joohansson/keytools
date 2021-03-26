import React, { Component } from 'react'
import * as helpers from '../helpers'
const toolParam = 'terms'

class Terms extends Component {
  componentDidMount = () => {
    this.setParams()
  }

  // Defines the url params
  setParams(type) {
    helpers.setURLParams('?tool='+toolParam)
  }

  render() {
    return (
      <div>
        <h4>TERMS</h4>
        <ul>
          <li>By using KeyTools, you are agreeing to be bound by these Website Terms and Conditions of Use and agree that you are responsible for the agreement with any applicable local laws.</li>
          <li>KeyTools may revise these Terms of Use for its Website at any time without prior notice. By using this Website, you are agreeing to be bound by the current version of these Terms and Conditions of Use.</li>
        </ul>
        <h4>LINKS</h4>
        <ul>
          <li>KeyTools are not responsible for any external contents that are linked from this site.</li>
          <li>Your access to and use of any external site is entirely at your own risk. The presence of links should not be understood to be approval, endorsement or guarantee to function as advertised.</li>
        </ul>
        <h4>LIMITATIONS & REVISIONS</h4>
        <ul>
          <li>KeyTools and its tools is a work in progress and may include technical errors. It will not be hold accountable for any damages that will arise with the use or inability to use the tools.</li>
          <li>It's the users responsibility to understand and correctly handle accounts and corresponding funds.</li>
          <li>KeyTools may change the tools contained on its Website at any time without notice. KeyTools does not make any commitment to update the content of the Website or source code repository.</li>
        </ul>
        <h4>IP BLOCK</h4>
        <ul>
          <li>KeyTools have the right to slow down or block access to RPC node server if any malicious or unreasonable high amount of requests are done.</li>
          <li>The IP number of the client is temporary stored for this purpose as a pure access log and nothing else.</li>
        </ul>
      </div>
    )
  }
}
export default Terms
