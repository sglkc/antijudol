import * as tf from '@tensorflow/tfjs'

let model: tf.LayersModel
let vocab: Record<string, number>

async function initModel() {
  // await tf.setBackend('cpu')
  await tf.ready()

  model = await tf.loadLayersModel(chrome.runtime.getURL('/tf/model.json'))
  vocab = await (await fetch(chrome.runtime.getURL('/tf/vocab.json'))).json()
}

function tokenize(text: string, maxLen = 100) {
    // Convert text to lowercase and split into words
    let sequence = text.toLowerCase().split(/\s+/).map(word => vocab[word] || 0);

    // Pad or truncate sequence
    if (sequence.length < maxLen) {
        sequence = [...sequence, ...Array(maxLen - sequence.length).fill(0)];
    } else {
        sequence = sequence.slice(0, maxLen);
    }

    return tf.tensor2d([sequence], [1, maxLen]); // Convert to Tensor
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
