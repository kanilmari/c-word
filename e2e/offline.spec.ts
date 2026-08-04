import { expect, test } from '@playwright/test'

test('tuotantoversio käynnistyy sivunpäivityksen jälkeen ilman verkkoa', async ({ context, page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Aamun valo' })).toBeVisible()
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })

  await context.setOffline(true)
  try {
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Aamun valo' })).toBeVisible()
    await expect(page.getByTestId('letter-wheel')).toBeVisible()
  } finally {
    await context.setOffline(false)
  }
})
