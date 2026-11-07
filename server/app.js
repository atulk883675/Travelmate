import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";

const app = express();

// Middleware
app.use(express.json());

app.use(cookieParser());

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true
    })
);

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

export default app;