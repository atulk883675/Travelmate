import Trip from "../models/Trip.js";
import mongoose from "mongoose";

// Create a new trip
export const createTrip = async (req, res, next) => {
  try {
    // Get trip information from the request body
    const {
      title,
      destination,
      startingLocation,
      startDate,
      endDate,
      travelers,
      budgetPlan,
      preferences,
    } = req.body;

    // Create trip and associate it with logged-in user
    const trip = await Trip.create({
      userId: req.user._id,
      title,
      destination,
      startingLocation,
      startDate,
      endDate,
      travelers,
      budgetPlan,
      preferences,
    });

    // Return successful response
    return res.status(201).json({
      success: true,
      message: "Trip created successfully",
      trip,
    });

  } catch (error) {
    next(error);
  }
};

// Get all trips belonging to logged-in user
export const getMyTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: trips.length,
      trips,
    });

  } catch (error) {
    next(error);
  }
};

// Get one trip by ID
export const getTripById = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    // Check whether the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID",
      });
    }

    // Find trip belonging to the logged-in user
    const trip = await Trip.findOne({
      _id: tripId,
      userId: req.user._id,
    });

    // Check whether trip exists
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    return res.status(200).json({
      success: true,
      trip,
    });

  } catch (error) {
    next(error);
  }
};

export const updateTrip = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID",
      });
    }

    const updatedTrip = await Trip.findOneAndUpdate(
      {
        _id: tripId,
        userId: req.user._id,
      },
      {
        $set: req.body,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedTrip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Trip updated successfully",
      trip: updatedTrip,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTrip = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID",
      });
    }

    const deletedTrip = await Trip.findOneAndDelete({
      _id: tripId,
      userId: req.user._id,
    });

    if (!deletedTrip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Trip deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


