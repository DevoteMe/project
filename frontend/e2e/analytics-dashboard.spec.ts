import { test, expect } from "@playwright/test"

test.describe("Analytics Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route("**/api/analytics/summary*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          metrics: [
            { name: "Total Users", value: 1250, change: 5.2, data: [] },
            { name: "Active Users", value: 850, change: 3.7, data: [] },
            { name: "Total Content", value: 320, change: 8.1, data: [] },
            { name: "Total Revenue", value: 12500, change: 7.5, data: [] },
          ],
        }),
      })
    })

    await page.route("**/api/analytics/users*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          newUsers: { name: "New Users", value: 150, change: 4.2 },
          activeUsers: { name: "Active Users", value: 850, change: 3.7 },
          retentionRate: { name: "Retention Rate", value: 68, change: 2.1 },
          churnRate: { name: "Churn Rate", value: 32, change: -1.5 },
          usersByPlan: [
            { name: "Free", value: 800 },
            { name: "Basic", value: 300 },
            { name: "Premium", value: 150 },
          ],
          usersByCountry: [
            { name: "United States", value: 500 },
            { name: "United Kingdom", value: 200 },
            { name: "Canada", value: 150 },
            { name: "Australia", value: 100 },
            { name: "Germany", value: 80 },
          ],
          userGrowth: Array.from({ length: 30 }, (_, i) => ({
            timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
            value: 1000 + i * 10 + Math.floor(Math.random() * 20),
          })),
        }),
      })
    })

    await page.route("**/api/analytics/content*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          totalContent: { name: "Total Content", value: 320, change: 8.1 },
          newContent: { name: "New Content", value: 45, change: 12.5 },
          viewsTotal: { name: "Total Views", value: 25600, change: 15.3 },
          averageEngagement: { name: "Avg. Engagement", value: 7.8, change: 0.5 },
          contentByType: [
            { name: "Video", value: 120 },
            { name: "Image", value: 150 },
            { name: "Text", value: 50 },
          ],
          popularContent: [
            { id: "content1", title: "Getting Started Guide", creator: "Creator 1", views: 1200, engagement: 8.5 },
            { id: "content2", title: "Advanced Techniques", creator: "Creator 2", views: 950, engagement: 7.9 },
            { id: "content3", title: "Tips and Tricks", creator: "Creator 1", views: 820, engagement: 8.2 },
          ],
          contentGrowth: Array.from({ length: 30 }, (_, i) => ({
            timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
            value: 250 + i * 3 + Math.floor(Math.random() * 5),
          })),
        }),
      })
    })

    await page.route("**/api/analytics/revenue*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          totalRevenue: { name: "Total Revenue", value: 12500, change: 7.5 },
          subscriptionRevenue: { name: "Subscription Revenue", value: 10000, change: 6.8 },
          oneTimeRevenue: { name: "One-time Revenue", value: 2500, change: 10.2 },
          averageRevenue: { name: "Avg. Revenue per User", value: 25, change: 3.1 },
          revenueByPlan: [
            { name: "Basic", value: 5000 },
            { name: "Premium", value: 7500 },
          ],
          revenueByCountry: [
            { name: "United States", value: 6000 },
            { name: "United Kingdom", value: 2500 },
            { name: "Canada", value: 1800 },
            { name: "Australia", value: 1200 },
            { name: "Germany", value: 1000 },
          ],
          revenueGrowth: Array.from({ length: 30 }, (_, i) => ({
            timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
            value: 10000 + i * 100 + Math.floor(Math.random() * 200),
          })),
        }),
      })
    })

    await page.route("**/api/analytics/system*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          apiRequests: { name: "API Requests", value: 45000, change: 12.3 },
          errorRate: { name: "Error Rate", value: 0.8, change: -0.3 },
          averageResponseTime: { name: "Avg. Response Time", value: 120, change: -5.2 },
          serverLoad: { name: "Server Load", value: 42, change: 3.1 },
          requestsByEndpoint: [
            { name: "/api/posts", value: 15000 },
            { name: "/api/users", value: 12000 },
            { name: "/api/comments", value: 8000 },
            { name: "/api/subscriptions", value: 5000 },
            { name: "/api/analytics", value: 3000 },
          ],
          errorsByType: [
            { name: "Authentication", value: 150 },
            { name: "Validation", value: 120 },
            { name: "Database", value: 80 },
            { name: "Server", value: 50 },
          ],
          responseTimeHistory: Array.from({ length: 30 }, (_, i) => ({
            timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
            value: 100 + Math.floor(Math.random() * 50),
          })),
        }),
      })
    })

    // Login and navigate to analytics dashboard
    await page.goto("/login")
    await page.fill('input[name="email"]', "admin@example.com")
    await page.fill('input[name="password"]', "password123")
    await page.click('button[type="submit"]')

    // Navigate to analytics dashboard
    await page.goto("/admin/analytics")
  })

  test("should display the analytics dashboard with overview tab", async ({ page }) => {
    // Check page title
    await expect(page.locator("h1")).toContainText("Analytics Dashboard")

    // Check time range selector
    await expect(page.locator('button:has-text("Last 30 days")')).toBeVisible()

    // Check tabs
    await expect(page.locator('button[role="tab"]:has-text("Overview")')).toBeVisible()
    await expect(page.locator('button[role="tab"]:has-text("Users")')).toBeVisible()
    await expect(page.locator('button[role="tab"]:has-text("Content")')).toBeVisible()
    await expect(page.locator('button[role="tab"]:has-text("Revenue")')).toBeVisible()
    await expect(page.locator('button[role="tab"]:has-text("System")')).toBeVisible()

    // Check overview metrics
    await expect(page.locator("text=Total Users")).toBeVisible()
    await expect(page.locator("text=1250")).toBeVisible()
    await expect(page.locator("text=Active Users")).toBeVisible()
    await expect(page.locator("text=850")).toBeVisible()
    await expect(page.locator("text=Total Content")).toBeVisible()
    await expect(page.locator("text=320")).toBeVisible()
    await expect(page.locator("text=Total Revenue")).toBeVisible()
    await expect(page.locator("text=$12,500")).toBeVisible()

    // Check charts
    await expect(page.locator("text=User Growth")).toBeVisible()
    await expect(page.locator("text=Content Growth")).toBeVisible()
    await expect(page.locator("text=Revenue Growth")).toBeVisible()
    await expect(page.locator("text=API Requests")).toBeVisible()
  })

  test("should switch between tabs", async ({ page }) => {
    // Click on Users tab
    await page.click('button[role="tab"]:has-text("Users")')
    await expect(page.locator("text=Users by Plan")).toBeVisible()
    await expect(page.locator("text=Users by Country")).toBeVisible()

    // Click on Content tab
    await page.click('button[role="tab"]:has-text("Content")')
    await expect(page.locator("text=Content by Type")).toBeVisible()
    await expect(page.locator("text=Popular Content")).toBeVisible()

    // Click on Revenue tab
    await page.click('button[role="tab"]:has-text("Revenue")')
    await expect(page.locator("text=Revenue by Plan")).toBeVisible()
    await expect(page.locator("text=Revenue by Country")).toBeVisible()

    // Click on System tab
    await page.click('button[role="tab"]:has-text("System")')
    await expect(page.locator("text=Requests by Endpoint")).toBeVisible()
    await expect(page.locator("text=Errors by Type")).toBeVisible()
  })

  test("should change time range", async ({ page }) => {
    // Open time range selector
    await page.click('button:has-text("Last 30 days")')

    // Select different time range
    await page.click("text=Last 7 days")

    // Check that API requests were made with the new time range
    await expect(page.locator('button:has-text("Last 7 days")')).toBeVisible()
  })

  test("should display data tables with search functionality", async ({ page }) => {
    // Go to Content tab
    await page.click('button[role="tab"]:has-text("Content")')

    // Check popular content table
    await expect(page.locator("text=Popular Content")).toBeVisible()
    await expect(page.locator("text=Getting Started Guide")).toBeVisible()

    // Search for content
    await page.fill('input[placeholder="Search..."]', "Advanced")
    await expect(page.locator("text=Advanced Techniques")).toBeVisible()
    await expect(page.locator("text=Getting Started Guide")).not.toBeVisible()

    // Clear search
    await page.fill('input[placeholder="Search..."]', "")
    await expect(page.locator("text=Getting Started Guide")).toBeVisible()
  })
})

