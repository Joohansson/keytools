import MainPage from './mainPage'
import { css } from 'glamor';
import $ from 'jquery'
import * as nano from 'nanocurrency'
import bigInt from 'big-integer'
import bigDec from 'bigdecimal' //https://github.com/iriscouch/bigdecimal.js
import * as convert from './modules/conversion'
import namedNumber from 'hsimp-named-number'
import namedNumberDictionary from 'hsimp-named-number/named-number-dictionary.json'
import nacl from 'tweetnacl/nacl';
import { Base64 } from 'js-base64';
import * as rpc from './rpc' //rpc creds not shared on github

namedNumber.setDictionary(namedNumberDictionary)

const RPC_TIMEOUT = 10000

//CONSTANTS
export const constants = {
  INDEX_MAX: 4294967295, //seed index
  KEYS_MAX: 10000, //max keys to export
  SWEEP_MAX_INDEX: 100, //max keys to sweep using blake2b derivation
  SWEEP_MAX_PENDING: 1000, // max pending blocks to process per run
  RPC_MAX: 500, //max rpc requests of same type, for example pending blocks
  SAMPLE_PAYMENT_ADDRESS: 'nano_1gur37mt5cawjg5844bmpg8upo4hbgnbbuwcerdobqoeny4ewoqshowfakfo',
  RPC_SERVER: rpc.RPC_SERVER,
  RPC_SWEEP_SERVER: rpc.RPC_SWEEP_SERVER,
  RPC_LIMIT: rpc.RPC_LIMIT,
  RPC_CREDS: rpc.RPC_CREDS,
  WORK_THRESHOLD_ORIGINAL: '0xFFFFFFF8',
  WORK_THRESHOLD_2X: '0xFFFFFFFC',
  WORK_THRESHOLD_4X: '0xFFFFFFFE',
  WORK_THRESHOLD_8X: '0xFFFFFFFF',
}

class RPCError extends Error {
  constructor(code, ...params) {
    super(...params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RPCError)
    }

    this.name = 'RPCError'
    // Custom debugging information
    this.code = code
  }
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

// Generate secure random 64 char hex
export function genSecureKey() {
  const rand = nacl.randomBytes(32)
  return rand.reduce((hex, idx) => hex + (`0${idx.toString(16)}`).slice(-2), '')
}

// uint8array to hex string
export function uint8ToHex(uintValue) {
  let hex = '';
  let aux;
  for (let i = 0; i < uintValue.length; i++) {
    aux = uintValue[i].toString(16).toUpperCase();
    if (aux.length === 1) {
      aux = '0' + aux;
    }
    hex += aux;
    aux = '';
  }

  return(hex);
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
  let isnum = /^-?\d*\.?\d*$/.test(val)
  if (isnum && String(val).slice(-1) !== '.') {
    return true
  }
  else {
    return false
  }
}

// Check if numeric and larger than 0 string
export function isValidDiffMultiplier(val) {
  //numerics and last character is not a dot and number of dots is 0 or 1
  let isnum = /^-?\d*\.?\d*$/.test(val)
  if (isnum && String(val).slice(-1) !== '.') {
    if (parseFloat(val) > 0) {
      return true
    }
    else {
      return false
    }
  }
  else {
    return false
  }
}

// Return number of logical processors (not suppoerted on most mobile browsers)
export function getHardwareConcurrency() {
  var threads =  window.navigator.hardwareConcurrency || 1;
  if (threads >= 12) {
    threads-=2 //save two thread for handling the site
  }
  else if (threads >= 6) {
    threads-=1 //save one threads for handling the site
  }
  return threads
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

export function copyOutput() {
  copyOutputText()
}

export function copyInput1() {
  copyOutputText('#input-area')
}

export function copyInput2() {
  copyOutputText('#input2-area')
}

// Copy output of textarea to clipboard, and preserve line breaks
export function copyOutputText(id='#output-area') {
  const disabledProp = $(id).prop("disabled")
  if (disabledProp) {
    $(id).prop("disabled", false);
  }
  $(id).trigger('select')
  document.execCommand('copy')
  if (disabledProp) {
    $(id).prop("disabled", true)
  }

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

export function plural(n, text1, textn) {
  return n > 1 ? textn : text1;
}

function formatDurationWord(ms, ref, word1, wordn) {
  const value = Math.round(ms / ref);
  return `${value} ${plural(value, word1, wordn)}`;
}

export function formatDurationEstimation(ms) {
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

// From a range of numbers, return start and end values of the numerous chunks specified by the count
export function getIndexChunks(start, end, count) {
  var rangeChunks = []
  var i = start
  var len = Math.ceil((end-start)/count)
  var chunkEnd = 0
  while (i <= end-start) {
    chunkEnd = i + len
    if (chunkEnd > end) {
      chunkEnd = end
    }
    rangeChunks.push({indexStart: i, indexEnd: chunkEnd})
    i += len + 1
  }
  // special case if zero
  if (len === 0) {
    rangeChunks = [{indexStart: 0, indexEnd: 0}]
  }
  return rangeChunks
}

// Convert URL params to accessible object
export function getUrlParams(url) {

  // get query string from url (optional) or window
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

  // we'll store the parameters here
  var obj = {};

  // if query string exists
  if (queryString) {
    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];
    // split our query string into its component parts
    var arr = queryString.split('&');
    for (var i = 0; i < arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');
      // set parameter name and value (use 'true' if empty)
      var paramName = a[0];
      var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];
      paramValue = decodeURI(paramValue);
      //paramValue = this.sanitize(paramValue);  //sanitizer
      // if the paramName ends with square brackets, e.g. colors[] or colors[2]
      if (paramName.match(/\[(\d+)?\]$/)) {
        // create key if it doesn't exist
        var key = paramName.replace(/\[(\d+)?\]/, '');
        if (!obj[key]) obj[key] = [];
        // if it's an indexed array e.g. colors[2]
        if (paramName.match(/\[\d+\]$/)) {
          // get the index value and add the entry at the appropriate position
          var index = /\[(\d+)\]/.exec(paramName)[1];
          obj[key][index] = paramValue;
        } else {
          // otherwise add the value to the end of the array
          obj[key].push(paramValue);
        }
      } else {
        // we're dealing with a string
        if (!obj[paramName]) {
          // if it doesn't exist, create property
          obj[paramName] = paramValue;
        } else if (obj[paramName] && typeof obj[paramName] === 'string'){
          // if property does exist and it's a string, convert it to an array
          obj[paramName] = [obj[paramName]];
          obj[paramName].push(paramValue);
        } else {
          // otherwise add the property
          obj[paramName].push(paramValue);
        }
      }
    }
  }
  return obj;
}

// Replace the address bar content
export function setURLParams(params) {
  if (window.history.pushState) {
    try {
      window.history.replaceState(null, null, "/"+params)
    }
    catch(error) {
      //console.log(error)
    }
  }
}

// Check if string is hexdecimal
export function isHex(h) {
  let re = /^[0-9a-fA-F]+$/
  if (re.test(h)) {
    return true
  }
  return false
}

// Determine new difficulty from base difficulty (hexadecimal string) and a multiplier (float). Returns hex string
export function difficulty_from_multiplier(multiplier, base_difficulty) {
  let big64 = bigDec.BigDecimal(2).pow(64)
  let big_multiplier = bigDec.BigDecimal(multiplier)
  let big_base = bigDec.BigDecimal(bigDec.BigInteger(base_difficulty,16))
  let mode = bigDec.RoundingMode.HALF_DOWN()
  return big64.subtract((big64.subtract(big_base).divide(big_multiplier,0,mode))).toBigInteger().toString(16)
}

// Determine new multiplier from base difficulty (hexadecimal string) and target difficulty (hexadecimal string). Returns float
export function multiplier_from_difficulty(difficulty, base_difficulty) {
  let big64 = bigDec.BigDecimal(2).pow(64)
  let big_diff = bigDec.BigDecimal(bigDec.BigInteger(difficulty,16))
  let big_base = bigDec.BigDecimal(bigDec.BigInteger(base_difficulty,16))
  let mode = bigDec.RoundingMode.HALF_DOWN()
  return big64.subtract(big_base).divide(big64.subtract(big_diff),32,mode).toPlainString()
}

// Post data with no error handling
/*
export async function postData(data = {}) {
  // Default options are marked with *
  const response = await fetch(constants.RPC_SERVER, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *client
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  })
  return await response.json(); // parses JSON response into native JavaScript objects
}
*/

// Post data with timeout and catch errors
export async function postDataTimeout(data = {}, server=constants.RPC_SERVER) {
  let didTimeOut = false;

  return new Promise(function(resolve, reject) {
      const timeout = setTimeout(function() {
          didTimeOut = true;
          reject(new Error('Request timed out'));
      }, RPC_TIMEOUT);

      fetch(server, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Base64.encode(constants.RPC_CREDS)
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(data) // body data type must match "Content-Type" header
      })
      .then(function(response) {
          // Clear the timeout as cleanup
          clearTimeout(timeout);
          if(!didTimeOut) {
            if(response.status === 200) {
                resolve(response);
            }
            else {
              //console.log('Bad RPC http status!');
              throw new RPCError(response.status, "HTTP status "+response.status)
            }
          }
      })
      .catch(function(err) {
          //console.log('RPC fetch failed! ', err);

          // Rejection already happened with setTimeout
          if(didTimeOut) return;
          // Reject with error
          reject(err);
      });
  })
  .then(async function(result) {
      // Request success and no timeout
      return await result.json()
  })
  /*Catch error upstream instead
  .catch(function(err) {
      // Error: response error, request timeout or runtime error
      console.log('RPC error! ', err);
  });*/
}

/* Helper functions to detect CPU concurrency */
var blobUrl = URL.createObjectURL(new Blob(['(',
  function() {
    // eslint-disable-next-line no-restricted-globals
    self.addEventListener('message', function(e) {
      // run worker for 4 ms
      var st = Date.now();
      var et = st + 4;
      while(Date.now() < et);
      // eslint-disable-next-line no-restricted-globals
      self.postMessage({st: st, et: et});
    });
  }.toString(),
')()'], {type: 'application/javascript'}));

export function sample(max, samples, numWorkers, callback) {
  if(samples === 0) {
    // get overlap average
    var avg = Math.floor(max.reduce(function(avg, x) {
      return avg + x;
    }, 0) / max.length);
    avg = Math.max(1, avg);
    if (avg >= 12) {
      avg-=2 //save two thread for handling the site
    }
    else if (avg >= 6) {
      avg-=1 //save one threads for handling the site
    }
    return callback(null, avg);
  }
  map(numWorkers, function(err, results) {
    max.push(reduce(numWorkers, results));
    sample(max, samples - 1, numWorkers, callback);
  });
}

function map(numWorkers, callback) {
  var workers = [];
  var results = [];
  for(var i = 0; i < numWorkers; ++i) {
    var worker = new Worker(blobUrl);
    worker.addEventListener('message', function(e) {
      results.push(e.data);
      if(results.length === numWorkers) {
        for(var i = 0; i < numWorkers; ++i) {
          workers[i].terminate();
        }
        callback(null, results);
      }
    });
    workers.push(worker);
  }
  for(i = 0; i < numWorkers; ++i) {
    workers[i].postMessage(i);
  }
}

function reduce(numWorkers, results) {
  // find overlapping time windows
  var overlaps = [];
  for(var n = 0; n < numWorkers; ++n) {
    var r1 = results[n];
    var overlap = overlaps[n] = [];
    for(var i = 0; i < numWorkers; ++i) {
      if(n === i) {
        continue;
      }
      var r2 = results[i];
      if((r1.st > r2.st && r1.st < r2.et) ||
        (r2.st > r1.st && r2.st < r1.et)) {
        overlap.push(i);
      }
    }
  }
  // get maximum overlaps ... don't include overlapping worker itself
  // as the main JS process was also being scheduled during the work and
  // would have to be subtracted from the estimate anyway
  return overlaps.reduce(function(max, overlap) {
    return Math.max(max, overlap.length);
  }, 0);
}