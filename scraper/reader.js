// @ts-check
/**
 * File ini digunakan untuk menghitung jumlah komentar dan label judol
 */
import csv from 'csv-parser'
import fs from 'node:fs'

const FILES = ['dataset-final.csv']

for (const file of FILES) {
  const results = []

  await new Promise((resolve) => {
    fs.createReadStream(file)
      .pipe(csv())
      .on('data', (comment) => results.push(comment))
      .on('end', () => {
        const video = new Set(results.map(k => k.title))
        const komentar = results.map(k => k.comment)
        const judol = results.filter(k => k.label == '1').map(k => k.comment)

        console.log(file)
        console.log(video)
        console.log('Jumlah komentar:', komentar.length)
        console.log('Jumlah komentar unik:', new Set(komentar).size)
        console.log('Jumlah komentar judol:', judol.length)
        console.log('Jumlah komentar judol unik:', new Set(judol).size)
        console.log()
        resolve(1)
      })
  })
}
