import { z } from "zod"

export const PreferedLanguageEnum = z.enum(["English", "Hindi", "Other"])

export const createProfileZSchema = z.object({
  name: z.string().min(1, "Name is required"),
  number: z.string().optional(),
  address: z.string().optional(),
  preferedLanguage: PreferedLanguageEnum.optional(),
})

export const updateProfileZSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  number: z.string().optional(),
  address: z.string().optional(),
  preferedLanguage: PreferedLanguageEnum.optional(),
})
