import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import VoiceAnalysis from "../models/VoiceAnalysis.js";
import { protect } from "../middleware/auth.js";
import { analyzeVoice } from "../services/voiceAnalysis.js";

dotenv.config();

const router = express.Router();

// Disk storage to allow file streaming and cleanup
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname) || "";
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
    },
});

// Limits: default 25MB (configurable via env MAX_UPLOAD_MB)
const MAX_UPLOAD_MB = parseInt(process.env.MAX_UPLOAD_MB || "25", 10);
const upload = multer({
    storage,
    limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = [
            "audio/mpeg",
            "audio/mp3",
            "audio/wav",
            "audio/x-wav",
            "audio/mp4",
            "audio/x-m4a",
            "audio/webm",
            "audio/ogg",
        ];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Unsupported audio type"));
        }
        cb(null, true);
    },
});

// POST /api/voice/analyze
router.post("/analyze", protect, upload.single("audio"), async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "audio file (field 'audio') required" });

    const filePath = file.path;
    const mimeType = file.mimetype;

    try {
        // Call service which uses official Gemini SDK
        const { json, raw } = await analyzeVoice(filePath, mimeType);

        // Validate expected fields and coerce shapes
        const payload = {
            userId: req.userId,
            filename: file.originalname,
            audioUrl: `/uploads/${path.basename(filePath)}`,
            summary: json.summary || null,
            transcript: json.transcript || null,
            toneEmotion: json.tone_emotion || null,
            keyHealthConcerns: json.key_health_concerns || [],
            dietaryHabits: json.dietary_habits || [],
            suggestedImprovements: json.suggested_improvements || [],
            personalizedNutrition: json.personalized_nutrition || {},
            followUpQuestions: json.follow_up_questions || [],
            externalResponse: { raw },
        };

        const analysis = new VoiceAnalysis(payload);
        await analysis.save();

        // With this:
        return res.status(201).json({
            _id: analysis._id,
            filename: analysis.filename,
            summary: analysis.summary,
            transcript: analysis.transcript,
            tone_emotion: analysis.toneEmotion,
            key_health_concerns: analysis.keyHealthConcerns,
            dietary_habits: analysis.dietaryHabits,
            suggested_improvements: analysis.suggestedImprovements,
            personalized_nutrition: analysis.personalizedNutrition,
            follow_up_questions: analysis.followUpQuestions,
            createdAt: analysis.createdAt,
        });
    } catch (err) {
        console.error("Voice analyze error:", err?.message || err);
        // best-effort cleanup
        try {
            if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch (cleanupErr) {
            console.warn("Cleanup error", cleanupErr?.message || cleanupErr);
        }

        // map multer size error
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({ error: "Uploaded file too large" });
        }

        return res.status(500).json({ error: err.message || "Analysis failed" });
    }
});

// GET /api/voice/history
router.get("/history", protect, async (req, res) => {
    try {
        const analyses = await VoiceAnalysis.find({ userId: req.userId }).sort({ createdAt: -1 }).select("-externalResponse");
        return res.json(
            analyses.map((a) => ({
                _id: a._id,
                summary: a.summary,
                transcript: a.transcript,
                tone_emotion: a.toneEmotion,
                key_health_concerns: a.keyHealthConcerns,
                dietary_habits: a.dietaryHabits,
                suggested_improvements: a.suggestedImprovements,
                personalized_nutrition: a.personalizedNutrition,
                follow_up_questions: a.followUpQuestions,
                createdAt: a.createdAt,
            }))
        );
    } catch (err) {
        console.error("History error", err?.message || err);
        return res.status(500).json({ error: err.message });
    }
});

export default router;
