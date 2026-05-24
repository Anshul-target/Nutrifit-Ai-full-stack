import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { generatePersonalizedNutrition } from "../services/nutritionPlanner.js";

const router = express.Router();

/**
 * POST /api/onboarding/complete
 * Complete onboarding and generate personalized nutrition plan
 */
router.post("/complete", protect, async (req, res) => {
    try {
        const userId = req.userId;
        const {
            age,
            weight,
            height,
            gender,
            goal,
            activityLevel,
            dietaryPreference,
        } = req.body;

        // Validate required fields
        if (
            !age ||
            !weight ||
            !height ||
            !gender ||
            !goal ||
            !activityLevel ||
            !dietaryPreference
        ) {
            return res.status(400).json({
                error: "All onboarding fields are required",
            });
        }

        // Build user profile
        const userProfile = {
            age: parseInt(age),
            weight: parseFloat(weight),
            height: parseInt(height),
            gender,
            goal,
            activityLevel,
            dietaryPreference,
        };

        // Generate personalized nutrition plan using Gemini
        const dashboardData = await generatePersonalizedNutrition(userProfile);

        // Update user with onboarding data
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                onboardingDone: true,
                profile: userProfile,
                dashboardData: dashboardData,
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Onboarding completed successfully",
            dashboardData: updatedUser.dashboardData,
            profile: updatedUser.profile,
        });
    } catch (err) {
        console.error("Onboarding error:", err);
        res.status(500).json({
            error: err.message || "Failed to complete onboarding",
        });
    }
});

/**
 * GET /api/onboarding/dashboard
 * Get user's dashboard data and onboarding status
 */
router.get("/dashboard", protect, async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({
            success: true,
            onboardingDone: user.onboardingDone,
            profile: user.profile || {},
            dashboardData: user.dashboardData || {},
        });
    } catch (err) {
        console.error("Dashboard fetch error:", err);
        res.status(500).json({
            error: err.message || "Failed to fetch dashboard data",
        });
    }
});

export default router;
