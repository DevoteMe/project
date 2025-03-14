import * as z from "zod"

export const scheduleSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  content: z.string().min(1, "Content is required"),
  scheduledFor: z.date({
    required_error: "Please select a date and time",
  }),
  timezone: z.string().default("UTC"),
  categoryId: z.string(),
  tags: z.array(z.string()),
  recurringPattern: z
    .object({
      frequency: z.enum(["daily", "weekly", "monthly"]),
      interval: z.number().min(1),
      endDate: z.date().optional(),
      daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
      dayOfMonth: z.number().min(1).max(31).optional(),
    })
    .optional(),
})

