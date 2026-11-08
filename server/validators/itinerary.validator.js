import { z } from "zod";

// Validate individual activities
const activitySchema = z.object({
  name: z.string().min(1, "Activity name is required"),

  description: z.string().default(""),

  startTime: z.string().regex(
    /^([01]\d|2[0-3]):[0-5]\d$/,
    "Invalid start time"
  ),

  endTime: z.string().regex(
    /^([01]\d|2[0-3]):[0-5]\d$/,
    "Invalid end time"
  ),

  location: z.string().min(1, "Location is required"),

  estimatedCost: z.number().min(0),
});

// Validate individual itinerary days
const itineraryDaySchema = z.object({
  dayNumber: z.number().int().min(1),

  date: z.coerce.date(),

  title: z.string().min(1),

  summary: z.string().default(""),

  activities: z.array(activitySchema).min(1),
});

// Validate complete itinerary
export const itinerarySchema = z.object({
  itinerary: z.array(itineraryDaySchema).min(1),
});