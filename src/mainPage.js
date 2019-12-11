import React, { Component } from 'react'
import {ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Dropdown, DropdownButton} from 'react-bootstrap'
import { ConvertTool, SeedTool } from './tools'
import { css } from 'glamor';

class MainPage extends Component {
  constructor(props) {
    super(props)
    this.tools = ['Nano Units Converter', 'Seed & Account Toolbox']
    this.state = {
      activeTool: this.tools[0],
      activeToolId: 0,
    }

    // Bindings
    this.selectTool = this.selectTool.bind(this)
  }

  // Toast functions
  notifyCopy() {
    toast("Value Copied", {
      containerId: 'copy',
      className: css({
        background: 'rgba(74,144,226,1.0)',

      }),
      bodyClassName: css({
        fontSize: 'calc(10px + 1vmin)',
        color: '#EEE',
      }),
      progressClassName: css({
        background: '#EEE'
      })
    });
  }

  notifyCopyFail() {
    toast("Copy failed!", {
      containerId: 'copyfail',
      className: css({
        background: 'rgba(214,95,100,1.0)',

      }),
      bodyClassName: css({
        fontSize: 'calc(10px + 1vmin)',
        color: '#EEE',
      }),
      progressClassName: css({
        background: '#EEE'
      })
    });
  }

  notifyInvalidFormat() {
    toast("Invalid input format!", {
      containerId: 'input',
      className: css({
        background: 'rgba(214,95,100,1.0)',

      }),
      bodyClassName: css({
        fontSize: 'calc(10px + 1vmin)',
        color: '#EEE',
      }),
      progressClassName: css({
        background: '#EEE'
      })
    });
  }

  // Change tool to view on main page
  selectTool(eventKey, event) {
    this.setState({
      activeTool: this.tools[eventKey],
      activeToolId: eventKey,
    })
  }

  render() {
    const tools = [ConvertTool, SeedTool]
    const ActiveView = tools[this.state.activeToolId]
    return (
      <div>
        <header className="App-header">
          <ToastContainer
            enableMultiContainer
            containerId={'copy'}
            position="top-right"
            autoClose={2500}
            hideProgressBar={false}
            newestOnTop={false}
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
            containerId={'copyfail'}
            position="top-right"
            autoClose={2500}
            hideProgressBar={false}
            newestOnTop={false}
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
            containerId={'input'}
            position="top-left"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
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

          <div className="active-view">
            <DropdownButton
              className="tool-dropdown"
              title={this.state.activeTool}
              key={this.state.activeToolId}
              id={`dropdown-basic-${this.state.activeToolId}`}>
              {this.tools.map(function(tool, index){
                return <Dropdown.Item eventKey={index} key={index} onSelect={this.selectTool}>{tool}</Dropdown.Item>;
              }.bind(this))}
            </DropdownButton>
            <ActiveView/>
          </div>
        </header>
      </div>
    )
  }
}
export default MainPage
