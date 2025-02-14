import { resolve } from 'node:path'
import { defineWxtModule } from 'wxt/modules'

export default defineWxtModule((wxt) => {
  const backend = 'tfjs-backend-wasm'
  const tflite = 'tfjs-tflite'

  const files: [string, string][] = [
    // [backend, 'tfjs-backend-wasm.wasm'],
    // [backend, 'tfjs-backend-wasm-simd.wasm'],
    // [backend, 'tfjs-backend-wasm-threaded-simd.wasm'],
    [tflite, 'tflite_web_api_cc.wasm'],
    [tflite, 'tflite_web_api_cc_simd.wasm'],
    [tflite, 'tflite_web_api_cc_simd_threaded.wasm'],
    [tflite, 'tflite_web_api_cc.js'],
    [tflite, 'tflite_web_api_cc_simd.js'],
    [tflite, 'tflite_web_api_cc_simd_threaded.js'],
  ]

  wxt.hook('build:publicAssets', (_, assets) => {
    for (const [pkg, file] of files) {
      assets.push({
        absoluteSrc: resolve(
          `node_modules/@tensorflow/${pkg}/dist/`,
          file
        ),
        relativeDest: file
      })
    }

    // wxt.config.manifest.web_accessible_resources ??= []
    //
    // wxt.config.manifest.web_accessible_resources.push({
    //   matches: [''],
    //   resources: [],
    // })
  });
});
