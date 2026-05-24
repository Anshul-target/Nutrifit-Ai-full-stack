import mongoose from "mongoose";

const photoAnalysisSchema = new mongoose.Schema(
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
        imageUrl: {
            type: String,
            required: true,
        },
        detectedFoods: [
            {
                name: String,
                quantity: String,
            },
        ],
        nutritionData: {
            calories: Number,
            protein: Number,
            carbs: Number,
            fat: Number,
            fiber: Number,
        },
        confidence: {
            type: Number,
            default: 0,
        },
        analysisDate: {
            type: Date,
            default: Date.now,
        },
        externalResponse: mongoose.Schema.Types.Mixed,
    },
    { timestamps: true }
);

const PhotoAnalysis = mongoose.model("PhotoAnalysis", photoAnalysisSchema);
export default PhotoAnalysis;
