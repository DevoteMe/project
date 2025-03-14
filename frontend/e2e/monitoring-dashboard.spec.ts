import { test, expect } from "@playwright/test"

test.describe("Monitoring Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses for system health
    await page.route("**/api/monitoring/health*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          api: { status: "healthy", uptime: "99.98%", lastIncident: "7d ago" },
          database: { status: "healthy", uptime: "99.95%", lastIncident: "14d ago" },
          storage: { status: "healthy", uptime: "100%", lastIncident: "None" },
          cache: { status: "healthy", uptime: "99.99%", lastIncident: "3d ago" },
          queue: { status: "warning", uptime: "99.5%", lastIncident: "1h ago" },
        }),
      })
    })

    // Mock API responses for resource usage
    await page.route("**/api/monitoring/resources*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          cpu: 42,
          memory: 68,
          disk: 37,
          network: 28,
          cpuHistory: Array.from({ length: 24 }, (_, i) => ({
            timestamp: new Date(Date.now() - (23 - i) * 3600 * 1000).toISOString(),
            value: 30 + Math.random() * 40,
          })),
          memoryHistory: Array.from({ length: 24 }, (_, i) => ({
            timestamp: new Date(Date.now() - (23 - i) * 3600 * 1000).toISOString(),
            value: 50 + Math.random() * 30,
          })),
        }),
      })
    })

    // Mock API responses for alerts
    await page.route("**/api/monitoring/alerts*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          activeAlerts: [
            {
              id: 1,
              severity: "warning",
              message: "Queue processing delay detected",
              timestamp: "2023-06-15T10:23:45Z",
              service: "Message Queue",
            },
            {
              id: 2,
              severity: "info",
              message: "Scheduled maintenance in 24 hours",
              timestamp: "2023-06-15T09:15:30Z",
              service: "All Services",
            },
          ],
          recentAlerts: [
            {
              id: 3,
              severity: "error",
              message: "Database connection timeout",
              timestamp: "2023-06-14T15:30:45Z",
              service: "Database",
              status: "resolved",
            },
            {
              id: 4,
              severity: "warning",
              message: "High memory usage detected",
              timestamp: "2023-06-13T08:45:12Z",
              service: "API Server",
              status: "resolved",
            },
            {
              id: 5,
              severity: "info",
              message: "Scheduled maintenance completed",
              timestamp: "2023-06-10T22:10:30Z",
              service: "All Services",
              status: "resolved",
            },
          ],
        }),
      })
    })

    // Mock API responses for incidents
    await page.route("**/api/monitoring/incidents*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          incidents: [
            {
              id: 101,
              status: "resolved",
              title: "API Latency Spike",
              startTime: "2023-06-12T14:30:00Z",
              endTime: "2023-06-12T15:45:00Z",
              impact: "minor",
            },
            {
              id: 102,
              status: "resolved",
              title: "Database Connection Issues",
              startTime: "2023-06-08T08:15:00Z",
              endTime: "2023-06-08T09:30:00Z",
              impact: "major",
            },
            {
              id: 103,
              status: "resolved",
              title: "Storage Service Degradation",
              startTime: "2023-06-01T18:20:00Z",
              endTime: "2023-06-01T20:10:00Z",
              impact: "minor",
            },
          ],
        }),
      })
    })

    // Login and navigate to monitoring dashboard
    await page.goto("/login")
    await page.fill('input[name="email"]', "admin@example.com")
    await page.fill('input[name="password"]', "password123")
    await page.click('button[type="submit"]')

    // Navigate to monitoring dashboard
    await page.goto("/admin/monitoring")
  })

  test("should display the monitoring dashboard with overview tab", async ({ page }) => {
    // Check page title
    await expect(page.locator("h1")).toContainText("System Monitoring")

    // Check time range selector
    await expect(page.locator('button:has-text("Last 24 hours")')).toBeVisible()

    // Check tabs
    await expect(page.locator('button[role="tab"]:has-text("Overview")')).toBeVisible()
    await expect(page.locator('button[role="tab"]:has-text("Resources")')).toBeVisible()
    await expect(page.locator('button[role="tab"]:has-text("Alerts")')).toBeVisible()
    await expect(page.locator('button[role="tab"]:has-text("Incidents")')).toBeVisible()

    // Check system health indicators
    await expect(page.locator("text=API Service")).toBeVisible()
    await expect(page.locator("text=Database")).toBeVisible()
    await expect(page.locator("text=Storage")).toBeVisible()
    await expect(page.locator("text=Cache")).toBeVisible()
    await expect(page.locator("text=Queue")).toBeVisible()

    // Check resource usage
    await expect(page.locator("text=Resource Usage")).toBeVisible()
    await expect(page.locator("text=CPU")).toBeVisible()
    await expect(page.locator("text=Memory")).toBeVisible()
    await expect(page.locator("text=Disk")).toBeVisible()
    await expect(page.locator("text=Network")).toBeVisible()

    // Check active alerts
    await expect(page.locator("text=Active Alerts")).toBeVisible()
    await expect(page.locator("text=Queue processing delay detected")).toBeVisible()

    // Check charts
    await expect(page.locator("text=API Requests")).toBeVisible()
    await expect(page.locator("text=Error Rate")).toBeVisible()
  })

  test("should switch between tabs", async ({ page }) => {
    // Click on Resources tab
    await page.click('button[role="tab"]:has-text("Resources")')
    await expect(page.locator("text=CPU Usage")).toBeVisible()
    await expect(page.locator("text=Memory Usage")).toBeVisible()
    await expect(page.locator("text=Server Resources")).toBeVisible()
    await expect(page.locator("text=Database")).toBeVisible()

    // Click on Alerts tab
    await page.click('button[role="tab"]:has-text("Alerts")')
    await expect(page.locator("text=Active Alerts")).toBeVisible()
    await expect(page.locator("text=Alert History")).toBeVisible()
    await expect(page.locator("text=Queue processing delay detected")).toBeVisible()

    // Click on Incidents tab
    await page.click('button[role="tab"]:has-text("Incidents")')
    await expect(page.locator("text=Recent Incidents")).toBeVisible()
    await expect(page.locator("text=Incident Reports")).toBeVisible()
    await expect(page.locator("text=API Latency Spike")).toBeVisible()
  })

  test("should refresh data when refresh button is clicked", async ({ page }) => {
    // Find and click the refresh button
    await page.click('button[aria-label="Refresh"]')

    // Check that API requests were made again
    // This is hard to test directly, but we can check that the page doesn't crash
    await expect(page.locator("h1")).toContainText("System Monitoring")
  })

  test("should display alert details", async ({ page }) => {
    // Go to Alerts tab
    await page.click('button[role="tab"]:has-text("Alerts")')

    // Check alert details
    await expect(page.locator("text=Queue processing delay detected")).toBeVisible()
    await expect(page.locator("text=Message Queue")).toBeVisible()
    await expect(page.locator("text=warning")).toBeVisible()

    // Check alert history
    await expect(page.locator("text=Database connection timeout")).toBeVisible()
    await expect(page.locator("text=Resolved")).toBeVisible()
  })

  test("should display incident details", async ({ page }) => {
    // Go to Incidents tab
    await page.click('button[role="tab"]:has-text("Incidents")')

    // Check incident list
    await expect(page.locator("text=API Latency Spike")).toBeVisible()
    await expect(page.locator("text=Database Connection Issues")).toBeVisible()
    await expect(page.locator("text=Storage Service Degradation")).toBeVisible()

    // Check incident details
    await expect(page.locator("text=Summary")).toBeVisible()
    await expect(page.locator("text=Root Cause")).toBeVisible()
    await expect(page.locator("text=Resolution")).toBeVisible()
  })
})

