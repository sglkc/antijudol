import * as tf from '@tensorflow/tfjs'

const MODEL = import.meta.env.MODEL ?? 'balanced'

let model: tf.LayersModel
let vocab: Record<string, number>

async function initModel() {
  // await tf.setBackend('cpu')
  await tf.ready()

  model = await tf.loadLayersModel(chrome.runtime.getURL(`/${MODEL}/model.json`))
  vocab = await (await fetch(chrome.runtime.getURL(`/${MODEL}/vocab.json`))).json()
}

function tokenize(text: string, maxLen = 100) {
  // Convert text to lowercase and split into words
  const sequence = text.toLowerCase().split(/\s+/).map(word => vocab[word] || 0);
  const padded = new Array(maxLen).fill(0)
  const start = Math.max(0, maxLen - sequence.length)

  for (let i = 0; i < Math.min(sequence.length, maxLen); i++) {
    padded[start + i] = sequence[i];
  }

  return tf.tensor2d([padded], [1, maxLen]); // Convert to Tensor
}

initModel().then(() => {
  // @ts-expect-error
  window.tf = tf

  // @ts-expect-error
  window.model = model

  // @ts-expect-error
  window.vocab = vocab

  // @ts-expect-error
  window.tokenize = tokenize

  chrome.runtime.sendMessage('model loaded!')

  chrome.runtime.onMessage.addListener((msg, _, res) => {
    console.log('OFFSCREEN MESSAGE', msg)

    const prediction = model.predict(tokenize(msg))

    // @ts-expect-error
    res(prediction.dataSync()[0])
  })
})
