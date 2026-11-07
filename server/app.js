import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";

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

export default app;