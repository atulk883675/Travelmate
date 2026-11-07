import { z } from "zod";

export const createTripSchema = z.object({
  title: z.string()
    .trim()
    .min(2, "Trip title must contain at least 2 characters")
    .max(100, "Trip title cannot exceed 100 characters"),

  destination: z.object({
    name: z.string()
      .trim()
      .min(2, "Destination is required"),

    country: z.string()
      .trim()
      .optional()
      .default(""),
  }),

  startingLocation: z.string()
    .trim()
    .min(2, "Starting location is required"),

  startDate: z.coerce.date(),

  endDate: z.coerce.date(),

  travelers: z.object({
    adults: z.number()
      .int()
      .min(1, "At least one adult is required")
      .default(1),

    children: z.number()
      .int()
      .min(0)
      .default(0),
  }).default({}),

  budgetPlan: z.object({
    totalAmount: z.number()
      .min(0, "Budget cannot be negative")
      .default(0),

    currency: z.string()
      .length(3, "Currency must be a 3-letter code")
      .default("INR"),
  }).default({}),

  preferences: z.object({
    travelStyle: z.enum([
      "budget",
      "moderate",
      "luxury",
    ]).default("moderate"),

    interests: z.array(z.string().trim())
      .default([]),

    pace: z.enum([
      "relaxed",
      "balanced",
      "packed",
    ]).default("balanced"),
  }).default({}),
}).refine(
  (data) => data.endDate >= data.startDate,
  {
    message: "End date cannot be before start date",
    path: ["endDate"],
  }
);
