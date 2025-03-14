import * as z from "zod"

export const draftSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  content: z.string(),
  categoryId: z.string(),
  tags: z.array(z.string()),
})

