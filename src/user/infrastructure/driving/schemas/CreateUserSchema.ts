import { z } from 'zod'

export const CreateUserSchema = z.object({
  name: z.string(),
  lastname: z.string(),
  age: z.number().min(18).max(120),
  identificationNumber: z.string().min(8).max(8),
  identificationType: z.string()
})
