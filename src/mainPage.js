import React, { Component } from 'react'
import {ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Dropdown, DropdownButton, InputGroup, FormControl} from 'react-bootstrap'
import { css } from 'glamor';
import * as helpers from './helpers'
import { ConvertTool, SeedTool, FindAddressTool, KeyGeneratorTool, AddressExtractorTool, PaperWalletTool, PaymentTool,
  SigningTool, WorkGeneratorTool, QRTool} from './tools'
const tools = [ConvertTool, SeedTool, FindAddressTool, KeyGeneratorTool, AddressExtractorTool, PaperWalletTool, PaymentTool,
  SigningTool, WorkGeneratorTool, QRTool]

class MainPage extends Component {
  constructor(props) {
    super(props)
    this.tools = ['1: Nano Units Converter', '2: Seed & Account Toolbox', '3: Find Address in Seed', '4: Keypair Generator',
    '5: Address Extractor', '6: Paper Wallet Generator', '7: Payment Card', '8: Off-chain Signing', '9: PoW Generator',
    '10: QR Generator / Reader']
    this.state = {
      activeTool: this.tools[0],
      activeToolId: 0,
    }

    // Bindings
    this.selectTool = this.selectTool.bind(this)
  }

  // Toast functions
  notifyCopy() {
    toast("Value Copied", helpers.getToast(helpers.toastType.SUCCESS_AUTO))
  }

  notifyCopyFail() {
    toast("Copy failed!", helpers.getToast(helpers.toastType.ERROR_AUTO))
  }

  notifyInvalidFormat() {
    toast("Invalid input format!", helpers.getToast(helpers.toastType.ERROR_AUTO_LONG))
  }

  // Change tool to view on main page
  selectTool(eventKey, event) {
    this.setState({
      activeTool: this.tools[eventKey],
      activeToolId: eventKey,
    })
  }

  render() {
    const ActiveView = tools[this.state.activeToolId]
    return (
      <div>
        <header className="header noprint">
          <ToastContainer
            enableMultiContainer
            containerId={'success-auto'}
            position="top-right"
            autoClose={2500}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnVisibilityChange={false}
            draggable={false}
            pauseOnHover
            className='toast-container'
            toastClassName="dark-toast"
            progressClassName={css({
              height: "2px"
            })}
          />

          <ToastContainer
            enableMultiContainer
            containerId={'success'}
            position="top-right"
            autoClose={false}
            hideProgressBar={true}
            newestOnTop={true}
            closeOnClick={false}
            rtl={false}
            pauseOnVisibilityChange={false}
            draggable={false}
            pauseOnHover
            className='toast-container'
            toastClassName="dark-toast"
          />

          <ToastContainer
            enableMultiContainer
            containerId={'error'}
            position="top-left"
            autoClose={false}
            hideProgressBar={true}
            newestOnTop={true}
            closeOnClick={false}
            rtl={false}
            pauseOnVisibilityChange={false}
            draggable={true}
            pauseOnHover
            className='toast-container'
            toastClassName="dark-toast"
          />

          <ToastContainer
            enableMultiContainer
            containerId={'error-auto'}
            position="top-left"
            autoClose={2500}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnVisibilityChange={false}
            draggable={false}
            pauseOnHover
            className='toast-container'
            toastClassName="dark-toast"
            progressClassName={css({
              height: "2px"
            })}
          />

          <ToastContainer
            enableMultiContainer
            containerId={'error-auto-long'}
            position="top-left"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnVisibilityChange={false}
            draggable={false}
            pauseOnHover
            className='toast-container'
            toastClassName="dark-toast"
            progressClassName={css({
              height: "2px"
            })}
          />

            <DropdownButton
              className="tool-dropdown"
              title={this.state.activeTool}
              key={this.state.activeToolId}
              id={`dropdown-basic-${this.state.activeToolId}`}>
              {this.tools.map(function(tool, index){
                return <Dropdown.Item eventKey={index} key={index} onSelect={this.selectTool}>{tool}</Dropdown.Item>;
              }.bind(this))}
            </DropdownButton>
        </header>
        <div className="line noprint"></div>
        <div className="content-wrapper">
          <div className="content">
            <ActiveView/>
          </div>
        </div>

        <footer className="footer noprint">
          <div className="line"></div>
          <InputGroup>
            <FormControl as="textarea" rows="3" placeholder="Memo for copy/paste across tools"/>
          </InputGroup>
          <span className="link-span" onClick={this.showOwnerModal}>About Owner</span> | <a href="https://github.com/Joohansson/nanocards">Github</a> | <a href="https://nano.org">Nano Home</a> | <a href="https://nanolinks.info">Nano Guide</a> | <span className="link-span" onClick={this.showDonateModal}>Donate me a Cookie</span>
        </footer>
      </div>
    )
  }
}
export default MainPage
