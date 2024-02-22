// @ts-ignore
import { defineConfig } from 'vite'

console.log(import.meta['DEV'] ? 'YY' : 'NN')
export default defineConfig(({ command }) => {
  return {
    resolve: {
      alias: {
        'input-scale': command == 'serve'
          ? './input-scale' 
          : 'input-scale'
      }
    }
  }
})
