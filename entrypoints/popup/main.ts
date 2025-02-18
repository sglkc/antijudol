import '~/assets/popup.css'

const storage = await chrome.storage.local.get(['enabled'])
const checkbox = document.querySelector('[type=checkbox]') as HTMLInputElement

checkbox.checked = Boolean(storage?.enabled)
checkbox.onchange = () => {
  chrome.storage.local.set({ enabled: checkbox.checked })
}
