import { defineConfig, presetUno } from 'unocss'
import presetIcons from '@unocss/preset-icons'

export default defineConfig({
  presets: [
    presetIcons({
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
        width: '1.4em',
        height: '1.4em'
      }
    }),
    presetUno(),
  ],
})