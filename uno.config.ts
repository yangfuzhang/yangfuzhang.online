import { defineConfig, presetUno } from 'unocss'
import presetIcons from '@unocss/preset-icons'

export default defineConfig({
  presets: [
    presetIcons({
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
        width: '1.2em',
        height: '1.2em'
      }
    }),
    presetUno(),
  ],
})