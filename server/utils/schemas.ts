import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  team: z.string().min(1, 'Team is required'),
  role: z.enum(['user', 'admin', 'super_admin']).default('user'),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

export const createInvoiceItemSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  quantity: z.number().min(1),
  price: z.number().min(0),
  normalPrice: z.number().default(0),
  bottomPrice: z.number().default(0),
});

export const createInvoiceSchema = z.object({
  invoice_number: z.string().min(1, 'Invoice number is required'),
  date: z.string().min(1, 'Date is required'),
  customer_name: z.string().min(1, 'Customer name is required'),
  total_amount: z.number().min(0, 'Total amount must be positive'),
  items: z.array(createInvoiceItemSchema).min(1, 'At least one item is required'),
  userId: z.union([z.string(), z.number()]).optional(),
  team: z.string().optional(),
});
