#!/usr/bin/env node

const fs = require('fs')

const rpcFilePath = `${__dirname}/../src/rpc.js`

try {
  fs.statSync(rpcFilePath)
} catch (e) {
  console.warn(`No rpc.js found. Creating dummy rpc file at ${rpcFilePath}`)
  fs.appendFileSync(rpcFilePath, '')
}

require("child_process").exec("npm start", {
  cwd: __dirname
}, (error, stdout, stderr) => {
  console.error(error)
  console.error(stderr)
  // eslint-disable-next-line no-console
  console.log(stdout)
})
