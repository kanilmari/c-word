import { expect, test } from '@playwright/test'

test('kirjainkehä muodostaa sanan Pointer Events -vedolla', async ({ page }) => {
  await page.goto('/')
  const wheel = page.getByTestId('letter-wheel')
  await expect(wheel).toBeVisible()
  const box = await wheel.boundingBox()
  if (!box) throw new Error('Kirjainkehän mittoja ei saatu.')

  const point = (index: number) => {
    const angle = (Math.PI * 2 * index) / 7 - Math.PI / 2
    return {
      x: box.x + box.width * (0.5 + Math.cos(angle) * 0.36),
      y: box.y + box.height * (0.5 + Math.sin(angle) * 0.36)
    }
  }

  const start = point(4)
  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  for (const index of [5, 6, 3]) {
    const next = point(index)
    await page.mouse.move(next.x, next.y, { steps: 4 })
  }
  await page.mouse.up()

  await expect(page.getByRole('grid', { name: 'Sanaristikko, 1 / 14 sanaa ratkaistu' })).toBeVisible()
  await expect(page.getByText('Oikein!')).toBeVisible()
})

test('ratkaistu sana, bonus-sana ja edistyminen säilyvät päivityksessä', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Aamun valo' })).toBeVisible()

  await page.getByRole('button', { name: 'Avaa asetukset' }).click()
  await page.getByRole('button', { name: 'Näppäimistö' }).click()
  await page.getByRole('button', { name: 'Sulje asetukset' }).click()

  const choose = async (letter: string, occurrence: number) => {
    await page.getByTestId(`key-${letter}-${occurrence}`).click()
  }

  await choose('M', 4)
  await choose('A', 1)
  await choose('T', 6)
  await choose('O', 3)
  await page.getByRole('button', { name: 'Hyväksy' }).click()

  await expect(page.getByRole('grid', { name: 'Sanaristikko, 1 / 14 sanaa ratkaistu' })).toBeVisible()
  await expect(page.getByText('Oikein!')).toBeVisible()

  await choose('M', 4)
  await choose('O', 3)
  await choose('N', 2)
  await choose('T', 6)
  await choose('A', 1)
  await page.getByRole('button', { name: 'Hyväksy' }).click()

  await expect(page.getByText('Bonus-sana +1')).toBeVisible()
  await expect(page.getByLabel('Bonuspisteet 47 / 100')).toBeVisible()

  await page.reload()
  await expect(page.getByRole('grid', { name: 'Sanaristikko, 1 / 14 sanaa ratkaistu' })).toBeVisible()
  await expect(page.getByLabel('Bonuspisteet 47 / 100')).toBeVisible()
  await expect(page.getByTestId('limited-keyboard')).toBeVisible()
})

test('ylläpitäjätila on oletuksena aktiivinen ja sallii vapaan kenttäliikkumisen sekä vihjeen', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('YLLÄPITÄJÄ')).toBeVisible()
  await page.getByRole('button', { name: 'Seuraava kenttä' }).click()
  await expect(page.getByRole('heading', { name: 'Kirkas polku' })).toBeVisible()
  await page.getByRole('button', { name: 'Edellinen kenttä' }).click()
  await expect(page.getByRole('heading', { name: 'Aamun valo' })).toBeVisible()

  await page.getByRole('button', { name: 'Paljasta kirjain maksutta ylläpitäjätilassa' }).click()
  await expect(page.getByText('Vihje avattu')).toBeVisible()
  await expect(page.getByLabel('Bonuspisteet 46 / 100')).toBeVisible()
})
