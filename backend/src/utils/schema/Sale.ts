import z from "zod"
import { PaymentMode } from "../../generated/prisma/enums";

const TransactionItemSchema = z.object({
    productId: z.string().uuid({ message: "Invalid Product ID" }),
    name: z.string().min(1, "Product name is required"),
    price: z.number().nonnegative("Price cannot be negative"),
    
    // Logic: Packaged items need quantity, Loose items need weight
    quantity: z.number().int().nonnegative().optional(),
    weight: z.number().nonnegative().optional(),
    isLoose: z.boolean()
  });
  export const CreateTransactionSchema = z.object({
    items: z.array(TransactionItemSchema).min(1, "Cart cannot be empty"),
    
    totalAmount: z.number().nonnegative("Total amount cannot be negative"),
    
    mode: z.enum(PaymentMode).default(PaymentMode.CASH),
    customerId: z.uuid().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.mode === PaymentMode.UDHAAR && !data.customerId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Customer ID is required for Udhaar transactions",
        path: ["customerId"], // Points error to this field
      });
    }
  });
  export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;