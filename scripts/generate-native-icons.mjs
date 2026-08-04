import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const standardIcon = await readFile(join(projectRoot, 'public', 'icons', 'icon.svg'), 'utf8')
const maskableIcon = await readFile(join(projectRoot, 'public', 'icons', 'icon-maskable.svg'), 'utf8')
const densities = [
  ['mdpi', 48, 108],
  ['hdpi', 72, 162],
  ['xhdpi', 96, 216],
  ['xxhdpi', 144, 324],
  ['xxxhdpi', 192, 432]
]

const browser = await chromium.launch()
const page = await browser.newPage()

async function render(svg, size, outputPath, transparent = false) {
  await page.setViewportSize({ width: size, height: size })
  const source = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
  await page.setContent(`
    <style>
      html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; ${transparent ? '' : 'background: #102c3b;'} }
      img { display: block; width: 100%; height: 100%; }
    </style>
    <img src="${source}" alt="" />
  `)
  await page.locator('img').evaluate((image) => image.decode())
  await page.screenshot({ path: outputPath, omitBackground: transparent })
}

try {
  await render(
    standardIcon,
    1024,
    join(projectRoot, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset', 'AppIcon-512@2x.png')
  )

  for (const [density, legacySize, foregroundSize] of densities) {
    const directory = join(projectRoot, 'android', 'app', 'src', 'main', 'res', `mipmap-${density}`)
    await render(standardIcon, legacySize, join(directory, 'ic_launcher.png'))
    await render(maskableIcon, legacySize, join(directory, 'ic_launcher_round.png'))
    await render(maskableIcon, foregroundSize, join(directory, 'ic_launcher_foreground.png'), true)
  }
} finally {
  await browser.close()
}

console.log('C-Word-kuvakkeet generoitu iOS- ja Android-projekteihin.')
