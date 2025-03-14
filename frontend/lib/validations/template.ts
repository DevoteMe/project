import * as z from "zod"

export const templateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters"),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
  isDefault: z.boolean().default(false),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()),
})

