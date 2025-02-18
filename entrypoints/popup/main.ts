import '~/assets/popup.css'

const checkbox = document.querySelector('[type=checkbox]') as HTMLInputElement

checkbox.checked = Boolean(localStorage.getItem('enabled'))
checkbox.onchange = () => {
  chrome.runtime.sendMessage({ enabled: checkbox.value })
  localStorage.setItem('enabled', '1')
}
