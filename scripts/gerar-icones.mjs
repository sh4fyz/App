// Gera os PNGs do ícone a partir de public/icone.svg (usa o Playwright instalado na máquina).
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
const { chromium } = createRequire(import.meta.url)('playwright')

const svg = readFileSync('public/icone.svg', 'utf8')
const cheio = svg.replace('rx="112"', 'rx="0"')
const navegador = await chromium.launch()
const pagina = await navegador.newPage()

async function foto(tam, arquivo, conteudo, transparente) {
  await pagina.setViewportSize({ width: tam, height: tam })
  await pagina.setContent(`<body style="margin:0"><div style="width:${tam}px;height:${tam}px">${conteudo}</div><style>svg{width:100%;height:100%;display:block}</style></body>`)
  await pagina.screenshot({ path: `public/${arquivo}`, omitBackground: transparente })
}

await foto(192, 'icone-192.png', svg, true)
await foto(512, 'icone-512.png', svg, true)
await foto(180, 'apple-touch-icon.png', cheio, false)
// maskable: fundo cheio e o M dentro da área segura (80%)
await foto(512, 'icone-maskable-512.png', `<div style="width:100%;height:100%;background:#6D28D9;display:grid;place-items:center"><div style="width:80%;height:80%">${cheio}</div></div>`, false)
await navegador.close()
