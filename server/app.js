import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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

export default app;