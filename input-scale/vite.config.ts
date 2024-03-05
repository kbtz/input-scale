// @ts-ignore
import { defineConfig } from 'vite'

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
