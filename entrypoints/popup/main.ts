import '~/assets/popup.css'

chrome.storage.local.get(['enabled']).then((storage) => {
  const checkbox = document.querySelector('[type=checkbox]') as HTMLInputElement

  checkbox.checked = Boolean(storage?.enabled)
  checkbox.onchange = () => {
    chrome.storage.local.set({ enabled: checkbox.checked })
  }
})
