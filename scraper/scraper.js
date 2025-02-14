// @ts-check

import { createObjectCsvWriter } from 'csv-writer'
import { Innertube, YT, YTNodes } from 'youtubei.js'

// Keyword pencarian
const SEARCH_QUERY = 'berita politik'

// Maksimal pencarian video, setiap pencarian biasanya menghasilkan 20 video
const MAX_VIDEOS = 20

// Maksimal komentar per video
const MAX_VID_COMMENTS = 1000

// Maksimal komentar keseluruhan
const MAX_COMMENTS = 1000

// Tempat menyimpan dataset relatif dengan path script
const DATASET_PATH = './dataset.csv'

// Waktu rilis video [hour | today | week | month | year | all]
const UPLOAD_DATE = 'hour'

// Urutkan video berdasarkan [upload_date | relevance | view_count]
const SORT_BY = 'view_count'

const dataset = []
const counters = { comments: 0, videos: 0, searches: 0 }
const csv = createObjectCsvWriter({
  path: DATASET_PATH,
  header: [
    { id: 'label', title: 'label' },
    { id: 'author', title: 'author' },
    { id: 'comment', title: 'comment' },
    { id: 'id', title: 'id' },
    { id: 'channel', title: 'channel' },
    { id: 'title', title: 'title' },
  ],
  // append: true,
})

let innertube, search

try {
  console.log('Memulai pencarian untuk:', SEARCH_QUERY)

  innertube = await Innertube.create({ lang: 'id', location: 'ID' })
  search = await innertube.search(SEARCH_QUERY, {
    type: 'video',
    upload_date: UPLOAD_DATE,
    sort_by: SORT_BY
  })

  await scrapeSearch(search)
} catch (error) {
  console.error('Terjadi error melakukan pencarian', error)
} finally {
  console.log('Jumlah dataset komentar:', dataset.length)
  await csv.writeRecords(dataset)
}

/**
 * Fungsi untuk scraping halaman pencarian
 * @param {YT.Search} search
 */
async function scrapeSearch(search) {
  console.log('Halaman pencarian ditemukan total', search.videos.length, 'video\n')

  for (const video of search.videos) {
    if (dataset.length >= MAX_COMMENTS) return console.log('Mencapai maksimal komentar, menghentikan...')
    if (counters.videos >= MAX_VIDEOS) return console.log('Scraping video sudah cukup, menghentikan')

    if (
    video instanceof YTNodes.ShortsLockupView
      || video instanceof YTNodes.PlaylistPanelVideo
      || video instanceof YTNodes.WatchCardCompactVideo
      || video instanceof YTNodes.ReelItem
    ) continue

    const metadata = {
      id: video.id,
      title: video.title.toString(),
      channel: video.author.name,
    }

    console.log(counters.videos+1, metadata.title)

    try {
      const comments = await innertube.getComments(video.id, 'NEWEST_FIRST')
      counters.comments = 0
      await scrapeComments(comments, metadata);
      console.log()
      counters.videos++
    } catch (error) {
      console.error('Terjadi error scraping komentar', error.message)
      continue
    }
  }

  if (dataset.length >= MAX_COMMENTS) return console.log('Mencapai maksimal komentar, menghentikan...')
  if (!search.has_continuation) return console.log('Tidak dapat menemukan video lagi, menghentikan...');

  const continuation = await search.getContinuation()

  await scrapeSearch(continuation)
}

/**
 * Scraping komentar dari video youtube
 * @param {YT.Comments} comments
 * @param {{ id: string, channel: string, title: string }} metadata
 */
async function scrapeComments(comments, metadata) {
  try {
    for (const { comment } of comments.contents) {
      if (counters.comments >= MAX_VID_COMMENTS || dataset.length >= MAX_COMMENTS) {
        counters.comments = 0
        console.log('Komentar video mencapai maksimal, melanjutkan...')
        return
      }

      const author = comment?.author?.name.slice(1)
      const text = comment?.content?.toString()

      if (!author || !text) continue

      dataset.push({ ...metadata, author, comment: text, label: 0 })
      counters.comments++
    }

    if (!comments.has_continuation) return console.log(`Semua ${counters.comments} komentar diambil, melanjutkan...`)

    const continuation = await comments.getContinuation()
    console.log('Mengambil komentar halaman selanjutnya...', `${counters.comments} dari ${MAX_VID_COMMENTS}`)

    await scrapeComments(continuation, metadata)
  } catch (error) {
    console.error('Terjadi error scraping komentar', error.message)
  }
}
