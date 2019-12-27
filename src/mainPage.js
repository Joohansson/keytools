import React, { Component } from 'react'
import {ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Dropdown, DropdownButton, InputGroup, FormControl} from 'react-bootstrap'
import { css } from 'glamor';
import * as helpers from './helpers'
import $ from 'jquery'
import donation from './img/donation.png';
import { ConvertTool, SeedTool, FindAddressTool, KeyGeneratorTool, AddressExtractorTool, PaperWalletTool, PaymentTool,
  SigningTool, WorkGeneratorTool, VanityTool, QRTool, MessengerTool} from './tools'
const tools = [ConvertTool, SeedTool, PaperWalletTool, PaymentTool, KeyGeneratorTool, AddressExtractorTool, FindAddressTool,
  SigningTool, WorkGeneratorTool, VanityTool, QRTool, MessengerTool]

class MainPage extends Component {
  constructor(props) {
    super(props)
    this.tools = ['1: Unit Converter', '2: Key Converter', '3: Paper Wallet Generator ', '4: Payment Card', '5: Mass Wallet Generator',
    '6: Mass Keypair Extractor', '7: Find Address in Seed', '8: Off-chain Signing', '9: PoW Generator',
    '10: Vanity Address Generator', '11: QR Generator / Reader', '12: Offline Audio Messenger']
    this.state = {
      activeTool: this.tools[0],
      activeToolId: 0,
      donationPath: donation,
    }

    // Bindings
    this.selectTool = this.selectTool.bind(this)
    this.showDonateModal = this.showDonateModal.bind(this)
  }

  componentDidMount = () => {
    // Read URL params
    var tool = helpers.getUrlParams().tool

    if (typeof tool !== 'undefined') {
      var toolId = 0
      switch (tool) {
        // PaymentTool
        case 'pay':
        toolId = 3
        var address = helpers.getUrlParams().address
        var amount = helpers.getUrlParams().amount
        if (typeof address !== 'undefined') {
          this.setState({
            address: address
          })
        }
        if (typeof amount !== 'undefined') {
          this.setState({
            amount: amount
          })
        }
        break

        default:
        toolId = 0
        break
      }
      this.setState({
        activeTool: this.tools[toolId],
        activeToolId: toolId,
      })
    }

    // Define global modal component
    $.fn.psendmodal = function() {
      var modal_structure = '<div class="modal_overlay"></div>'+
                  '<div class="modal_psend">'+
                    '<div class="modal_title">'+
                      '<span>&nbsp;</span>'+
                      '<a href="#" class="modal_close">&times;</a>'+
                    '</div>'+
                    '<div class="modal_content"></div>'+
                  '</div>';

      $('body').append(modal_structure);
      show_modal();

      function show_modal() {
        $('.modal_overlay').stop(true, true).fadeIn();
        $('.modal_psend').stop(true, true).fadeIn();
      }

      window.remove_modal = function() {
        $('.modal_overlay').stop(true, true).fadeOut(500, function() { $(this).remove(); });
        $('.modal_psend').stop(true, true).fadeOut(500, function() { $(this).remove(); });
        return false;
      }

      $(".modal_close").click(function(e) {
        e.preventDefault();
        window.remove_modal();
      });

      $(".modal_overlay").click(function(e) {
        e.preventDefault();
        window.remove_modal();
      });

      $(document).keyup(function(e) {
        if (e.keyCode === 27) { // Esc
          window.remove_modal();
        }
      });
    };
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

  /* Show donate modal */
  showDonateModal() {
    $(document).psendmodal();
    var account = 'nano_1gur37mt5cawjg5844bmpg8upo4hbgnbbuwcerdobqoeny4ewoqshowfakfo';

    var content =  '<div class="public_link_modal">'+
              '<strong>Scan the QR, <a href="nano:nano_1gur37mt5cawjg5844bmpg8upo4hbgnbbuwcerdobqoeny4ewoqshowfakfo">open in wallet</a><br/> or click the donation address to copy</strong><br/>'+
              '<img class="donation-qr" id="donation" src="#" alt="QR Image"/>'+
              '<div class="form-group">'+
                '<textarea id="shareArea" class="input-large public_link_copy form-control" rows="2" readonly>' + account + '</textarea>'+
              '</div>'+
              '<div class="copied">Succesfully copied to clipboard</div>'+
              '<div class="copied_not">Content could not be copied to clipboard</div>'+
            '</div>';
    var title 	= 'DONATE DEVELOPER';
    $('.modal_title span').html(title);
    $('.modal_content').html(content);
    document.getElementById("donation").src = this.state.donationPath;

    /* Auto select text */
    var textBox = document.getElementById("shareArea");
    textBox.onfocus = function() {
      textBox.select();

      if (document.execCommand("copy")) {
        /* Inform user about copy */
        document.getElementsByClassName("copied")[0].style.display = "block";
      }
      else {
        document.getElementsByClassName("copied_not")[0].style.display = "block";
      }

      // Work around Chrome's little problem
      textBox.onmouseup = function() {
          // Prevent further mouseup intervention
          textBox.onmouseup = null;
          return false;
      };
    };
    return false;
  }

  /* Show donate modal */
  showOwnerModal() {
    $(document).psendmodal();
    var content =  '<div class="public_link_modal">'+
              '<strong>Who made this service?</strong><br/>'+
              'A community manager for the Nano Foundation, moderator of <a href="https://www.reddit.com/r/nanocurrency">/r/nanocurrency</a> / <a href="https://chat.nano.org/">nano discord</a> and creator of some other services like <a href="https://nanolinks.info">Nano Links</a> and <a href="https://nanoticker.info">NanoTicker</a>.<br/>'+
              '<br/>If you find any bugs or have feedback, please don\'t hesitate to contact me at Reddit or Discord! You find me under alias Joohansson or Json or you can join my <a href="https://discord.gg/RVCuFvc">Personal Discord Support Server</a>.';
    var title 	= 'ABOUT OWNER';
    $('.modal_title span').html(title);
    $('.modal_content').html(content);

    return false;
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
          <div className="header-wrapper">
            <DropdownButton
              className="tool-dropdown"
              title={this.state.activeTool}
              key={this.state.activeToolId}
              id={`dropdown-basic-${this.state.activeToolId}`}>
              {this.tools.map(function(tool, index){
                return <Dropdown.Item eventKey={index} key={index} onSelect={this.selectTool}>{tool}</Dropdown.Item>;
              }.bind(this))}
            </DropdownButton>
          </div>
        </header>
        <div className="line noprint"></div>
        <div className="content-wrapper">
          <div className="content">
            <ActiveView {...this}/>
          </div>
        </div>

        <footer className="footer noprint">
          <div className="line"></div>
          <InputGroup>
            <FormControl as="textarea" rows="3" placeholder="Memo for copy/paste across tools"/>
          </InputGroup>
          <span className="link-span" onClick={this.showOwnerModal}>About Owner</span> | <a href="https://github.com/Joohansson/keytools">Github</a> | <a href="https://nano.org">Nano Home</a> | <a href="https://nanolinks.info">Nano Guide</a> | <span className="link-span" onClick={this.showDonateModal}>Donate</span>
        </footer>
      </div>
    )
  }
}
export default MainPage
