const lockedNode = document.querySelector('[unlock-lock]')

if (lockedNode) {
  // If there is no lock, do nothing!
  var src = 'http://127.0.0.1:3000'
  var s = document.createElement('iframe')
  src += `/lock/${lockedNode.getAttribute('unlock-lock')}`

  // Style for the iframe: cover everything!
  s.setAttribute('style', 'display:none; position:fixed; top:30%; left:30%; width:50%; height:50%; border:0px; background: transparent; z-index: 2147483647;')
  s.setAttribute('src', src)

  // Append the iframe!
  document.getElementsByTagName('body')[0].appendChild(s)

  // Remove content from lockedNode and memoize it
  const hiddenStyles = {
    height: '100%',
    overflow: 'hidden',
    position: 'fixed',
    '-webkit-filter': 'grayscale(0.3) blur(3px)',
  }
  const prevStyles = {
  }

  // Listens to message coming from iframe
  window.addEventListener('message', (event) => {
    if (event.data === 'locked') {
      // let's set the style for the iframe
      s.style.display = 'block'
      // and hide the content
      Object.keys(hiddenStyles).forEach(function (k) {
        prevStyles[k] = lockedNode.style[k]
        lockedNode.style[k] = hiddenStyles[k]
      })

    }

    if (event.data === 'unlocked') {
      // let's remove the iframe!
      document.getElementsByTagName('body')[0].removeChild(s)

      // And restore style of the underlying element
      Object.keys(prevStyles).forEach(function (k) {
        lockedNode.style[k] = prevStyles[k]
      })
    }
  }, false)
}