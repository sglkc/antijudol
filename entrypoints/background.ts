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

  chrome.storage.local.onChanged.addListener(async ({ enabled }) => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
      windowType: 'normal',
    })

    if (!tab || !tab.id) return console.error('tab not found')

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (enabled: boolean) => {
        console.log('toggled:', enabled)
        document.querySelector('ytd-comments#comments')
          ?.classList.toggle('judol-off', !enabled)
      },
      args: [enabled.newValue]
    })
  })
});
