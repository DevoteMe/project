import { test, expect } from "@playwright/test"
import { login } from "./utils/auth-utils"
import { createPost, likePost, commentOnPost } from "./utils/content-utils"
import { testUsers } from "./fixtures/test-users"

test.describe("Content Creation and Interaction", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.regularUser.email, testUsers.regularUser.password)
  })

  test("should allow a user to create a post", async ({ page }) => {
    const content = `Test post ${Date.now()}`
    await createPost(page, content)

    // Navigate to profile to see the post
    await page.goto(`/profile/${testUsers.regularUser.username}`)
    const postContent = page.locator(`[data-testid="post-content"]:has-text("${content}")`)
    await expect(postContent).toBeVisible()
  })

  test("should allow a user to create a post with an image", async ({ page }) => {
    const content = `Test post with image ${Date.now()}`
    await createPost(page, content, "test-image-1.jpg")

    // Navigate to profile to see the post
    await page.goto(`/profile/${testUsers.regularUser.username}`)
    const postContent = page.locator(`[data-testid="post-content"]:has-text("${content}")`)
    await expect(postContent).toBeVisible()

    const postImage = page.locator('[data-testid="post-image"]')
    await expect(postImage).toBeVisible()
  })

  test("should allow a user to like a post", async ({ page }) => {
    // First create a post
    const content = `Test post for liking ${Date.now()}`
    await createPost(page, content)

    // Navigate to profile to find the post
    await page.goto(`/profile/${testUsers.regularUser.username}`)

    // Find the post and extract its ID
    const postElement = page.locator(`[data-testid="post-item"]:has-text("${content}")`)
    const postId = await postElement.getAttribute("data-post-id")

    // Like the post
    await likePost(page, postId!)

    // Check if like count increased
    const likeCount = page.locator(`[data-testid="like-count-${postId}"]`)
    await expect(likeCount).toHaveText("1")
  })

  test("should allow a user to comment on a post", async ({ page }) => {
    // First create a post
    const content = `Test post for commenting ${Date.now()}`
    await createPost(page, content)

    // Navigate to profile to find the post
    await page.goto(`/profile/${testUsers.regularUser.username}`)

    // Find the post and extract its ID
    const postElement = page.locator(`[data-testid="post-item"]:has-text("${content}")`)
    const postId = await postElement.getAttribute("data-post-id")

    // Comment on the post
    const comment = `Test comment ${Date.now()}`
    await commentOnPost(page, postId!, comment)

    // Check if comment is visible
    const commentElement = page.locator(`[data-testid="comment-content"]:has-text("${comment}")`)
    await expect(commentElement).toBeVisible()
  })
})

