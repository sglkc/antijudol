// @ts-check
/**
 * File ini digunakan untuk menggabungkan dataset asli dengan dataset yang
 * diklasifikasi secara manual
 */
import csv from 'csv-parser'
import { createObjectCsvWriter } from 'csv-writer'
import fs from 'node:fs'

const ORIGINAL = ['berita.csv', 'dedi.csv']
const MODIFIED = ['dedi-judol.csv']
const SAVED = 'dataset-final.csv'

const dataset = []
const judol = new Set()

for (const file of ORIGINAL) {
  console.log('baca semua komentar dari', file)
  await new Promise((resolve) => {
    fs.createReadStream(file)
      .pipe(csv())
      .on('data', (data) => dataset.push(data))
      .on('end', resolve);
  })
}

for (const file of MODIFIED) {
  console.log('baca semua komentar dari', file)
  await new Promise((resolve) => {
    fs.createReadStream(file)
      .pipe(csv())
      .on('data', (data) => judol.add(data.comment))
      .on('end', resolve);
  })
}

console.log('update label berdasarkan keberadaan komentar di set judol')
const results = dataset.map((data) => {
  if (judol.has(data.comment)) {
    data.label = '1'
  }

  return data
})

console.log('menyimpan hasil ke', SAVED)
const writer = createObjectCsvWriter({
  path: SAVED,
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

writer.writeRecords(results)
