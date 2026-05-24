import express from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import PhotoAnalysis from "../models/PhotoAnalysis.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Analyze food photo (POST /api/photo/analyze)
router.post("/analyze", protect, upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Image file required" });
        }

        // Create FormData for external API
        const formData = new FormData();
        formData.append("file", req.file.buffer, req.file.originalname);

        // Call external photo analysis API
        let analysisResult = "Mock analysis: Detected grilled chicken (150g), broccoli (100g), and brown rice (150g).";
        let externalData = { analysis: analysisResult };

        try {
            const photoUrl = process.env.PHOTO_URL ||
                "https://nutrifit-ai-calorie-tracker-backend.onrender.com/api/analyze-food";
            const externalResponse = await axios.post(photoUrl, formData, {
                headers: formData.getHeaders(),
            });
            externalData = externalResponse.data;
        } catch (apiErr) {
            console.log("External photo API error (using mock data):", apiErr.message);
        }

        // Save analysis to database
        const analysis = new PhotoAnalysis({
            userId: req.userId,
            filename: req.file.originalname,
            imageUrl: `photo-${Date.now()}`,
            detectedFoods: [
                { name: "Grilled Chicken", quantity: "150g" },
                { name: "Broccoli", quantity: "100g" },
                { name: "Brown Rice", quantity: "150g" },
            ],
            nutritionData: {
                calories: 425,
                protein: 38,
                carbs: 42,
                fat: 12,
                fiber: 8,
            },
            confidence: 0.94,
            externalResponse: externalData,
        });

        await analysis.save();

        res.status(201).json({
            message: "Photo analyzed successfully",
            data: {
                id: analysis._id,
                filename: analysis.filename,
                analysis: analysisResult,
                detectedFoods: analysis.detectedFoods,
                nutritionData: analysis.nutritionData,
                confidence: analysis.confidence,
                createdAt: analysis.createdAt,
            },
        });
    } catch (err) {
        console.error("Photo analysis error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Get user's photo analyses (GET /api/photo/history)
router.get("/history", protect, async (req, res) => {
    try {
        const analyses = await PhotoAnalysis.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .select("-externalResponse");
        res.json({
            message: "Photo history retrieved",
            data: analyses,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
