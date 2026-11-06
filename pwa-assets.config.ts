import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Le icone "maskable" e Apple di default hanno un bordo bianco:
// le facciamo blu notte e senza margine, perché la nostra icona ha già il suo spazio.
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: {
      ...minimal2023Preset.maskable,
      padding: 0,
      resizeOptions: { background: '#070912' },
    },
    apple: {
      ...minimal2023Preset.apple,
      padding: 0,
      resizeOptions: { background: '#070912' },
    },
  },
  images: ['public/icona.png'],
})