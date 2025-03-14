import { test, expect } from "@playwright/test"
import { testUsers } from "../e2e-tests/fixtures/test-users"

test.describe("Authentication API", () => {
  const apiBaseUrl = process.env.TEST_API_URL || "http://localhost:3000/api"

  test("should return a token when valid credentials are provided", async ({ request }) => {
    const response = await request.post(`${apiBaseUrl}/auth/login`, {
      data: {
        email: testUsers.regularUser.email,
        password: testUsers.regularUser.password,
      },
    })

    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty("token")
    expect(data).toHaveProperty("user")
    expect(data.user).toHaveProperty("username", testUsers.regularUser.username)
  })

  test("should return an error when invalid credentials are provided", async ({ request }) => {
    const response = await request.post(`${apiBaseUrl}/auth/login`, {
      data: {
        email: testUsers.regularUser.email,
        password: "WrongPassword123!",
      },
    })

    expect(response.status()).toBe(401)
    const data = await response.json()
    expect(data).toHaveProperty("error")
  })

  test("should create a new user when valid data is provided", async ({ request }) => {
    const username = `testuser_${Date.now()}`
    const email = `testuser_${Date.now()}@example.com`
    const password = "Password123!"

    const response = await request.post(`${apiBaseUrl}/auth/signup`, {
      data: {
        username,
        email,
        password,
      },
    })

    expect(response.status()).toBe(201)
    const data = await response.json()
    expect(data).toHaveProperty("token")
    expect(data).toHaveProperty("user")
    expect(data.user).toHaveProperty("username", username)
    expect(data.user).toHaveProperty("email", email)
  })
})

