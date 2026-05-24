import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide a name"],
        },
        email: {
            type: String,
            required: [true, "Please provide an email"],
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, "Please provide a password"],
            minlength: 8,
            select: false,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        onboardingDone: {
            type: Boolean,
            default: false,
        },
        profile: {
            age: Number,
            weight: Number, // kg
            height: Number, // cm
            gender: String, // Male/Female/Other
            goal: String, // Weight Loss/Muscle Gain/Maintenance/Improve Stamina
            activityLevel: String, // Sedentary/Lightly Active/Moderately Active/Very Active
            dietaryPreference: String, // Vegetarian/Non-Vegetarian/Vegan/Keto/Paleo
        },
        dashboardData: {
            dailySummary: {
                calories: Number,
                protein: Number,
                hydration: Number,
            },
            macroBreakdown: {
                protein: { grams: Number, percentage: Number },
                carbs: { grams: Number, percentage: Number },
                fats: { grams: Number, percentage: Number },
            },
            activePlan: String,
            meals: [
                {
                    name: String,
                    calories: Number,
                    description: String,
                    ingredients: [String],
                },
            ],
            nutritionTips: [String],
            progressPercentages: {
                protein: Number,
                calories: Number,
                hydration: Number,
            },
        },
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (passwordToCheck) {
    return await bcryptjs.compare(passwordToCheck, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
