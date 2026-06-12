import { test, expect } from '@playwright/test'

test.describe('Settings pages', () => {
  test('navigates to settings general page', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Settings').first().click()
    await expect(page.getByText(/System Settings|General/i)).toBeVisible()
  })

  test('navigates to theme settings', async ({ page }) => {
    await page.goto('/settings/theme')
    await expect(page.getByText(/Theme|Appearance/i)).toBeVisible()
  })

  test('navigates to models settings', async ({ page }) => {
    await page.goto('/settings/models')
    await expect(page.getByText(/Model|Provider/i)).toBeVisible()
  })

  test('navigates to billing settings', async ({ page }) => {
    await page.goto('/settings/billing')
    await expect(page.getByText(/Billing|Usage/i)).toBeVisible()
  })

  test('navigates to advanced settings', async ({ page }) => {
    await page.goto('/settings/advanced')
    await expect(page.getByText(/Advanced|Configuration/i)).toBeVisible()
  })

  test('settings sub-navigation is visible', async ({ page }) => {
    await page.goto('/settings/general')
    const subLinks = page.locator('aside a[href*="/settings/"]')
    const count = await subLinks.count()
    expect(count).toBeGreaterThanOrEqual(4)
  })
})
