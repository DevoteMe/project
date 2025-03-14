import { test, expect } from "@playwright/test"
import { login, signup, logout } from "./utils/auth-utils"
import { testUsers } from "./fixtures/test-users"

test.describe("Authentication Flow", () => {
  test("should allow a user to sign up", async ({ page }) => {
    const username = `testuser_${Date.now()}`
    const email = `testuser_${Date.now()}@example.com`
    const password = "Password123!"

    await signup(page, username, email, password)

    // Check if we're redirected to onboarding
    expect(page.url()).toContain("/onboarding")
  })

  test("should allow a user to log in", async ({ page }) => {
    await login(page, testUsers.regularUser.email, testUsers.regularUser.password)

    // Check if we're redirected to feed
    expect(page.url()).toContain("/feed")

    // Check if user menu shows the correct username
    await page.click('[data-testid="user-menu-button"]')
    const usernameElement = page.locator('[data-testid="user-menu-username"]')
    await expect(usernameElement).toHaveText(testUsers.regularUser.username)
  })

  test("should allow a user to log out", async ({ page }) => {
    await login(page, testUsers.regularUser.email, testUsers.regularUser.password)
    await logout(page)

    // Check if we're redirected to login
    expect(page.url()).toContain("/login")
  })

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login")
    await page.fill('[data-testid="email-input"]', testUsers.regularUser.email)
    await page.fill('[data-testid="password-input"]', "WrongPassword123!")
    await page.click('[data-testid="login-button"]')

    const errorMessage = page.locator('[data-testid="login-error"]')
    await expect(errorMessage).toBeVisible()
    await expect(errorMessage).toContainText("Invalid email or password")
  })
})

