import * as nano from 'nanocurrency230'
import * as nano_old from 'nanocurrency174' //must be used for high performance with derivePublicKey, including nano_old.init()
import nacl from 'tweetnacl/nacl'

const BATCH_SIZE = 10000
let running = false
let currentAddressesCount = 0
let nextReport = 0
var initChar = ''
var prefix = ''
var suffix = ''
var initCharInt = 0 //used to subtract the match start point

self.addEventListener("message", getMessage) // eslint-disable-line no-restricted-globals

// Report back to main thread with stats
function reportStats(addresses) {
  postMessage({
    type: 'stats',
    payload: {
      addresses,
    },
  })
}

// Check if address (without nano_) matches the prefix
function isMatch(address) {
  if (address.substr(5-initCharInt).startsWith(prefix) && address.endsWith(suffix)) {
    return true
  }
  return false
}

function search() {
  currentAddressesCount += 1
  const rand = nacl.randomBytes(32)
  const seed = rand.reduce((hex, idx) => hex + (`0${idx.toString(16)}`).slice(-2), '')
  const secretKey = nano_old.deriveSecretKey(seed, 0)
  const publicKey = nano_old.derivePublicKey(secretKey)
  const address = nano_old.deriveAddress(publicKey)

  if (isMatch(address)) {
    const wallet = {
      seed,
      secretKey,
      publicKey,
      address: address.replace('xrb','nano'),
    }
    postMessage({
      type: 'match',
      payload: {
        wallet,
      },
    })
  }
}

async function searching() {
  setTimeout(() => {
    if (running) {
      for (let i = 0; i < BATCH_SIZE; i += 1) {
        search();
        const now = Date.now();
        if (now > nextReport) {
          reportStats(currentAddressesCount);
          currentAddressesCount = 0;
          nextReport = now + 1000;
        }
      }
      searching();
    }
  }, 0);
}

async function getMessage(event) {
  let message = event.data
  switch (message.type) {
    case 'start': {
      if (!running) {
        running = true
        await nano_old.init()
        nextReport = Date.now() + 1000
        currentAddressesCount = 0
        initChar = message.payload.initChar

        // if the init char is 1 or 3
        if (initChar !== '') {
          initCharInt = 1 // change starting point of match
          prefix = initChar + message.payload.prefix
        }
        else {
          prefix = message.payload.prefix
        }

        suffix = message.payload.suffix
        searching()
      }
      break;
    }

    case 'stop': {
      running = false
      postMessage({
        type: 'stopped'
      })
      break
    }

    default: {
      throw new Error(`Unknown message ${String(message.type)}`)
    }
  }
}
