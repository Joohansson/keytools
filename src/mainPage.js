import React, { Component } from 'react'
import {ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Dropdown, DropdownButton, InputGroup, FormControl} from 'react-bootstrap'
import { css } from 'glamor';
import * as helpers from './helpers'
import $ from 'jquery'
import donation from './img/donation.png';
import Hotkeys from 'react-hot-keys'
import { Start, ConvertTool, SeedTool, FindAddressTool, KeyGeneratorTool, AddressExtractorTool, PaperWalletTool, PaymentTool,
  SigningTool, WorkGeneratorTool, VanityTool, QRTool, MessengerTool} from './tools'
const tools = ['HOME', 'CONVERT', 'SEED', 'PAPER', 'PAY', 'KEYGEN', 'EXTRACT', 'FINDADDR', 'SIGN', 'POW', 'VANITY', 'QR', "MSG"]

class MainPage extends Component {
  constructor(props) {
    super(props)
    this.tools = ['0: HOME', '1: Unit Converter', '2: Key Converter', '3: Paper Wallet Generator ', '4: Payment Card', '5: Mass Wallet Generator',
    '6: Mass Keypair Extractor', '7: Find Address in Seed', '8: Off-chain Signing', '9: PoW Generator',
    '10: Vanity Address Generator', '11: QR Generator / Reader', '12: Offline Audio Messenger']
    this.state = {
      activeTool: this.tools[0],
      activeToolId: 0,
      donationPath: donation,
      collapseText: 'Show Memo',
    }

    // Bindings
    this.selectTool = this.selectTool.bind(this)
    this.showDonateModal = this.showDonateModal.bind(this)
    this.collapse = this.collapse.bind(this)
  }

  componentDidMount = () => {
    // Set footer height
    var contentWrapper = this.refs.contentWrapper
    contentWrapper.style.bottom = "40px"

    // Read URL params
    var tool = helpers.getUrlParams().tool
    var toolId = 0

    if (typeof tool !== 'undefined') {
      switch (tool) {
        // ConvertTool
        case 'convert':
        toolId = 1
        let raw = helpers.getUrlParams().raw
        let nano = helpers.getUrlParams().nano
        let mnano = helpers.getUrlParams().mnano
        if (typeof raw !== 'undefined') {
          this.setState({
            raw: raw
          })
        }
        if (typeof nano !== 'undefined') {
          this.setState({
            nano: nano
          })
        }
        if (typeof mnano !== 'undefined') {
          this.setState({
            mnano: mnano
          })
        }
        break

        // SeedTool
        case 'seed':
        toolId = 2
        break

        // PaperWalletTool
        case 'paper':
        toolId = 3
        break

        // PaymentTool
        case 'pay':
        toolId = 4
        let address = helpers.getUrlParams().address
        let amount = helpers.getUrlParams().amount
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

        // KeyGeneratorTool
        case 'keygen':
        toolId = 5
        let count = helpers.getUrlParams().count
        let priv = helpers.getUrlParams().priv
        let pub = helpers.getUrlParams().pub
        let addr = helpers.getUrlParams().addr
        if (typeof count !== 'undefined') {
          this.setState({
            count: count
          })
        }
        if (typeof priv !== 'undefined') {
          this.setState({
            priv: priv
          })
        }
        if (typeof pub !== 'undefined') {
          this.setState({
            pub: pub
          })
        }
        if (typeof addr !== 'undefined') {
          this.setState({
            addr: addr
          })
        }
        break

        // AddressExtractorTool
        case 'extract':
        toolId = 6
        break

        // FindAddressTool
        case 'findaddr':
        toolId = 7
        break

        // SigningTool
        case 'sign':
        toolId = 8
        let s_type = helpers.getUrlParams().type
        let s_address = helpers.getUrlParams().address
        let s_link = helpers.getUrlParams().link
        let s_previous = helpers.getUrlParams().previous
        let s_rep = helpers.getUrlParams().rep
        let s_balance = helpers.getUrlParams().balance
        let s_amount = helpers.getUrlParams().amount
        let s_hash = helpers.getUrlParams().hash

        if (typeof s_type !== 'undefined') {
          this.setState({
            type: s_type
          })
        }
        if (typeof s_address !== 'undefined') {
          this.setState({
            address: s_address
          })
        }
        if (typeof s_link !== 'undefined') {
          this.setState({
            link: s_link
          })
        }
        if (typeof s_previous !== 'undefined') {
          this.setState({
            previous: s_previous
          })
        }
        if (typeof s_rep !== 'undefined') {
          this.setState({
            rep: s_rep
          })
        }
        if (typeof s_balance !== 'undefined') {
          this.setState({
            balance: s_balance
          })
        }
        if (typeof s_amount !== 'undefined') {
          this.setState({
            amount: s_amount
          })
        }
        if (typeof s_hash !== 'undefined') {
          this.setState({
            hash: s_hash
          })
        }
        break

        // WorkGeneratorTool
        case 'pow':
        toolId = 9
        let p_hash = helpers.getUrlParams().hash
        let p_load = helpers.getUrlParams().load
        if (typeof p_hash !== 'undefined') {
          this.setState({
            hash: p_hash
          })
        }
        if (typeof p_load !== 'undefined') {
          this.setState({
            load: p_load
          })
        }
        break

        // VanityTool
        case 'vanity':
        toolId = 10
        let v_init = helpers.getUrlParams().init
        let v_prefix = helpers.getUrlParams().prefix
        let v_suffix = helpers.getUrlParams().suffix
        let v_count = helpers.getUrlParams().count
        let v_load = helpers.getUrlParams().load
        if (typeof v_init !== 'undefined') {
          this.setState({
            init: v_init
          })
        }
        if (typeof v_prefix !== 'undefined') {
          this.setState({
            prefix: v_prefix
          })
        }
        if (typeof v_suffix !== 'undefined') {
          this.setState({
            suffix: v_suffix
          })
        }
        if (typeof v_count !== 'undefined') {
          this.setState({
            count: v_count
          })
        }
        if (typeof v_load !== 'undefined') {
          this.setState({
            load: v_load
          })
        }
        break

        // QRTool
        case 'qr':
        toolId = 11
        let q_type = helpers.getUrlParams().type
        if (typeof q_type !== 'undefined') {
          this.setState({
            type: q_type
          })
        }
        break

        // MessengerTool
        case 'msg':
        toolId = 12
        break

        default:
        toolId = 0
        break
      }
    }
    else {
      toolId = 0
    }
    this.setState({
      activeTool: this.tools[toolId],
      activeToolId: toolId,
      activeToolName: tools[toolId],
    })

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

  onKeyDown(keyName, e, handle) {
    switch (keyName) {
      case 'shift+alt+0':
      this.selectTool(0)
      break

      case 'shift+alt+1':
      this.selectTool(1)
      break

      case 'shift+alt+2':
      this.selectTool(2)
      break

      case 'shift+alt+3':
      this.selectTool(3)
      break

      case 'shift+alt+4':
      this.selectTool(4)
      break

      case 'shift+alt+5':
      this.selectTool(5)
      break

      case 'shift+alt+6':
      this.selectTool(6)
      break

      case 'shift+alt+7':
      this.selectTool(7)
      break

      case 'shift+alt+8':
      this.selectTool(8)
      break

      case 'shift+alt+9':
      this.selectTool(9)
      break

      case 'ctrl+shift+alt+0':
      this.selectTool(10)
      break

      case 'ctrl+shift+alt+1':
      this.selectTool(11)
      break

      case 'ctrl+shift+alt+2':
      this.selectTool(12)
      break

      default:
      break
    }
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
  selectTool(eventKey) {
    this.setState({
      activeTool: this.tools[eventKey],
      activeToolId: eventKey,
      activeToolName: tools[eventKey],
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

  /* Show/hide memo section at the footer */
  collapse() {
    var content = this.refs.collapse
    var contentWrapper = this.refs.contentWrapper

    if (content.style.maxHeight) {
      content.style.maxHeight = null
      contentWrapper.style.bottom = "2rem"
      this.setState({
        collapseText: 'Show Memo'
      })
    }
    else {
      content.style.maxHeight = "5.6rem"
      contentWrapper.style.bottom = "7.8rem"
      this.setState({
        collapseText: 'Hide Memo'
      })
    }
  }

  render() {
    //const ActiveView = tools[this.state.activeToolId]
    var active = this.state.activeToolName
    return (
      <div>
        <Hotkeys
          keyName="shift+alt+0,shift+alt+1,shift+alt+2,shift+alt+3,shift+alt+4,shift+alt+5,shift+alt+6,shift+alt+7,shift+alt+8,shift+alt+9,ctrl+shift+alt+0,ctrl+shift+alt+1,ctrl+shift+alt+2"
          onKeyDown={this.onKeyDown.bind(this)}
        />

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
        <div className="content-wrapper" ref="contentWrapper">
          <div className="content">
            {(active === 'HOME') && <Start /> }
            {(active === 'CONVERT') && <ConvertTool {...this} /> }
            {(active === 'SEED') && <SeedTool {...this} /> }
            {(active === 'PAPER') && <PaperWalletTool {...this} /> }
            {(active === 'PAY') && <PaymentTool {...this} /> }
            {(active === 'KEYGEN') && <KeyGeneratorTool {...this} /> }
            {(active === 'EXTRACT') && <AddressExtractorTool {...this} /> }
            {(active === 'FINDADDR') && <FindAddressTool {...this} /> }
            {(active === 'SIGN') && <SigningTool {...this} /> }
            {(active === 'POW') && <WorkGeneratorTool {...this} /> }
            {(active === 'VANITY') && <VanityTool {...this} /> }
            {(active === 'QR') && <QRTool {...this} /> }
            {(active === 'MSG') && <MessengerTool {...this} /> }
          </div>
        </div>

        <footer className="footer noprint">
          <div className="line"></div>
          <InputGroup ref="collapse" className="collapse-content">
            <FormControl as="textarea" rows="4" placeholder="Memo for copy data between tools"/>
          </InputGroup>
          <div className="footer-text">
            <span className="link-span" onClick={this.collapse}>{this.state.collapseText}</span> | <span className="link-span" onClick={this.showOwnerModal}>About Owner</span> | <a href="https://github.com/Joohansson/keytools">Github</a> | <a href="https://nano.org">Nano</a> | <span className="link-span" onClick={this.showDonateModal}>Donate</span>
          </div>
        </footer>
      </div>
    )
  }
}
export default MainPage
