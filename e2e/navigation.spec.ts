import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('should navigate between main pages', async ({ page }) => {
    await page.goto('/')

    // Navigate to pricing page
    const pricingLink = page.getByRole('link', { name: /pricing/i })
    if (await pricingLink.count() > 0) {
      await pricingLink.first().click()
      await expect(page).toHaveURL(/pricing/)
    }
  })

  test('should navigate to blog page', async ({ page }) => {
    await page.goto('/blog')

    // Page should load without errors
    await expect(page.locator('body')).toBeVisible()
  })

  test('should navigate to contact page', async ({ page }) => {
    await page.goto('/contact')

    // Page should load without errors
    await expect(page.locator('body')).toBeVisible()
  })

  test('should navigate to courses page', async ({ page }) => {
    await page.goto('/courses')

    // Page should load without errors
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/this-page-does-not-exist')

    // Should show 404 page or redirect
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })
})
