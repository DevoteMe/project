/**
 * Technical Debt Tracker
 *
 * This file tracks known technical debt in the codebase.
 * Each item includes:
 * - A description of the issue
 * - The severity (critical, high, medium, low)
 * - The affected components
 * - The estimated effort to fix (in story points or days)
 * - The potential impact if not addressed
 *
 * This file should be reviewed regularly during sprint planning.
 */

export const technicalDebtItems = [
  {
    id: "TD-001",
    description: "Inconsistent error handling across services",
    severity: "critical",
    components: ["all services", "error middleware"],
    estimatedEffort: "5 days",
    impact: "Unpredictable API responses, difficult debugging, poor user experience",
    createdAt: "2023-11-15",
    assignedTo: null,
    status: "open",
  },
  {
    id: "TD-002",
    description: "Missing content moderation for uploaded media",
    severity: "critical",
    components: ["post.service.ts", "media upload"],
    estimatedEffort: "7 days",
    impact: "Inappropriate content could be published, legal and reputation risks",
    createdAt: "2023-11-15",
    assignedTo: null,
    status: "open",
  },
  {
    id: "TD-003",
    description: "N+1 query issues in post retrieval with comments",
    severity: "high",
    components: ["post.service.ts", "database queries"],
    estimatedEffort: "3 days",
    impact: "Poor performance with large datasets, high database load",
    createdAt: "2023-11-15",
    assignedTo: null,
    status: "open",
  },
  {
    id: "TD-004",
    description: "Missing CSRF protection in form submissions",
    severity: "critical",
    components: ["auth middleware", "forms"],
    estimatedEffort: "2 days",
    impact: "Vulnerability to CSRF attacks, potential unauthorized actions",
    createdAt: "2023-11-15",
    assignedTo: null,
    status: "open",
  },
  {
    id: "TD-005",
    description: "Incomplete webhook signature verification",
    severity: "high",
    components: ["webhook controllers"],
    estimatedEffort: "3 days",
    impact: "Potential for unauthorized webhook calls, security risk",
    createdAt: "2023-11-15",
    assignedTo: null,
    status: "open",
  },
  {
    id: "TD-006",
    description: "Missing pagination in chat history",
    severity: "medium",
    components: ["chat.service.ts", "frontend chat component"],
    estimatedEffort: "2 days",
    impact: "Poor performance with large chat histories, high memory usage",
    createdAt: "2023-11-15",
    assignedTo: null,
    status: "open",
  },
  {
    id: "TD-007",
    description: "Hardcoded strings throughout the codebase",
    severity: "medium",
    components: ["multiple files"],
    estimatedEffort: "4 days",
    impact: "Difficult internationalization, inconsistent messaging",
    createdAt: "2023-11-15",
    assignedTo: null,
    status: "open",
  },
  {
    id: "TD-008",
    description: "Missing comprehensive logging in payment flows",
    severity: "high",
    components: ["payment.service.ts"],
    estimatedEffort: "2 days",
    impact: "Difficult debugging of payment issues, poor customer support",
    createdAt: "2023-11-15",
    assignedTo: null,
    status: "open",
  },
  {
    id: "TD-009",
    description: "Frontend bundle size too large",
    severity: "medium",
    components: ["frontend build configuration"],
    estimatedEffort: "3 days",
    impact: "Slow initial load times, poor performance on mobile",
    createdAt: "2023-11-15",
    assignedTo: null,
    status: "open",
  },
  {
    id: "TD-010",
    description: "Missing database indexes for common queries",
    severity: "high",
    components: ["prisma schema", "database"],
    estimatedEffort: "1 day",
    impact: "Slow query performance, high database load",
    createdAt: "2023-11-15",
    assignedTo: null,
    status: "open",
  },
  {
    id: "TD-011",
    description: "Incomplete test coverage for auth flows",
    severity: "high",
    components: ["auth.service.test.ts"],
    estimatedEffort: "3 days",
    impact: "Potential for undetected bugs in critical auth paths",
    createdAt: "2023-11-15",
    assignedTo: null,
    status: "open",
  },
  {
    id: "TD-012",
    description: "No graceful shutdown handling",
    severity: "medium",
    components: ["app.ts", "server initialization"],
    estimatedEffort: "1 day",
    impact: "Potential for dropped connections during deployment",
    createdAt: "2023-11-15",
    assignedTo: null,
    status: "open",
  },
  {
    id: "TD-013",
    description: "Missing rate limiting for authentication endpoints",
    severity: "critical",
    components: ["auth routes", "rate limiting middleware"],
    estimatedEffort: "1 day",
    impact: "Vulnerability to brute force attacks",
    createdAt: "2023-11-15",
    assignedTo: null,
    status: "open",
  },
  {
    id: "TD-014",
    description: "Inconsistent error responses across API",
    severity: "high",
    components: ["all controllers"],
    estimatedEffort: "4 days",
    impact: "Difficult client integration, poor developer experience",
    createdAt: "2023-11-15",
    assignedTo: null,
    status: "open",
  },
  {
    id: "TD-015",
    description: "Missing accessibility in frontend components",
    severity: "medium",
    components: ["frontend components"],
    estimatedEffort: "5 days",
    impact: "Poor experience for users with disabilities, potential legal issues",
    createdAt: "2023-11-15",
    assignedTo: null,
    status: "open",
  },
]

/**
 * Get technical debt items by severity
 */
export function getTechnicalDebtBySeverity(severity: string) {
  return technicalDebtItems.filter((item) => item.severity === severity)
}

/**
 * Get technical debt items by component
 */
export function getTechnicalDebtByComponent(component: string) {
  return technicalDebtItems.filter((item) => item.components.some((c) => c.includes(component)))
}

/**
 * Get total estimated effort
 */
export function getTotalEstimatedEffort() {
  // This is a simplistic calculation assuming all estimates are in days
  return technicalDebtItems.reduce((total, item) => {
    const days = Number.parseInt(item.estimatedEffort.split(" ")[0])
    return total + days
  }, 0)
}

/**
 * Get critical technical debt items
 */
export function getCriticalTechnicalDebt() {
  return getTechnicalDebtBySeverity("critical")
}

