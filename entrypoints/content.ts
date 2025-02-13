function onNewComment(element: Element) {
  // jika elemen kosong atau tag name tidak sesuai, skip
  if (!element || element.tagName !== 'YTD-COMMENT-THREAD-RENDERER') return

  const author = element.querySelector('#author-text')
  const content = element.querySelector('#content-text')

  if (!author || !content || !author.textContent || !content.textContent) return

  console.log('Komen baru dari', author.textContent.trim())
  console.log(content.textContent.trim())
  console.log('-----------------------------------')

  // processing...

  author.textContent = '#ICT2025'
  content.textContent = 'saya dukung kemajuan ICT'
}

export default defineContentScript({
  matches: ['https://*.youtube.com/watch'],
  async main() {
    await new Promise<void>((resolve, reject) => {
      if (document.querySelector('ytd-item-section-renderer:has(:is(#content, #contents))')) return resolve()

      const documentObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (!(node instanceof HTMLElement)) return
            if (!node.matches('ytd-comment-thread-renderer:has(#content, #contents)')) return

            console.log('found observing', node)
            documentObserver.disconnect()
            resolve()
          }
        }
      })

      documentObserver.observe(document.body, { childList: true, subtree: true })
    })

    // ambil element container komentar
    const commentSection = document.querySelector('ytd-item-section-renderer #contents') as HTMLElement
    console.log('FOUND!!', commentSection)

    // langsung proses komentar yang sudah dirender awal
    // setiap elemen dari isi comment section diproses oleh fungsi onNewComment
    Array.from(commentSection.children).forEach(onNewComment)

    // observe mutasi elemen, jika ada perubahan maka panggil callback dibawah
    const commentSectionObserver = new MutationObserver(([ mutation ]) => {
      // skip jika tidak ada elemen ditambahkan
      if (!mutation.addedNodes) return

      // komentar ditambahkan satu-per-satu, ambil elemen pertama dari array
      const [newComment] = mutation.addedNodes

      // gaskan ke fungsi proses komentar
      onNewComment(newComment as Element)
    })

    // observe isi elemen dari commentsection
    // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe
    commentSectionObserver.observe(commentSection, { childList: true })
  },
});
