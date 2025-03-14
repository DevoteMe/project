import { test, expect } from "@playwright/test"
import { login } from "./utils/auth-utils"
import { testUsers } from "./fixtures/test-users"

test.describe("Search Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.regularUser.email, testUsers.regularUser.password)
  })

  test("should allow a user to search for other users", async ({ page }) => {
    await page.goto("/search")
    await page.fill('[data-testid="search-input"]', testUsers.creatorUser.username)
    await page.click('[data-testid="search-button"]')

    const searchResult = page.locator(`[data-testid="user-result"]:has-text("${testUsers.creatorUser.username}")`)
    await expect(searchResult).toBeVisible()
  })

  test("should allow a user to search for content", async ({ page }) => {
    const searchTerm = "test content"

    await page.goto("/search")
    await page.fill('[data-testid="search-input"]', searchTerm)
    await page.selectOption('[data-testid="search-type-select"]', "content")
    await page.click('[data-testid="search-button"]')

    const searchResults = page.locator('[data-testid="content-result"]')
    await expect(searchResults).toHaveCount.greaterThan(0)
  })

  test("should show no results message for non-existent search terms", async ({ page }) => {
    const nonExistentTerm = "xyznonexistentterm123456789"

    await page.goto("/search")
    await page.fill('[data-testid="search-input"]', nonExistentTerm)
    await page.click('[data-testid="search-button"]')

    const noResultsMessage = page.locator('[data-testid="no-results-message"]')
    await expect(noResultsMessage).toBeVisible()
  })
})

