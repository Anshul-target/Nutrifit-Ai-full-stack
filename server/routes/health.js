import express from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Python medical chatbot API URL (running on port 5001)
const PYTHON_HEALTH_API = process.env.PYTHON_HEALTH_API || "http://localhost:5001";

// Configure multer for image uploads (memory storage for streaming)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        // Only accept image files
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }
    },
});

/**
 * POST /api/ask-health
 * Accept text question + optional medical image
 * Forward to Python backend with embeddings/Pinecone lookup
 */
router.post("/question", protect, upload.single("image"), async (req, res) => {
    const { question } = req.body;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
        return res.status(400).json({ error: "question (text) is required" });
    }

    try {
        // Build FormData to send to Python API
        const formData = new FormData();
        formData.append("question", question);

        // Add image if provided
        if (req.file) {
            formData.append("image", req.file.buffer, {
                filename: req.file.originalname,
                contentType: req.file.mimetype,
            });
        }

        // Forward request to Python medical chatbot
        const pythonResponse = await axios.post(
            `${PYTHON_HEALTH_API}/api/ask-health`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    "Content-Type": "multipart/form-data",
                },
                timeout: 30000, // 30 second timeout
            }
        );

        // Return Python API response directly
        return res.status(200).json({
            success: true,
            data: pythonResponse.data,
        });
    } catch (err) {
        console.error("Health question error:", err.message);

        // Handle Python API errors
        if (err.response) {
            // Python API returned an error
            return res.status(err.response.status).json({
                success: false,
                error: err.response.data?.error || err.response.data?.message || "Health AI error",
                details: err.response.data,
            });
        }

        if (err.code === "ECONNREFUSED") {
            return res.status(503).json({
                success: false,
                error: "Medical AI service unavailable",
                details: "Python health API not responding on port 5001",
            });
        }

        return res.status(500).json({
            success: false,
            error: err.message || "Failed to get health answer",
        });
    }
});

/**
 * POST /api/ask-health-text
 * Text-only variant (no image handling)
 */
router.post("/question-text", protect, async (req, res) => {
    const { question } = req.body;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
        return res.status(400).json({ error: "question (text) is required" });
    }

    try {
        // Send text-only to Python API
        const pythonResponse = await axios.post(
            `${PYTHON_HEALTH_API}/api/ask-health-text`,
            { question },
            {
                headers: { "Content-Type": "application/json" },
                timeout: 30000,
            }
        );

        return res.status(200).json({
            success: true,
            data: pythonResponse.data,
        });
    } catch (err) {
        console.error("Health text question error:", err.message);

        if (err.response) {
            return res.status(err.response.status).json({
                success: false,
                error: err.response.data?.error || "Health AI error",
                details: err.response.data,
            });
        }

        if (err.code === "ECONNREFUSED") {
            return res.status(503).json({
                success: false,
                error: "Medical AI service unavailable",
                details: "Python health API not responding",
            });
        }

        return res.status(500).json({
            success: false,
            error: err.message || "Failed to get health answer",
        });
    }
});

/**
 * GET /api/health-status
 * Check if Python medical AI is running
 */
router.get("/status", async (req, res) => {
    try {
        const healthCheck = await axios.get(`${PYTHON_HEALTH_API}/health`, {
            timeout: 5000,
        });
        return res.json({ status: "ok", python_api: healthCheck.data });
    } catch (err) {
        return res.status(503).json({
            status: "unavailable",
            error: "Python health API not responding",
            python_api_url: PYTHON_HEALTH_API,
        });
    }
});

export default router;
