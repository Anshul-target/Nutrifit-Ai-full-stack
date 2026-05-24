import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function generatePersonalizedNutrition(userProfile) {
    const { age, weight, height, gender, goal, activityLevel, dietaryPreference } = userProfile;

    const prompt = `You are a professional nutritionist and fitness expert. Based on the following user profile, create a personalized daily nutrition plan.

User Profile:
- Age: ${age} years
- Weight: ${weight} kg
- Height: ${height} cm
- Gender: ${gender}
- Goal: ${goal}
- Activity Level: ${activityLevel}
- Dietary Preference: ${dietaryPreference}

Return ONLY valid JSON, no markdown, no code blocks:
{
  "dailySummary": { "calories": 2000, "protein": 150, "hydration": 3.5 },
  "macroBreakdown": {
    "protein": { "grams": 150, "percentage": 30 },
    "carbs": { "grams": 250, "percentage": 50 },
    "fats": { "grams": 65, "percentage": 20 }
  },
  "activePlan": "Balanced Health Plan",
  "meals": [
    { "name": "Breakfast Name", "calories": 450, "description": "short description", "ingredients": ["item1", "item2", "item3"] },
    { "name": "Lunch Name", "calories": 550, "description": "short description", "ingredients": ["item1", "item2", "item3"] },
    { "name": "Dinner Name", "calories": 650, "description": "short description", "ingredients": ["item1", "item2", "item3"] }
  ],
  "nutritionTips": ["tip1", "tip2", "tip3"],
  "progressPercentages": { "protein": 0, "calories": 0, "hydration": 0 }
}`;

    const modelsToTry = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro-latest",
    ];

    let responseText = null;

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName }); // ← genAI not client
            const result = await model.generateContent(prompt);
            responseText = result.response.text();
            console.log(`✅ Used model: ${modelName}`);
            break;
        } catch (err) {
            if (
                err.message?.includes("429") ||
                err.message?.includes("quota") ||
                err.message?.includes("503") ||
                err.message?.includes("overloaded")
            ) {
                console.warn(`⚠️ ${modelName} unavailable, trying next...`);
                continue;
            }
            throw err;
        }
    }

    if (!responseText) {
        throw new Error("All Gemini models quota exceeded. Please try again later.");
    }

    // Parse JSON safely
    const cleaned = responseText
        .replace(/^```json\n?/i, "")
        .replace(/\n?```$/i, "")
        .trim();

    const match = cleaned.match(/\{[\s\S]*\}/);
    const jsonString = match ? match[0] : cleaned;

    try {
        return JSON.parse(jsonString);
    } catch (err) {
        console.error("JSON parse error:", err.message);
        throw new Error("Failed to parse AI response");
    }
}