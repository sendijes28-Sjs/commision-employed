import { z } from "zod";

export const InvoiceItemSchema = z.object({
  id: z.string(),
  productName: z.string().min(1, "Product name is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  price: z.coerce.number().min(0, "Price must be positive"),
  normalPrice: z.coerce.number().default(0),
  bottomPrice: z.coerce.number().default(0),
});

export const InvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  date: z.string().min(1, "Date is required"),
  team: z.string().min(1, "Team is required"),
  userId: z.string().min(1, "User is required"),
  customerName: z.string().min(1, "Customer name is required"),
  items: z.array(InvoiceItemSchema).min(1, "At least one item is required"),
});
