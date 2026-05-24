import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import photoRoutes from "./routes/photo.js";
import voiceRoutes from "./routes/voice.js";
import healthRoutes from "./routes/health.js";
import onboardingRoutes from "./routes/onboarding.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Database connection
mongoose
    // .connect(process.env.MONGO_URI)
    // .connect("mongodb://127.0.0.1:27017/nutrifit")
    // .connect("mongodb+srv://Anshul:Anshul@cluster0.oyhimut.mongodb.net/nutrifit?retryWrites=true&w=majority&appName=Cluster0")
    .connect("mongodb+srv://Anshul:Anshul@cluster0.oyhimut.mongodb.net/nutrifit?retryWrites=true&w=majority&appName=Cluster0", {
        serverSelectionTimeoutMS: 5000,
        family: 4  // ← force IPv4, fixes most DNS issues on Windows
    })
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.log("❌ MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/photo", photoRoutes);
app.use("/api/voice", voiceRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/onboarding", onboardingRoutes);

// Health check
app.get("/api/health", (req, res) => {
    res.json({ message: "🎉 NutriFit AI Backend is running" });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
