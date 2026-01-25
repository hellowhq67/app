import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/')

    // Check that the page loads
    await expect(page).toHaveTitle(/PTE|Pedagogists/i)
  })

  test('should display navigation elements', async ({ page }) => {
    await page.goto('/')

    // Check for main navigation
    const nav = page.locator('nav').first()
    await expect(nav).toBeVisible()
  })

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/')

    // Check for sign in link
    const signInLink = page.getByRole('link', { name: /sign in|login/i })
    if (await signInLink.count() > 0) {
      await expect(signInLink.first()).toBeVisible()
    }
  })

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Page should still load correctly
    await expect(page.locator('body')).toBeVisible()
  })
})
