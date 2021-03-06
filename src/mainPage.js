import React, { Component } from 'react'
import {ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Dropdown, DropdownButton, InputGroup, FormControl} from 'react-bootstrap'
import { css } from 'glamor';
import * as helpers from './helpers'
import $ from 'jquery'
import donation from './img/donation.png';
import Hotkeys from 'react-hot-keys'
import packageJson from '../package.json';
import { Start, Terms, ConvertTool, SeedTool, FindAddressTool, KeyGeneratorTool, AddressExtractorTool, PaperWalletTool, PaymentTool,
  SigningTool, WorkGeneratorTool, VanityTool, InspectTool, QRTool, MessengerTool, SweepTool, DifficultyTool, MultisigTool} from './tools'
const tools = ['HOME', 'CONVERT', 'SEED', 'PAPER', 'PAY', 'KEYGEN', 'EXTRACT', 'FINDADDR', 'SIGN', 'POW', 'VANITY', 'INSPECTOR', 'QR', "MSG", "SWEEP", "DIFF", "MULTISIG"]
global.appVersion = packageJson.version;

class MainPage extends Component {
  constructor(props) {
    super(props)
    this.tools = ['0: HOME', '1: Unit Converter', '2: Key Converter', '3: Paper Wallet Generator ', '4: Payment Card', '5: Mass Wallet Generator',
    '6: Mass Keypair Extractor', '7: Find Address in Seed', '8: Block Processor', '9: PoW Generator',
    '10: Vanity Address Generator', '11: Network Inspector', '12: QR Generator / Reader', '13: Offline Audio Messenger', '14: Wallet Sweeper', '15: PoW Threshold Converter', '16: Multi-Signature']
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
    this.showTerms = this.showTerms.bind(this)
    this.showStart = this.showStart.bind(this)
  }

  componentDidMount = () => {
    console.log(`You are running version - ${global.appVersion}. If something is broken, try loading a new version by clearing the cache with CTRL+F5 or Apple + R.`);

    // Set footer height
    var contentWrapper = this.refs.contentWrapper
    contentWrapper.style.bottom = "40px"

    // Read URL params
    var tool = helpers.getUrlParams().tool
    var toolId = 0
    var terms = false

    if (typeof tool !== 'undefined') {
      switch (tool) {
        // SeedTool
        case 'terms':
        toolId = 0
        terms = true
        break

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
        let recipient = helpers.getUrlParams().recipient
        let message = helpers.getUrlParams().message
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
        if (typeof recipient !== 'undefined') {
          this.setState({
            recipient: recipient
          })
        }
        if (typeof message !== 'undefined') {
          this.setState({
            message: message
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
        let s_amountType = helpers.getUrlParams().amounttype
        let s_hash = helpers.getUrlParams().hash
        let s_workhash = helpers.getUrlParams().workhash

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
        if (typeof s_amountType !== 'undefined') {
          this.setState({
            amountType: s_amountType
          })
        }
        if (typeof s_hash !== 'undefined') {
          this.setState({
            hash: s_hash
          })
        }
        if (typeof s_workhash !== 'undefined') {
          this.setState({
            workHash: s_workhash
          })
        }
        break

        // WorkGeneratorTool
        case 'pow':
        toolId = 9
        let p_hash = helpers.getUrlParams().hash
        let p_load = helpers.getUrlParams().load
        let p_multiplier = helpers.getUrlParams().multiplier
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
        if (typeof p_multiplier !== 'undefined') {
          this.setState({
            multiplier: p_multiplier
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

        // Inspector Tool
        case 'inspector':
        toolId = 11
        let i_type = helpers.getUrlParams().type
        let i_address = helpers.getUrlParams().address
        let i_block = helpers.getUrlParams().block
        let i_count = helpers.getUrlParams().count
        let i_reverse = helpers.getUrlParams().reverse
        let i_threshold = helpers.getUrlParams().threshold
        let i_threstype = helpers.getUrlParams().threstype

        if (typeof i_type !== 'undefined') {
          this.setState({
            type: i_type
          })
        }
        if (typeof i_address !== 'undefined') {
          this.setState({
            address: i_address
          })
        }
        if (typeof i_block !== 'undefined') {
          this.setState({
            block: i_block
          })
        }
        if (typeof i_count !== 'undefined') {
          this.setState({
            count: i_count
          })
        }
        if (typeof i_reverse !== 'undefined') {
          this.setState({
            reverse: i_reverse
          })
        }
        if (typeof i_threshold !== 'undefined') {
          this.setState({
            threshold: i_threshold
          })
        }
        if (typeof i_threstype !== 'undefined') {
          this.setState({
            threstype: i_threstype
          })
        }
        break

        // QRTool
        case 'qr':
        toolId = 12
        let q_type = helpers.getUrlParams().type
        if (typeof q_type !== 'undefined') {
          this.setState({
            type: q_type
          })
        }
        break

        // MessengerTool
        case 'msg':
        toolId = 13
        break

        // SweepTool
        case 'sweep':
        toolId = 14
        break

        // DifficultyTool
        case 'difficulty':
        toolId = 15
        let baseDiff = helpers.getUrlParams().basediff
        let newDiff = helpers.getUrlParams().newdiff
        let multiplier = helpers.getUrlParams().multiplier
        if (typeof baseDiff !== 'undefined') {
          this.setState({
            baseDiff: baseDiff
          })
        }
        if (typeof newDiff !== 'undefined') {
          this.setState({
            newDiff: newDiff
          })
        }
        if (typeof multiplier !== 'undefined') {
          this.setState({
            multiplier: multiplier
          })
        }
        break

        // MultisigTool
        case 'multisig':
        toolId = 16
        let m_hash = helpers.getUrlParams().hash
        let m_participants = helpers.getUrlParams().parties
        let m_multi = helpers.getUrlParams().multi
        if (typeof m_hash !== 'undefined') {
          this.setState({
            hash: m_hash
          })
        }
        if (typeof m_participants !== 'undefined') {
          this.setState({
            participants: m_participants
          })
        }
        if (typeof m_multi !== 'undefined') {
          this.setState({
            multi: m_multi
          })
        }
        break

        default:
        break
      }
    }

    this.setState({
      activeTool: this.tools[toolId],
      activeToolId: toolId,
      activeToolName: tools[toolId],
    })

    if (terms) {
      this.showTerms()
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

  showTerms() {
    this.setState({
      activeTool: this.tools[0],
      activeToolId: 0,
      activeToolName: 'TERMS',
    })
  }

  showStart() {
    this.setState({
      activeTool: this.tools[0],
      activeToolId: 0,
      activeToolName: tools[0],
    })
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

      case 'ctrl+shift+alt+3':
      this.selectTool(13)
      break

      case 'ctrl+shift+alt+4':
      this.selectTool(14)
      break

      case 'ctrl+shift+alt+5':
      this.selectTool(15)
      break

      case 'ctrl+shift+alt+6':
      this.selectTool(16)
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
      raw: undefined,
      nano: undefined,
      mnano: undefined,
      address: undefined,
      count: undefined,
      priv: undefined,
      pub: undefined,
      addr: undefined,
      type: undefined,
      link: undefined,
      previous: undefined,
      rep: undefined,
      balance: undefined,
      amount: undefined,
      hash: undefined,
      workHash: undefined,
      load: undefined,
      multiplier: undefined,
      init: undefined,
      prefix: undefined,
      suffix: undefined,
      block: undefined,
      reverse: undefined,
      threshold: undefined,
      threstype: undefined,
      baseDiff: undefined,
      newDiff: undefined,
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
        <div className="background-noise"></div>
        <Hotkeys
          keyName="shift+alt+0,shift+alt+1,shift+alt+2,shift+alt+3,shift+alt+4,shift+alt+5,shift+alt+6,shift+alt+7,
          shift+alt+8,shift+alt+9,ctrl+shift+alt+0,ctrl+shift+alt+1,ctrl+shift+alt+2,ctrl+shift+alt+3,ctrl+shift+alt+4,
          ctrl+shift+alt+5,ctrl+shift+alt+6"
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
            autoClose={5000}
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
            <div className={this.state.activeToolName === 'TERMS' ? '':'hidden'}>
              <p><span className="link-span" onClick={this.showStart}>Close</span></p>
            </div>
            {(active === 'HOME') && <Start /> }
            {(active === 'TERMS') && <Terms /> }
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
            {(active === 'INSPECTOR') && <InspectTool {...this} /> }
            {(active === 'QR') && <QRTool {...this} /> }
            {(active === 'MSG') && <MessengerTool {...this} /> }
            {(active === 'SWEEP') && <SweepTool {...this} /> }
            {(active === 'DIFF') && <DifficultyTool {...this} /> }
            {(active === 'MULTISIG') && <MultisigTool {...this} /> }
          </div>
        </div>

        <footer className="footer noprint">
          <div className="line"></div>
          <InputGroup ref="collapse" className="collapse-content">
            <FormControl as="textarea" rows="4" placeholder="Memo for copying data between tools"/>
          </InputGroup>
          <div className="footer-text">
            <span className="link-span" onClick={this.collapse}>{this.state.collapseText}</span> | <span className="link-span" onClick={this.showOwnerModal}>About</span> | <a href="https://github.com/Joohansson/keytools">Github</a> | <a href="https://nano.org">Nano</a> | <span className="link-span" onClick={this.showDonateModal}>Donate</span> | <span className="link-span" onClick={this.showTerms}>Terms</span>
          </div>
        </footer>
      </div>
    )
  }
}
export default MainPage
