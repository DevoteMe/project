import type { Page } from "@playwright/test"

export async function subscribeToCreator(page: Page, creatorUsername: string) {
  await page.goto(`/creator/${creatorUsername}`)
  await page.click('[data-testid="subscribe-button"]')

  // Fill payment details
  await page.fill('[data-testid="card-number"]', "4242424242424242")
  await page.fill('[data-testid="card-expiry"]', "12/30")
  await page.fill('[data-testid="card-cvc"]', "123")
  await page.fill('[data-testid="billing-name"]', "Test User")

  await page.click('[data-testid="confirm-payment-button"]')
  await page.waitForSelector('[data-testid="subscription-success"]')
}

export async function purchasePremiumSpot(page: Page, spotId: string) {
  await page.goto(`/spots/${spotId}`)
  await page.click('[data-testid="purchase-spot-button"]')

  // Fill payment details
  await page.fill('[data-testid="card-number"]', "4242424242424242")
  await page.fill('[data-testid="card-expiry"]', "12/30")
  await page.fill('[data-testid="card-cvc"]', "123")

  await page.click('[data-testid="confirm-purchase-button"]')
  await page.waitForSelector('[data-testid="purchase-success"]')
}

