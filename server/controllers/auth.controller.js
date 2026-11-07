import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Create a safe user response
const getSafeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    createdAt: user.createdAt
});

// Generate authentication token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            tokenVersion: user.tokenVersion
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
};

// Register user
export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists"
            });
        }

        // Create user
        // The User pre-save hook hashes the password
        const user = await User.create({
            name,
            email,
            passwordHash: password
        });

        const token = generateToken(user);

        res.cookie("travelmate_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production"
                ? "none"
                : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/"
        });

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            user: getSafeUser(user)
        });

    } catch (error) {
        // Handle duplicate email race condition
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists"
            });
        }

        next(error);
    }
};

// Login user
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Explicitly select passwordHash because schema hides it
        const user = await User.findOne({ email })
            .select("+passwordHash");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Compare entered password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = generateToken(user);

        res.cookie("travelmate_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production"
                ? "none"
                : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/"
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: getSafeUser(user)
        });

    } catch (error) {
        next(error);
    }
};

// Logout user
export const logout = (req, res) => {
    res.clearCookie("travelmate_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production"
            ? "none"
            : "lax",
        path: "/"
    });

    return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
};
