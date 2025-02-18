async function initOffscreen() {
  if (await chrome.offscreen.hasDocument()) {
    await chrome.offscreen.closeDocument()
  }

  chrome.offscreen.createDocument({
    url: '/offscreen.html',
    reasons: [chrome.offscreen.Reason.BLOBS],
    justification: 'URL not found'
  })
}

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });
  initOffscreen()

  chrome.runtime.onMessage.addListener(async (msg: { enabled: boolean }) => {
    if (!('enabled' in msg)) return

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
      windowType: 'normal',
    })

    if (!tab || !tab.id) return

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (enabled: boolean) => {
        console.log('toggled:', enabled)
      },
      args: [msg.enabled]
    })
  })
});
