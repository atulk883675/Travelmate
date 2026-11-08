export const buildItineraryPrompt = (trip) => {
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);

  const duration =
    Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

  return `
You are an expert travel itinerary planner.

Generate a personalized travel itinerary using the following trip details.

TRIP DETAILS:

Destination: ${trip.destination.name}
Country: ${trip.destination.country || "Not specified"}
Starting Location: ${trip.startingLocation}

Start Date: ${startDate.toISOString().split("T")[0]}
End Date: ${endDate.toISOString().split("T")[0]}
Duration: ${duration} days

Adults: ${trip.travelers.adults}
Children: ${trip.travelers.children}

Total Budget: ${trip.budgetPlan.totalAmount}
Currency: ${trip.budgetPlan.currency}

Travel Style: ${trip.preferences.travelStyle}
Interests: ${trip.preferences.interests.join(", ") || "General sightseeing"}
Travel Pace: ${trip.preferences.pace}

INSTRUCTIONS:

1. Generate exactly ${duration} itinerary days.
2. Arrange activities in chronological order.
3. Personalize activities according to travel style and interests.
4. Consider the total budget while suggesting activities.
5. Include suitable morning, afternoon and evening activities.
6. Provide realistic estimated activity costs in the specified currency.
7. Avoid scheduling too many activities in one day.
8. Consider travel time between activities.
9. Do not invent verified opening hours, live prices or exact travel distances.
10. If information is uncertain, clearly indicate that it needs verification.
11. Make the itinerary practical for the specified number of travelers.
12. Use the exact dates corresponding to each itinerary day.

OUTPUT REQUIREMENTS:

Return ONLY valid JSON.

Use this exact structure:

{
  "itinerary": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "title": "Day title",
      "summary": "Short description of the day",
      "activities": [
        {
          "name": "Activity name",
          "description": "Activity description",
          "startTime": "09:00",
          "endTime": "11:00",
          "location": "Place name",
          "estimatedCost": 500
        }
      ]
    }
  ]
}

IMPORTANT:
- Do not include Markdown code fences.
- Do not include explanations outside the JSON.
- estimatedCost must be a non-negative number.
- Include all required fields.
`;
};