import { z } from "zod";

const activitySchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string(),
  estimatedCost: z.number().min(0),
});

const itineraryDaySchema = z.object({
  dayNumber: z.number().int().positive(),
  date: z.string(),
  title: z.string(),
  summary: z.string(),
  activities: z.array(activitySchema),
});

export const assistantResponseSchema = z.object({
  message: z.string(),
  canApply: z.boolean(),
  itinerary: z.array(itineraryDaySchema),
});

export const assistantRequestSchema = z.object({
  message: z.string().trim().min(1).max(1000),
});
