import * as nano from 'nanocurrency230'
import * as nano_old from 'nanocurrency174' //must be used for high performance with derivePublicKey, including nano_old.init()
import nacl from 'tweetnacl/nacl';

let running = false
let currentAddressesCount = 0
let nextReport = 0
var searchAddress = ''
var searchSeed = ''
var indexStart = 0
var indexEnd = 0
var batchSize = 10000

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

function search(index) {
  currentAddressesCount += 1
  const secretKey = nano_old.deriveSecretKey(searchSeed, index)
  const publicKey = nano_old.derivePublicKey(secretKey)
  const address = nano_old.deriveAddress(publicKey)

  if (address === searchAddress) {
    running = false
    postMessage({
      type: 'match',
      payload: {
        index,
      },
    })
  }
}

async function searching() {
  setTimeout(() => {
    if (running) {
      const end = indexStart + batchSize
      for (let k = indexStart; k <= end; k+=1) {
        search(k);
        const now = Date.now();
        if (now > nextReport) {
          reportStats(currentAddressesCount);
          currentAddressesCount = 0;
          nextReport = now + 1000;
        }
        indexStart++
      }
      if (indexStart < indexEnd) {
        searching();
      }
      else {
        running = false
        postMessage({
          type: 'end',
        })
      }
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
        searchSeed = message.payload.seed
        searchAddress = message.payload.address.replace('nano','xrb')
        indexStart = parseInt(message.payload.indexStart)
        indexEnd = parseInt(message.payload.indexEnd)

        // make sure the batch size is not larger than the actual interval
        if (indexEnd - indexStart < 10000) {
          batchSize = indexEnd - indexStart
        }

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
