
import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    imageUrl: {
      type: String,
      default: "",
    },

    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },

    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },

    category: {
      type: String,
      enum: [
        "mountain",
        "beach",
        "city",
        "historical",
        "nature",
        "adventure",
      ],
      default: "nature",
    },

    bestTimeToVisit: {
      type: String,
      default: "",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Destination = mongoose.model(
  "Destination",
  destinationSchema
);

export default Destination;