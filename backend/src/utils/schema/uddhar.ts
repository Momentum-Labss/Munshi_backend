import { z } from 'zod';

export const CreateCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  // Validates 10+ digit numbers
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\d+$/, "Phone must contain only numbers"),
});

export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;