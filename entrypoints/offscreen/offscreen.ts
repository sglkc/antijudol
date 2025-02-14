import '@tensorflow/tfjs-backend-wasm'
import * as tf from '@tensorflow/tfjs-core'
import * as tflite from '@tensorflow/tfjs-tflite'

let model: tflite.TFLiteModel

async function initModel() {
  await tf.setBackend('wasm')
  await tf.ready()

  const model = await tflite.loadTFLiteModel(chrome.runtime.getURL('/model.tflite'))

  return model
}

initModel().then((loaded) => {
  model = loaded

  // @ts-expect-error
  window.model = model

  // @ts-expect-error
  window.initModel = initModel

  // @ts-expect-error
  window.tf = tf

  // @ts-expect-error
  window.tflite = tflite

  chrome.runtime.sendMessage('model loaded!')
})
