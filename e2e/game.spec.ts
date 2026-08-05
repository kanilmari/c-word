import { expect, test } from '@playwright/test'

test('kirjainkehä muodostaa sanan ja peruuttaa edelliseen kirjaimeen vedettäessä', async ({ page }) => {
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

  const haloPoint = async (letter: string) => {
    const hitBox = await wheel.locator(`.letter-node[data-letter="${letter}"]`).boundingBox()
    if (!hitBox) throw new Error(`Kirjaimen ${letter} osuma-aluetta ei saatu.`)
    return {
      x: hitBox.x + hitBox.width / 2,
      y: hitBox.y - 6
    }
  }

  const inactiveStart = await haloPoint('M')
  await page.mouse.move(inactiveStart.x, inactiveStart.y)
  await page.mouse.down()
  await page.mouse.up()
  await expect(page.locator('.guess-display__word')).toHaveText('Muodosta sana')

  const start = point(4)
  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  for (const index of [5, 6, 0]) {
    const next = point(index)
    await page.mouse.move(next.x, next.y, { steps: 4 })
  }
  await expect(page.getByText('MATS', { exact: true })).toBeVisible()
  await expect(page.locator('[data-draft-match]')).toHaveCount(0)

  const inactivePrevious = await haloPoint('T')
  await page.mouse.move(inactivePrevious.x, inactivePrevious.y, { steps: 4 })
  await expect(page.getByText('MATS', { exact: true })).toBeVisible()

  const previous = point(6)
  await page.mouse.move(previous.x, previous.y, { steps: 4 })
  await expect(page.getByText('MAT', { exact: true })).toBeVisible()
  await expect(page.locator('[data-draft-match]')).toHaveCount(0)

  const last = point(3)
  await page.mouse.move(last.x, last.y, { steps: 4 })
  await expect(page.locator('[data-draft-match]')).toHaveCount(0)
  await page.mouse.up()

  await expect(page.getByRole('grid', { name: 'Sanaristikko, 1 / 14 sanaa ratkaistu' })).toBeVisible()
  await expect(page.getByText('Oikein!')).toBeVisible()

  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  for (const index of [5, 6]) {
    const next = point(index)
    await page.mouse.move(next.x, next.y, { steps: 4 })
  }
  await expect(page.getByText('MAT', { exact: true })).toBeVisible()
  await expect(page.locator('[data-draft-match="prefix"]')).toHaveCount(3)
  await page.mouse.up()
})

test('ristikon luonnoskorostus katkeaa ensimmäiseen piilokirjaimeen', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Seuraava kenttä' }).click()
  await page.getByRole('button', { name: 'Seuraava kenttä' }).click()
  await expect(page.getByRole('heading', { name: 'Tyyni ilta' })).toBeVisible()

  await page.getByRole('button', { name: 'Avaa asetukset' }).click()
  await page.getByRole('button', { name: 'Näppäimistö' }).click()
  await page.getByRole('button', { name: 'Sulje asetukset' }).click()

  const positions = new Map([['P', 0], ['E', 1], ['L', 2], ['A', 3], ['S', 4], ['I', 5], ['T', 6]])
  const enter = async (word: string, submit = true) => {
    for (const letter of word) await page.getByTestId(`key-${letter}-${positions.get(letter)}`).click()
    if (submit) await page.getByRole('button', { name: 'Hyväksy' }).click()
  }

  for (const word of ['LISTA', 'PILA', 'LASITE', 'LAPSI']) await enter(word)
  await enter('SAPELI', false)

  await expect(page.getByText('SAPELI', { exact: true })).toBeVisible()
  await expect(page.locator('[data-draft-match]')).toHaveCount(0)
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

  await page.getByRole('button', { name: 'Näytä löydetyt bonussanat (1)' }).click()
  await expect(page.getByRole('region', { name: 'Löydetyt bonussanat' }).getByText('MONTA', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Sulje löydetyt bonussanat' }).click()

  await choose('M', 4)
  await choose('O', 3)
  await choose('N', 2)
  await expect(page.getByRole('button', { name: 'Löydetty bonus-sana alkaa MON: MONTA' })).toBeVisible()
  const matchedBonus = page.getByLabel('Löydetty bonus-sana MONTA, valittu alku MON')
  await expect(matchedBonus.locator('b')).toHaveText('MON')
  await expect(matchedBonus.locator('i')).toHaveText('TA')
  await choose('T', 6)
  await choose('A', 1)
  await expect(page.getByRole('button', { name: 'Jo löydetty bonus-sana MONTA' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('grid', { name: 'Sanaristikko, 1 / 14 sanaa ratkaistu' })).toBeVisible()
  await expect(page.getByLabel('Bonuspisteet 47 / 100')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Näytä löydetyt bonussanat (1)' })).toBeVisible()
  await expect(page.getByTestId('limited-keyboard')).toBeVisible()
})

test('valmis ristikon alkukirjain loistaa kontrastikkaasti molemmissa syöttötavoissa', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Avaa asetukset' }).click()
  await page.getByRole('button', { name: 'Näppäimistö' }).click()
  await page.getByRole('button', { name: 'Vaalea' }).click()
  await page.getByRole('button', { name: 'Sulje asetukset' }).click()

  for (const [letter, occurrence] of [['N', 2], ['O', 3], ['S', 0], ['T', 6], ['A', 1], ['A', 5]] as const) {
    await page.getByTestId(`key-${letter}-${occurrence}`).click()
  }
  await page.getByRole('button', { name: 'Hyväksy' }).click()

  const keyboardN = page.getByTestId('key-N-2')
  await expect(keyboardN).toHaveAttribute('data-crossword-initial-complete', 'true')
  await expect(keyboardN).toHaveAttribute('aria-label', 'Lisää kirjain N, kaikki tällä kirjaimella alkavat ristikkosanat ratkaistu')
  await expect(keyboardN).toHaveCSS('background-color', 'rgb(185, 241, 210)')
  await expect(keyboardN).toHaveCSS('color', 'rgb(16, 59, 44)')

  await page.getByRole('button', { name: 'Avaa asetukset' }).click()
  await page.getByRole('button', { name: 'Tumma' }).click()
  await page.getByRole('button', { name: 'Kirjainkehä' }).click()
  await page.getByRole('button', { name: 'Sulje asetukset' }).click()

  const wheelN = page.locator('.letter-node[data-letter="N"]')
  await expect(wheelN).toHaveAttribute('data-crossword-initial-complete', 'true')
  await expect.poll(() => wheelN.evaluate((element) => getComputedStyle(element, '::before').backgroundColor)).toBe('rgb(21, 88, 68)')
  await expect(wheelN).toHaveCSS('color', 'rgb(244, 255, 249)')
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
