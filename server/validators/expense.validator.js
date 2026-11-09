import { z } from "zod";

// Allowed expense categories
const expenseCategories = [
  "accommodation",
  "transportation",
  "food",
  "activities",
  "shopping",
  "miscellaneous",
];

// Schema for creating an expense
export const createExpenseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Expense title is required.")
    .max(100),

  category: z.enum(expenseCategories),

  amount: z
    .number()
    .min(0, "Amount cannot be negative."),

  date: z.coerce.date().optional(),

  notes: z
    .string()
    .max(500)
    .optional()
    .default(""),
});

// Schema for updating an expense
export const updateExpenseSchema = z.object({
  title: z.string().trim().min(1).max(100).optional(),

  category: z.enum(expenseCategories).optional(),

  amount: z.number().min(0).optional(),

  date: z.coerce.date().optional(),

  notes: z.string().max(500).optional(),
});