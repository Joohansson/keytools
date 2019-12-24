import MainPage from './mainPage'
import { css } from 'glamor';
import $ from 'jquery'
import * as nano from 'nanocurrency'
import bigInt from 'big-integer'
import * as convert from './modules/conversion'
import namedNumber from 'hsimp-named-number'
import namedNumberDictionary from 'hsimp-named-number/named-number-dictionary.json'

namedNumber.setDictionary(namedNumberDictionary)

//CONSTANTS
export const constants = {
  INDEX_MAX: 4294967295, //seed index
  KEYS_MAX: 10000, //max keys to export
  SAMPLE_PAYMENT_ADDRESS: 'nano_1gur37mt5cawjg5844bmpg8upo4hbgnbbuwcerdobqoeny4ewoqshowfakfo',
}

// QR css
export const qrClassesContainer = ["QR-container", "QR-container-2x", "QR-container-4x"]
export const qrClassesImg = ["QR-img", "QR-img-2x", "QR-img-4x"]

// Subtract two big integers
export function bigSubtract(input,value) {
  let insert = bigInt(input)
  let val = bigInt(value)
  return insert.subtract(val).toString()
}

// Add two big integers
export function bigAdd(input,value) {
  let insert = bigInt(input)
  let val = bigInt(value)
  return insert.add(val).toString()
}

// Checks if a big integer is negative
export function bigIsNegative(input) {
  return bigInt(input).isNegative()
}

export function rawTonano(input) {
  //return this.isNumeric(input) ? nano.convert(input, {from: nano.Unit.raw, to: nano.Unit.nano}) : 'N/A'
  return isNumeric(input) ? convert.convert(input, {from: nano.Unit.raw, to: nano.Unit.nano}) : 'N/A'
}

export function rawToMnano(input) {
  //return this.isNumeric(input) ? nano.convert(input, {from: nano.Unit.raw, to: nano.Unit.NANO}) : 'N/A'
  return isNumeric(input) ? convert.convert(input, {from: nano.Unit.raw, to: nano.Unit.NANO}) : 'N/A'
}

export function nanoToRaw(input) {
  //return this.isNumeric(input) ? nano.convert(input, {from: nano.Unit.nano, to: nano.Unit.raw}) : 'N/A'
  return isNumeric(input) ? convert.convert(input, {from: nano.Unit.nano, to: nano.Unit.raw}) : 'N/A'
}

export function nanoToMnano(input) {
  //return this.isNumeric(input) ? nano.convert(input, {from: nano.Unit.nano, to: nano.Unit.NANO}) : 'N/A'
  return isNumeric(input) ? convert.convert(input, {from: nano.Unit.nano, to: nano.Unit.NANO}) : 'N/A'
}

export function MnanoToRaw(input) {
  //return this.isNumeric(input) ? nano.convert(input, {from: nano.Unit.NANO, to: nano.Unit.raw}) : 'N/A'
  return isNumeric(input) ? convert.convert(input, {from: nano.Unit.NANO, to: nano.Unit.raw}) : 'N/A'
}

export function MnanoTonano(input) {
  //return this.isNumeric(input) ? nano.convert(input, {from: nano.Unit.NANO, to: nano.Unit.nano}) : 'N/A'
  return isNumeric(input) ? convert.convert(input, {from: nano.Unit.NANO, to: nano.Unit.nano}) : 'N/A'
}

// Check if numeric string
export function isNumeric(val) {
  //numerics and last character is not a dot and number of dots is 0 or 1
  let isnum = /(?<=^| )\d+(\.\d+)?(?=$| )/.test(val)
  if (isnum) {
    return true
  }
  else {
    return false
  }
}

// Return number of logical processors
export function getHardwareConcurrency() {
  return window.navigator.hardwareConcurrency || 1;
}

//Copy any text to clipboard
export function copyText(event) {
  var dummy = document.createElement("input")
  document.body.appendChild(dummy)
  dummy.setAttribute('value', event.target.value)
  dummy.select()
  let success = document.execCommand("copy")
  document.body.removeChild(dummy)

  if (success) {
    new MainPage().notifyCopy()
  }
  else {
    new MainPage().notifyCopyFail()
  }
}

// Copy output of textarea to clipboard, and preserve line breaks
export function copyOutput() {
  $('#output-area').select()
  document.execCommand('copy')

  // clear selection
  if (window.getSelection) {window.getSelection().removeAllRanges();}
  else if (document.selection) {document.selection.empty();}

  let success = document.execCommand("copy")

  if (success) {
    new MainPage().notifyCopy()
  }
  else {
    new MainPage().notifyCopyFail()
  }
}

//Toast styling
export const toastType = {
  SUCCESS: 'success',
  SUCCESS_AUTO: 'success-auto',
  ERROR: 'error',
  ERROR_AUTO: 'error-auto',
  ERROR_AUTO_LONG: 'error-auto-long'
}

export function getToast(id) {
  const colorRed = 'rgba(214,95,100,1.0)'
  const colorBlue = 'rgba(74,144,226,1.0)'

  var color = ''
  switch (id) {
    case toastType.SUCCESS:
    color = colorBlue
    break

    case toastType.SUCCESS_AUTO:
    color = colorBlue
    break

    case toastType.ERROR:
    color = colorRed
    break

    case toastType.ERROR_AUTO:
    color = colorRed
    break

    case toastType.ERROR_AUTO_LONG:
    color = colorRed
    break

    default:
    color = colorBlue
    break
  }
  return {
    containerId: id,
    className: css({
      background: color,
      minHeight: '54px'
    }),
    bodyClassName: css({
      fontSize: 'calc(10px + 0.8vmin)',
      color: '#EEE',
    }),
    progressClassName: css({
      background: '#EEE'
    })
  }
}

//Thousand separator
export function addCommas(nStr) {
  nStr += '';
  var x = nStr.split('.');
  var x1 = x[0];
  var x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1,$2');
  }
  return x1 + x2;
}

export const MS_S = 1000;
export const MS_M = MS_S * 60;
export const MS_H = MS_M * 60;
export const MS_D = MS_H * 24;
export const MS_W = MS_D * 7;
export const MS_Y = MS_D * 365.25;

export function plural(n: number, text1: string, textn: string): string {
  return n > 1 ? textn : text1;
}

function formatDurationWord(ms: number, ref: number, word1: string, wordn: string): string {
  const value = Math.round(ms / ref);
  return `${value} ${plural(value, word1, wordn)}`;
}

export function formatDurationEstimation(ms: number): string {
  if (ms >= MS_Y * 1000) {
    const name = namedNumber(Math.round(ms / MS_Y));
    return `${name.getName()} years`;
  }
  if (ms >= MS_Y) {
    return formatDurationWord(ms, MS_Y, 'year', 'years');
  }
  if (ms >= MS_W) {
    return formatDurationWord(ms, MS_W, 'week', 'weeks');
  }
  if (ms >= MS_D) {
    return formatDurationWord(ms, MS_D, 'day', 'days');
  }
  if (ms >= MS_H) {
    return formatDurationWord(ms, MS_H, 'hour', 'hours');
  }
  if (ms >= MS_M) {
    return formatDurationWord(ms, MS_M, 'minute', 'minutes');
  }
  return formatDurationWord(ms, MS_S, 'second', 'seconds');
}
