import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/database.js";
import Destination from "../models/Destination.js";
import destinationData from "./destinationData.js";

dotenv.config();

const seedDestinations = async () => {
  try {
    // Step 1: Connect to MongoDB
    await connectDB();

    console.log("Connected to MongoDB");

    // Step 2: Prepare bulk database operations
    const operations = destinationData.map((destination) => ({
      updateOne: {
        filter: {
          name: destination.name,
          country: destination.country,
        },
        update: {
          $set: destination,
        },
        upsert: true,
      },
    }));

    // Step 3: Insert new destinations or update existing ones
    const result = await Destination.bulkWrite(operations);

    console.log("Destination catalogue updated");

    // Step 4: Remove outdated Indian catalogue entries
    const destinationNames = destinationData.map(
      (destination) => destination.name
    );

    const cleanupResult = await Destination.deleteMany({
      country: "India",
      name: { $nin: destinationNames },
    });

    // Step 5: Count final destinations
    const total = await Destination.countDocuments({
      country: "India",
    });

    // Step 6: Get destination counts for each state/UT
    const regionSummary = await Destination.aggregate([
      {
        $match: {
          country: "India",
          state: { $exists: true, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$state",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    console.log("\n========== SEED SUMMARY ==========");
    console.log("Inserted:", result.upsertedCount);
    console.log("Updated:", result.modifiedCount);
    console.log("Removed outdated entries:", cleanupResult.deletedCount);
    console.log("Total destinations:", total);
    console.log("Total regions:", regionSummary.length);

    console.log("\nDestinations by region:");

    regionSummary.forEach((region) => {
      console.log(`${region._id}: ${region.count}`);
    });

    console.log("\nDestination seeding completed!");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("\nMongoDB connection closed");
  }
};

seedDestinations();


