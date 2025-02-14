export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  chrome.offscreen.createDocument({
    url: '/offscreen.html',
    reasons: [chrome.offscreen.Reason.BLOBS],
    justification: 'URL not found'
  })

  chrome.runtime.onMessage.addListener(console.log)
});
