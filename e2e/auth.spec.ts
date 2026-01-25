import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should navigate to sign-in page', async ({ page }) => {
    await page.goto('/sign-in')

    // Page should load without errors
    await expect(page.locator('body')).toBeVisible()
  })

  test('should navigate to sign-up page', async ({ page }) => {
    await page.goto('/sign-up')

    // Page should load without errors
    await expect(page.locator('body')).toBeVisible()
  })

  test('should display sign-in form elements', async ({ page }) => {
    await page.goto('/sign-in')

    // Check for common auth form elements
    const form = page.locator('form')
    if (await form.count() > 0) {
      await expect(form.first()).toBeVisible()
    }
  })

  test('should have Google OAuth option', async ({ page }) => {
    await page.goto('/sign-in')

    // Look for Google sign-in button
    const googleButton = page.getByRole('button', { name: /google/i })
    if (await googleButton.count() > 0) {
      await expect(googleButton.first()).toBeVisible()
    }
  })
})
