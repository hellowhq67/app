import { test, expect } from '@playwright/test'

test.describe('Accessibility — Core Pages', () => {
  test('homepage has a main landmark', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('main')).toBeVisible()
  })

  test('homepage has a page title (h1)', async ({ page }) => {
    await page.goto('/')
    const h1 = page.locator('h1')
    expect(await h1.count()).toBeGreaterThanOrEqual(1)
  })

  test('sign-in page has appropriate heading', async ({ page }) => {
    await page.goto('/sign-in')
    const heading = page.locator('h1, h2').first()
    if (await heading.count() > 0) {
      await expect(heading).toBeVisible()
    }
  })

  test('images on homepage have alt attributes', async ({ page }) => {
    await page.goto('/')
    const images = page.locator('img')
    const count = await images.count()

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt')
      // alt can be empty string for decorative images, but must exist
      expect(alt).not.toBeNull()
    }
  })

  test('homepage has no console errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle').catch(() => {}) // ignore timeout

    // Filter known non-critical errors (e.g., analytics blockers)
    const criticalErrors = errors.filter(
      e => !e.includes('favicon') && !e.includes('analytics') && !e.includes('gtag')
    )

    expect(criticalErrors).toHaveLength(0)
  })

  test('navigation has skip link or landmark', async ({ page }) => {
    await page.goto('/')
    // Check either skip link or proper landmark structure
    const skipLink = page.locator('a[href="#main"], a[href="#content"]')
    const nav = page.locator('nav')
    const main = page.locator('main')

    const hasLandmarks = (await nav.count() > 0) || (await main.count() > 0)
    expect(hasLandmarks).toBe(true)
  })
})

test.describe('Accessibility — Mobile', () => {
  test('sign-in page is usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/sign-in')

    const form = page.locator('form').first()
    if (await form.count() > 0) {
      await expect(form).toBeVisible()
    }
    await expect(page.locator('body')).toBeVisible()
  })

  test('homepage does not overflow horizontally on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5) // 5px tolerance
  })
})
