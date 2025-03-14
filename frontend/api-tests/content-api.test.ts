import { test, expect } from "@playwright/test"
import { testUsers } from "../e2e-tests/fixtures/test-users"
import { testPosts } from "../e2e-tests/fixtures/test-content"

test.describe("Content API", () => {
  const apiBaseUrl = process.env.TEST_API_URL || "http://localhost:3000/api"
  let authToken: string
  let createdPostId: string

  test.beforeAll(async ({ request }) => {
    // Login to get auth token
    const response = await request.post(`${apiBaseUrl}/auth/login`, {
      data: {
        email: testUsers.regularUser.email,
        password: testUsers.regularUser.password,
      },
    })

    const data = await response.json()
    authToken = data.token
  })

  test("should create a new post", async ({ request }) => {
    const response = await request.post(`${apiBaseUrl}/posts`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        content: testPosts[0].content,
      },
    })

    expect(response.status()).toBe(201)
    const data = await response.json()
    expect(data).toHaveProperty("id")
    expect(data).toHaveProperty("content", testPosts[0].content)
    expect(data).toHaveProperty("author")
    expect(data.author).toHaveProperty("username", testUsers.regularUser.username)

    createdPostId = data.id
  })

  test("should retrieve a post by ID", async ({ request }) => {
    const response = await request.get(`${apiBaseUrl}/posts/${createdPostId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty("id", createdPostId)
    expect(data).toHaveProperty("content", testPosts[0].content)
  })

  test("should like a post", async ({ request }) => {
    const response = await request.post(`${apiBaseUrl}/posts/${createdPostId}/like`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data).toHaveProperty("likes")
    expect(data.likes).toBeGreaterThan(0)
  })

  test("should add a comment to a post", async ({ request }) => {
    const comment = testPosts[0].content

    const response = await request.post(`${apiBaseUrl}/posts/${createdPostId}/comments`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        content: comment,
      },
    })

    expect(response.status()).toBe(201)
    const data = await response.json()
    expect(data).toHaveProperty("id")
    expect(data).toHaveProperty("content", comment)
    expect(data).toHaveProperty("author")
    expect(data.author).toHaveProperty("username", testUsers.regularUser.username)
  })

  test("should delete a post", async ({ request }) => {
    const response = await request.delete(`${apiBaseUrl}/posts/${createdPostId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    expect(response.status()).toBe(200)

    // Verify the post is deleted
    const getResponse = await request.get(`${apiBaseUrl}/posts/${createdPostId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    expect(getResponse.status()).toBe(404)
  })
})

