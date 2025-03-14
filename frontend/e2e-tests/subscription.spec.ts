import { test, expect } from "@playwright/test"
import { login } from "./utils/auth-utils"
import { subscribeToCreator, purchasePremiumSpot } from "./utils/subscription-utils"
import { testUsers } from "./fixtures/test-users"

test.describe("Subscription and Purchase Flows", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.regularUser.email, testUsers.regularUser.password)
  })

  test("should allow a user to subscribe to a creator", async ({ page }) => {
    await subscribeToCreator(page, testUsers.creatorUser.username)

    // Check if subscription badge is visible
    const subscriptionBadge = page.locator('[data-testid="subscription-badge"]')
    await expect(subscriptionBadge).toBeVisible()

    // Check if premium content is accessible
    await page.goto(`/creator/${testUsers.creatorUser.username}/premium`)
    const premiumContent = page.locator('[data-testid="premium-content"]')
    await expect(premiumContent).toBeVisible()
  })

  test("should allow a user to purchase a premium spot", async ({ page }) => {
    // Navigate to spots page
    await page.goto("/spots")

    // Find a premium spot and extract its ID
    const spotElement = page.locator('[data-testid="premium-spot-item"]').first()
    const spotId = await spotElement.getAttribute("data-spot-id")

    // Purchase the spot
    await purchasePremiumSpot(page, spotId!)

    // Check if spot is now owned by the user
    await page.goto("/profile/spots")
    const ownedSpot = page.locator(`[data-testid="owned-spot-${spotId}"]`)
    await expect(ownedSpot).toBeVisible()
  })
})

