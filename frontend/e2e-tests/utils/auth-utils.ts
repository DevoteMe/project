import type { Page } from "@playwright/test"

export async function login(page: Page, email: string, password: string) {
  await page.goto("/login")
  await page.fill('[data-testid="email-input"]', email)
  await page.fill('[data-testid="password-input"]', password)
  await page.click('[data-testid="login-button"]')
  await page.waitForURL("**/feed")
}

export async function signup(page: Page, username: string, email: string, password: string) {
  await page.goto("/signup")
  await page.fill('[data-testid="username-input"]', username)
  await page.fill('[data-testid="email-input"]', email)
  await page.fill('[data-testid="password-input"]', password)
  await page.fill('[data-testid="confirm-password-input"]', password)
  await page.click('[data-testid="signup-button"]')
  await page.waitForURL("**/onboarding")
}

export async function logout(page: Page) {
  await page.click('[data-testid="user-menu-button"]')
  await page.click('[data-testid="logout-button"]')
  await page.waitForURL("**/login")
}

