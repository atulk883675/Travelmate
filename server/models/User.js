
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: 2,
            maxlength: 60
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },

        passwordHash: {
            type: String,
            required: true,
            select: false
        },

        profile: {
            phone: {
                type: String,
                default: ""
            },

            travelStyle: {
                type: String,
                enum: ["budget", "moderate", "luxury"],
                default: "moderate"
            },

            interests: {
                type: [String],
                default: []
            }
        },

        savedDestinations: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Destination"
            }
        ],

        tokenVersion: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

// Hash password before saving a new user
userSchema.pre("save", async function () {
    if (!this.isModified("passwordHash")) {
        return;
    }

    this.passwordHash = await bcrypt.hash(
        this.passwordHash,
        12
    );
});

// Compare entered password with stored hash
userSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(
        enteredPassword,
        this.passwordHash
    );
};

const User = mongoose.model("User", userSchema);

export default User;
