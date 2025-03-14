import type { Page } from "@playwright/test"
import path from "path"

export async function createPost(page: Page, content: string, imageFile?: string) {
  await page.goto("/create")
  await page.fill('[data-testid="post-content"]', content)

  if (imageFile) {
    const filePath = path.join(__dirname, "../fixtures", imageFile)
    await page.setInputFiles('[data-testid="image-upload"]', filePath)
    await page.waitForSelector('[data-testid="image-preview"]')
  }

  await page.click('[data-testid="publish-button"]')
  await page.waitForSelector('[data-testid="post-published-success"]')
}

export async function likePost(page: Page, postId: string) {
  await page.click(`[data-testid="like-button-${postId}"]`)
  await page.waitForSelector(`[data-testid="like-button-${postId}"][data-liked="true"]`)
}

export async function commentOnPost(page: Page, postId: string, comment: string) {
  await page.click(`[data-testid="comment-button-${postId}"]`)
  await page.fill('[data-testid="comment-input"]', comment)
  await page.click('[data-testid="submit-comment-button"]')
  await page.waitForSelector(`[data-testid="comment-content"]:has-text("${comment}")`)
}

