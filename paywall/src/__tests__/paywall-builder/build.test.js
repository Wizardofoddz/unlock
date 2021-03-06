import buildPaywall, { redirect } from '../../../paywall-builder/build'
import * as script from '../../../paywall-builder/script'
import * as iframeManager from '../../../paywall-builder/iframe'

global.window = {} // this is fun...
global.MutationObserver = function() {
  this.observe = () => {}
}

const fakeLockAddress = 'lockaddress'

describe('buildPaywall', () => {
  let document

  beforeEach(() => {
    document = {
      documentElement: {
        scrollHeight: 0,
      },
    }
  })

  afterEach(() => jest.restoreAllMocks())

  it('redirect', () => {
    const window = {
      location: {
        href: 'href/',
      },
    }

    redirect(window, 'hi')

    expect((window.location.href = 'hi/href%2F'))
  })
  describe('sets up the iframe on load', () => {
    let mockScript
    let mockIframe
    let mockIframeImpl
    let mockAdd
    let window
    beforeEach(() => {
      mockScript = jest.spyOn(script, 'findPaywallUrl')
      mockIframe = jest.spyOn(iframeManager, 'getIframe')
      mockIframeImpl = {
        contentWindow: {
          postMessage: () => {},
        },
      }
      mockAdd = jest.spyOn(iframeManager, 'add')
      mockScript.mockImplementation(() => '/url')
      mockIframe.mockImplementation(() => mockIframeImpl)
      mockAdd.mockImplementation(() => {})
      window = {
        addEventListener(type, listener) {
          expect(type).toBe('message')
          expect(listener).not.toBe(null)
        },
        requestAnimationFrame() {},
        location: {
          hash: '',
        },
      }
    })
    it('no lockAddress, give up', () => {
      buildPaywall(window, document)

      expect(mockScript).not.toHaveBeenCalled()
    })

    it('sets up the iframe with correct url', () => {
      buildPaywall(window, document, fakeLockAddress)

      expect(mockScript).toHaveBeenCalledWith(document)
      expect(mockIframe).toHaveBeenCalledWith(
        document,
        '/url/paywall/lockaddress/'
      )
    })

    it('passes the hash to the iframe, if present', () => {
      // when the content is loaded from the paywall in a new window,
      // it appends the user account as a hash. This is then passed on
      // as-is. Note that it passes any hash on, without validation,
      // because the lockRoute function properly validates the incoming hash
      window.location.hash = '#hithere'
      buildPaywall(window, document, fakeLockAddress)

      expect(mockScript).toHaveBeenCalledWith(document)
      expect(mockIframe).toHaveBeenCalledWith(
        document,
        '/url/paywall/lockaddress/#hithere'
      )
    })

    it('adds the iframe to the page', () => {
      buildPaywall(window, document, fakeLockAddress)

      expect(mockAdd).toHaveBeenCalledWith(document, mockIframeImpl)
    })

    it('sets up the message event listeners', () => {
      jest.spyOn(window, 'addEventListener')
      buildPaywall(window, document, fakeLockAddress)

      expect(window.addEventListener).toHaveBeenCalled()
    })
    describe('event listeners', () => {
      let window
      let callbacks
      let mockShow
      let mockHide
      let blocker
      beforeEach(() => {
        callbacks = {}
        window = {
          addEventListener(type, listener) {
            callbacks[type] = listener
          },
          requestAnimationFrame() {},
          location: {
            href: 'href',
            hash: '',
          },
        }
        blocker = {
          remove: jest.fn(),
        }
        mockShow = jest.spyOn(iframeManager, 'show')
        mockShow.mockImplementation(() => {})
        mockHide = jest.spyOn(iframeManager, 'hide')
        mockHide.mockImplementation(() => {})
        buildPaywall(window, document, fakeLockAddress, blocker)
      })
      it('triggers show on locked event', () => {
        callbacks.message({ data: 'locked' })

        expect(mockShow).toHaveBeenCalledWith(mockIframeImpl, document)
        expect(mockHide).not.toHaveBeenCalled()
      })
      it('closes the blocker on locked event', () => {
        callbacks.message({ data: 'locked' })

        expect(blocker.remove).toHaveBeenCalled()
      })
      it('closes the blocker on unlocked event', () => {
        callbacks.message({ data: 'locked' })
        callbacks.message({ data: 'unlocked' })

        expect(blocker.remove).toHaveBeenCalledTimes(2)
      })
      it('does not trigger show on locked event if already unlocked', () => {
        callbacks.message({ data: 'locked' })
        callbacks.message({ data: 'locked' })

        expect(mockShow).toHaveBeenCalledTimes(1)
        expect(mockHide).not.toHaveBeenCalled()
      })
      it('triggers hide on unlock event', () => {
        callbacks.message({ data: 'locked' })
        callbacks.message({ data: 'unlocked' })
        callbacks.message({ data: 'unlocked' })

        expect(mockHide).toHaveBeenCalledWith(mockIframeImpl, document)
        expect(mockHide).toHaveBeenCalledTimes(1)
        expect(mockShow).toHaveBeenCalledTimes(1)
      })
      it('calls redirect on redirect event', () => {
        callbacks.message({ data: 'redirect' })

        expect(window.location.href).toBe('/url/paywall/lockaddress/href')
      })
    })
  })
})
