import MainPage from './mainPage'

//Check if numeric string
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
