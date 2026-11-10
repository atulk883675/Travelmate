import mongoose from "mongoose";
import Destination from "../models/Destination.js";
import User from "../models/User.js";

// Get all destinations with optional search and category filters
export const getAllDestinations = async (req, res, next) => {
  try {
    // Step 1: Create an empty filter object
    const filter = {
      country: "India",
    };

    // Step 2: Search destinations by name
    if (req.query.search) {
      filter.name = {
        $regex: req.query.search,
        $options: "i",
      };
    }

    // Step 3: Filter by destination category
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Step 4: Filter featured destinations
    if (req.query.featured === "true") {
      filter.isFeatured = true;
    }

    // Step 5: Filter by state or Union Territory
    if (req.query.state) {
      filter.state = {
        $regex: `^${req.query.state}$`,
        $options: "i",
      };
    }

    // Step 6: Fetch destinations from MongoDB
    const destinations = await Destination.find(filter).sort({
      name: 1,
    });

    // Step 7: Send response
    res.status(200).json({
      success: true,
      count: destinations.length,
      destinations,
    });

  } catch (error) {
    next(error);
  }
};


// Get details of one destination
export const getDestinationById = async (req, res) => {
  try {
    const { destinationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(destinationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid destination ID.",
      });
    }

    const destination = await Destination.findById(destinationId);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found.",
      });
    }

    return res.status(200).json({
      success: true,
      destination,
    });
  } catch (error) {
    console.error("Get Destination Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve destination details.",
    });
  }
};

// Save a destination to the user's account
export const saveDestination = async (req, res) => {
  try {
    const { destinationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(destinationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid destination ID.",
      });
    }

    const destination = await Destination.findById(destinationId);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found.",
      });
    }

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: { savedDestinations: destination._id },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Destination saved successfully.",
    });
  } catch (error) {
    console.error("Save Destination Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save destination.",
    });
  }
};

// Remove a destination from the user's saved list
export const removeSavedDestination = async (req, res) => {
  try {
    const { destinationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(destinationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid destination ID.",
      });
    }

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { savedDestinations: destinationId },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Destination removed from saved list.",
    });
  } catch (error) {
    console.error("Remove Saved Destination Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove saved destination.",
    });
  }
};

// Get all destinations saved by the logged-in user
export const getSavedDestinations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("savedDestinations");

    return res.status(200).json({
      success: true,
      destinations: user.savedDestinations,
    });
  } catch (error) {
    console.error("Get Saved Destinations Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve saved destinations.",
    });
  }
};


export const getDestinationRegions = async (req, res, next) => {
  try {
    const regions = await Destination.aggregate([
      // Only consider Indian destinations with a valid state
      {
        $match: {
          country: "India",
          state: { $exists: true, $ne: "" },
        },
      },

      // Group destinations by state/UT
      {
        $group: {
          _id: "$state",
          destinationCount: { $sum: 1 },
        },
      },

      // Sort alphabetically
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    // Prepare a clean response for the frontend
    const formattedRegions = regions.map((region) => ({
      state: region._id,
      destinationCount: region.destinationCount,
    }));

    res.status(200).json({
      success: true,
      count: formattedRegions.length,
      regions: formattedRegions,
    });
  } catch (error) {
    next(error);
  }
};

