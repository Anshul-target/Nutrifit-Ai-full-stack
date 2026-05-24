import mongoose from "mongoose";

const voiceAnalysisSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        filename: {
            type: String,
            required: true,
        },
        audioUrl: {
            type: String,
            required: true,
        },
        summary: {
            type: String,
        },
        transcript: {
            type: String,
        },
        toneEmotion: {
            primary: String,
            secondary: [String],
            confidence: Number,
        },
        keyHealthConcerns: [
            {
                label: String,
                evidence: String,
                confidence: Number,
            },
        ],
        dietaryHabits: [
            {
                label: String,
                details: String,
            },
        ],
        suggestedImprovements: [String],
        personalizedNutrition: {
            calorieTarget: Number,
            hydrationLPerDay: Number,
            macroSplit: {
                proteinPct: Number,
                carbPct: Number,
                fatPct: Number,
            },
            sampleMealPlan: [String],
        },
        followUpQuestions: [String],
        analysisDate: {
            type: Date,
            default: Date.now,
        },
        externalResponse: mongoose.Schema.Types.Mixed,
    },
    { timestamps: true }
);

const VoiceAnalysis = mongoose.model("VoiceAnalysis", voiceAnalysisSchema);
export default VoiceAnalysis;
