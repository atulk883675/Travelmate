import Trip from "../models/Trip.js";

import {
  generateAssistantResponse,
} from "../services/ai/gemini.service.js";

import {
  assistantRequestSchema,
  assistantResponseSchema,
} from "../validators/assistant.validator.js";

import mongoose from "mongoose";
import { itinerarySchema } from "../validators/itinerary.validator.js";

export const chatWithAssistant = async (req, res, next) => {
  try {
    // Step 1: Validate user's message
    const requestValidation = assistantRequestSchema.safeParse(
      req.body
    );

    if (!requestValidation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid assistant message.",
        errors: requestValidation.error.issues,
      });
    }

    const { message } = requestValidation.data;
    const { tripId } = req.params;

    // Step 2: Find the trip belonging to the logged-in user
    const trip = await Trip.findOne({
      _id: tripId,
      userId: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }


    console.log("1. Assistant controller reached Gemini call"); 
    // Step 3: Ask Gemini to propose itinerary changes
    const assistantResponse = await generateAssistantResponse(
      trip,
      message
    );
    console.log("2. Gemini response received");

    // Step 4: Validate Gemini's response
    const responseValidation = assistantResponseSchema.safeParse(
      assistantResponse
    );

    if (!responseValidation.success) {
      return res.status(502).json({
        success: false,
        message: "AI returned an invalid itinerary structure.",
        errors: responseValidation.error.issues,
      });
    }

    const result = responseValidation.data;

    // Step 5: Verify the itinerary can be applied
    if (result.canApply) {
      if (result.itinerary.length !== trip.itinerary.length) {
        return res.status(502).json({
          success: false,
          message: "AI returned an incorrect number of itinerary days.",
        });
      }

      const originalDays = trip.itinerary;

      for (let index = 0; index < originalDays.length; index++) {
        if (
          result.itinerary[index].dayNumber !==
            originalDays[index].dayNumber ||
          result.itinerary[index].date !==
            new Date(originalDays[index].date).toISOString().split("T")[0]
        ) {
          return res.status(502).json({
            success: false,
            message: "AI changed the original itinerary dates or day numbers.",
          });
        }
      }
    }

    // Step 6: Return proposal without saving it
    res.status(200).json({
      success: true,
      message: result.message,
      canApply: result.canApply,
      proposedItinerary: result.itinerary,
    });
  } catch (error) {
    next(error);
  }
};


export const applyAssistantChanges = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    // Step 1: Validate MongoDB Trip ID
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID.",
      });
    }

    // Step 2: Validate proposed itinerary using Zod
    const validationResult = itinerarySchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(422).json({
        success: false,
        message: "Invalid proposed itinerary.",
        errors: validationResult.error.issues,
      });
    }

    // Step 3: Find trip belonging to logged-in user
    const trip = await Trip.findOne({
      _id: tripId,
      userId: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    const proposedItinerary = validationResult.data.itinerary;

    // Step 4: Verify number of itinerary days
    if (proposedItinerary.length !== trip.itinerary.length) {
      return res.status(422).json({
        success: false,
        message: "Proposed itinerary has an incorrect number of days.",
      });
    }

    // Step 5: Verify original dates and day numbers
    for (let index = 0; index < trip.itinerary.length; index++) {
      const originalDay = trip.itinerary[index];
      const proposedDay = proposedItinerary[index];

      const originalDate = new Date(originalDay.date)
        .toISOString()
        .split("T")[0];

      if (
        proposedDay.dayNumber !== originalDay.dayNumber ||
        proposedDay.date !== originalDate
      ) {
        return res.status(422).json({
          success: false,
          message: "Proposed itinerary cannot change original dates or day numbers.",
        });
      }
    }

    // Step 6: Apply proposed itinerary
    trip.itinerary = proposedItinerary;

    await trip.save();

    return res.status(200).json({
      success: true,
      message: "AI itinerary changes applied successfully.",
      itinerary: trip.itinerary,
    });

  } catch (error) {
    next(error);
  }
};

