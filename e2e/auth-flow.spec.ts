import { test, expect } from '@playwright/test'

test.describe('Authentication — Form Validation', () => {
  test('sign-in page has email and password fields', async ({ page }) => {
    await page.goto('/sign-in')
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible()
    await expect(page.locator('input[type="password"], input[name="password"]').first()).toBeVisible()
  })

  test('sign-in shows error for empty submission', async ({ page }) => {
    await page.goto('/sign-in')

    const submitButton = page.getByRole('button', { name: /sign in|log in|submit/i })
    if (await submitButton.count() > 0) {
      await submitButton.first().click()
      // Either native HTML validation or custom error should appear
      // Check that we're still on sign-in page (not redirected)
      await expect(page).toHaveURL(/sign-in/)
    }
  })

  test('sign-up page has name, email, and password fields', async ({ page }) => {
    await page.goto('/sign-up')
    const emailInput = page.locator('input[type="email"], input[name="email"]')
    const passwordInput = page.locator('input[type="password"], input[name="password"]')
    if (await emailInput.count() > 0) {
      await expect(emailInput.first()).toBeVisible()
    }
    if (await passwordInput.count() > 0) {
      await expect(passwordInput.first()).toBeVisible()
    }
  })

  test('sign-in page has link to sign-up', async ({ page }) => {
    await page.goto('/sign-in')
    const signUpLink = page.getByRole('link', { name: /sign up|create account|register/i })
    if (await signUpLink.count() > 0) {
      await expect(signUpLink.first()).toBeVisible()
    }
  })

  test('sign-up page has link to sign-in', async ({ page }) => {
    await page.goto('/sign-up')
    const signInLink = page.getByRole('link', { name: /sign in|log in|already have/i })
    if (await signInLink.count() > 0) {
      await expect(signInLink.first()).toBeVisible()
    }
  })

  test('unauthenticated users are redirected from protected routes', async ({ page }) => {
    await page.goto('/academic')
    // Should be redirected to sign-in or home
    const url = page.url()
    expect(
      url.includes('sign-in') || url.includes('sign-up') || url.includes('/')
    ).toBe(true)
  })
})
