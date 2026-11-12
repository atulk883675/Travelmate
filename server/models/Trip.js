import mongoose from "mongoose";

// Individual activity inside an itinerary day
const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    default: "",
  },

  startTime: {
    type: String,
    default: "",
  },

  endTime: {
    type: String,
    default: "",
  },

  location: {
    type: String,
    default: "",
  },

  estimatedCost: {
    type: Number,
    min: 0,
    default: 0,
  },
});

// Each day contains multiple activities
const itineraryDaySchema = new mongoose.Schema({
  dayNumber: {
    type: Number,
    required: true,
    min: 1,
  },

  date: {
    type: Date,
    required: true,
  },

  title: {
    type: String,
    default: "",
  },

  summary: {
    type: String,
    default: "",
  },

  activities: {
    type: [activitySchema],
    default: [],
  },
});

// Main Trip schema
const tripSchema = new mongoose.Schema(
  {
    // User who owns this trip
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    
    destination: {
      destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      default: null
      },
      name: {
      type: String,
      required: true,
      trim: true
      },
      country: {
      type: String,
      default: ""
      },
      latitude: {
      type: Number,
      default: null
      },
      longitude: {
       type: Number,
       default: null
      }
    },


    startingLocation: {
      type: String,
      required: true,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return !this.startDate || value >= this.startDate;
        },
        message: "End date cannot be before start date.",
      },
    },

    travelers: {
      adults: {
        type: Number,
        min: 1,
        default: 1,
      },

      children: {
        type: Number,
        min: 0,
        default: 0,
      },
    },

    budgetPlan: {
      totalAmount: {
        type: Number,
        min: 0,
        default: 0,
      },

      currency: {
        type: String,
        default: "INR",
      },
    },

    preferences: {
      travelStyle: {
        type: String,
        enum: ["budget", "moderate", "luxury"],
        default: "moderate",
      },

      interests: {
        type: [String],
        default: [],
      },

      pace: {
        type: String,
        enum: ["relaxed", "balanced", "packed"],
        default: "balanced",
      },
    },

    itinerary: {
      type: [itineraryDaySchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["planning", "ongoing", "completed", "cancelled"],
      default: "planning",
    },
  },
  {
    timestamps: true,
  }
);

// Efficiently retrieve a user's trips by creation date
tripSchema.index({
  userId: 1,
  createdAt: -1,
});

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;
