import fs from "fs";
import util from "util";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const unlink = util.promisify(fs.unlink);

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

// Initialize Gemini client (validation deferred to first call)
let client = null;

function getClient() {
    if (!GOOGLE_API_KEY || GOOGLE_API_KEY === "your_google_api_key_here") {
        throw new Error(
            "GOOGLE_API_KEY not configured. Get one at https://aistudio.google.com/app/apikey"
        );
    }
    if (!client) {
        client = new GoogleGenerativeAI(GOOGLE_API_KEY, {
            apiVersion: "v1"
        });
    }
    return client;
}

// Map file extensions/MIME types to Gemini audio MIME types
function getGeminiMimeType(userMimeType) {
    const mimeMap = {
        "audio/mpeg": "audio/mpeg",
        "audio/mp3": "audio/mpeg",
        "audio/wav": "audio/wav",
        "audio/x-wav": "audio/wav",
        "audio/mp4": "audio/mp4",
        "audio/x-m4a": "audio/mp4",
        "audio/webm": "audio/webm",
        "audio/ogg": "audio/ogg",
    };
    return mimeMap[userMimeType] || userMimeType;
}

// Strict JSON-only prompt
const ANALYSIS_PROMPT = `You are NutriFit AI. Analyze this audio consultation and return ONLY valid JSON with this exact structure (no explanations, no markdown, just JSON):
{
  "transcript": "full word-for-word transcription",
  "summary": "2-3 sentence professional summary",
  "key_health_concerns": [{"label": "concern name", "evidence": "what was said", "confidence": 0.85}],
  "dietary_habits": [{"label": "habit", "details": "description", "confidence": 0.8}],
  "suggested_improvements": ["actionable item 1", "actionable item 2"],
  "personalized_nutrition": {
    "calorie_target": "2000 kcal/day",
    "macro_split": {"protein_pct": 30, "carb_pct": 45, "fat_pct": 25},
    "sample_meal_plan": ["Breakfast: ...", "Lunch: ..."],
    "hydration_l_per_day": 2.5,
    "supplements": ["Vitamin D - for bone health"]
  },
  "follow_up_questions": ["Follow-up question 1?"],
  "tone_emotion": {"primary": "Concerned", "secondary": ["Engaged"], "confidence": 0.9}
}`;

/**
 * Clean JSON string by removing markdown wrappers and parse
 */
function parseJsonSafely(jsonStr) {
    if (!jsonStr || typeof jsonStr !== "string") {
        throw new Error("Invalid JSON input");
    }

    // Remove markdown code blocks if present
    let cleaned = jsonStr
        .replace(/^```json\n?/i, "")
        .replace(/\n?```$/i, "")
        .trim();

    // Try to find a JSON object if wrapped in text
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
        cleaned = match[0];
    }

    try {
        return JSON.parse(cleaned);
    } catch (parseErr) {
        throw new Error(
            `Failed to parse JSON from Gemini response: ${parseErr.message}`
        );
    }
}

/**
 * Analyze audio file using Gemini API (official SDK)
 * @param {string} filePath - Path to uploaded audio file on disk
 * @param {string} mimeType - MIME type of the audio file
 * @returns {Promise<{json: object, raw: string}>} Parsed analysis and raw response
 */
export async function analyzeVoice(filePath, mimeType) {
    if (!filePath) throw new Error("filePath required");
    if (!mimeType) throw new Error("mimeType required");

    // Validate API key before anything else
    const api = getClient();

    // Check file exists
    if (!fs.existsSync(filePath)) {
        throw new Error(`Audio file not found: ${filePath}`);
    }

    try {
        // Read audio file and convert to base64
        const audioBuffer = fs.readFileSync(filePath);
        const base64Audio = audioBuffer.toString("base64");
        const geminiMimeType = getGeminiMimeType(mimeType);

        const modelsToTry = [
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-2.0-flash-lite",
            "gemini-1.5-flash-latest",
        ];
        let response = null;

        for (const modelName of modelsToTry) {
            try {
                const model = api.getGenerativeModel({ model: modelName });
                response = await model.generateContent([
                    { inlineData: { mimeType: geminiMimeType, data: base64Audio } },
                    ANALYSIS_PROMPT,
                ]);
                console.log(`✅ Used model: ${modelName}`);
                break;
            } catch (err) {
                if (err.message?.includes("503") || err.message?.includes("overloaded")) {
                    console.warn(`⚠️ ${modelName} unavailable, trying next...`);
                    continue;
                }
                throw err;
            }
        }

        if (!response) throw new Error("All Gemini models unavailable. Try again later.");

        // Extract text response
        const textContent = response.response.text();
        if (!textContent) {
            throw new Error("No response text from Gemini");
        }

        // Parse JSON safely
        const parsedJson = parseJsonSafely(textContent);

        // Validate essential fields exist
        if (!parsedJson.transcript || !parsedJson.summary) {
            throw new Error("Missing required fields: transcript or summary");
        }

        return {
            json: parsedJson,
            raw: textContent,
        };
    } catch (err) {
        console.error("Gemini analysis error:", err.message);
        throw err;
    } finally {
        // Cleanup uploaded file
        try {
            if (filePath && fs.existsSync(filePath)) {
                await unlink(filePath);
            }
        } catch (cleanupErr) {
            console.warn("Cleanup error:", cleanupErr.message);
        }
    }
}
