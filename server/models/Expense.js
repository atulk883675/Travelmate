import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    // Trip to which this expense belongs
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },

    // User who created this expense
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Expense title
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // Expense category
    category: {
      type: String,
      required: true,
      enum: [
        "accommodation",
        "transportation",
        "food",
        "activities",
        "shopping",
        "miscellaneous",
      ],
    },

    // Actual amount spent
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Date of expense
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // Optional notes
    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Efficiently retrieve expenses for a trip
expenseSchema.index({
  tripId: 1,
  date: -1,
});

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;