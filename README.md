# KeyTools - High performance Nano web tools written with reactJS
* Can be run from local file system offline by downloading [this zip package](https://github.com/Joohansson/keytools/raw/master/keytools.zip)
* Hosted by [github pages](https://github.com/Joohansson/keytools/tree/gh-pages) via https://tools.nanos.cc
* Current version: 1.0.1

## Developer instructions

### Prepare for build (Ubuntu or Windows)
Install nodejs and npm
* [Ubuntu](https://tecadmin.net/install-latest-nodejs-npm-on-ubuntu/)
* [Windows](https://www.guru99.com/download-install-node-js.html)

`git clone https://github.com/Joohansson/keytools`\
`cd keytools`\
`npm install`

Create an empty file in the src folder called rpc.js. It usually contains credentials for connecting to the RPC server and that is not shared publicly. However, you will not be able to use the Network Inspector tool or read RPC data in off-chain signing without these credentials or setting up your own RPC server. The file is needed to build the app.
Syntax of the file:
`export const RPC_SERVER = 'https://myApiServer/'`
`export const RPC_LIMIT = 'Message when blocked by the API.'`
`export const RPC_CREDS = 'username:password'`

### Test application
`npm start`

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Build application

`npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

Your app is ready to be deployed!

### Get started adding a new tool

1. Copy any tool.js file and rename it to MyTool.js
2. Alter the row at the top: <class MyTool extends Component {>
3. Alter the row at the bottom: <export default MyTool>
4. Change tools/index.js: Add <import MyTool from './MyTool.js'>
5. Change tools/index.js: Add the new class to <export {ConvertTool,...>
6. Change mainPage.js: Add the new class to <import { Start, Terms, ConvertTool,...>
7. Change mainPage.js: Add the new entry to <const tools = ['HOME', 'CONVERT',...>
8. Change mainPage.js: Add a tool dropdown title to <this.tools = ['0: HOME', '1: Unit Converter',...>
9. Change mainPage.js: Add tool at <{(active === 'CONVERT') && <ConvertTool {...this} /> }...>
10. Change mainPage.js: Add a section to control URL params at <switch (tool) {...>
11. For hotkeys, search for this and add appropriate key: shift+alt+0
12. The new tool should now be available from the main dropdown selector. Happy coding!

## Some Nice Libraries Used

* [Nano library - Nano-currency-js](https://github.com/marvinroger/nanocurrency-js)
* [Nano library - Nano-currency-web-js](https://github.com/numsu/nanocurrency-web-js)
* [PoW Generation - Nano webGL](https://github.com/numtel/nano-webgl-pow)
* [BIP39 Mnemonics](https://www.npmjs.com/package/bip39)
* [Notifications](https://github.com/fkhadra/react-toastify)
* [Fancy QR generation - jsQR](https://github.com/cozmo/jsQR)
* [Auditable high-security cryptographic library - Tweetnacl](https://tweetnacl.js.org/)
* [Messaging over sound - Chirp](https://developers.chirp.io/)

## Inspiration Hall of Fame

* Nanoo tools: https://nanoo.tools/
* Nanoaddr: https://nanoaddr.io

## Contribution

Find this useful? Send me a Nano donation at `nano_1gur37mt5cawjg5844bmpg8upo4hbgnbbuwcerdobqoeny4ewoqshowfakfo`
