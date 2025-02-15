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
  chrome.runtime.onMessage.addListener(console.log)
});
