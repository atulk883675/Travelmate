import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";
import tripRoutes from "./routes/trip.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import itineraryRoutes from "./routes/itinerary.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import budgetRoutes from "./routes/budget.routes.js";
import mapsRoutes from "./routes/maps.routes.js";
import routingRoutes from "./routes/routing.routes.js";
import weatherRoutes from "./routes/weather.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());

app.use(cookieParser());

// Health check API
app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "TravelMate API is running",
        timestamp: new Date().toISOString()
    });
});

// Authentication routes
app.use("/api/v1/auth", authRoutes);

// Centralized error handling
app.use(errorMiddleware);

app.use("/api/v1/trips", tripRoutes);

app.use("/api/v1/ai", aiRoutes);

app.use("/api/v1/itinerary", itineraryRoutes);

app.use("/api/v1/expenses", expenseRoutes);

app.use("/api/v1/budget", budgetRoutes);

app.use("/api/v1/maps", mapsRoutes);

app.use("/api/v1/maps/route", routingRoutes);

app.use("/api/v1/weather", weatherRoutes);

export default app;