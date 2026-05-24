import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API_BASE from "../config.js";
function HealthChat() {
  const [messages, setMessages] = useState([]); // Chat history: { role, content, image?, timestamp }
  const [question, setQuestion] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiStatus, setApiStatus] = useState("checking");
  const messagesEndRef = useRef(null);
  const { token } = useAuth();

  const API_BASE = `${API_BASE}/api`;

  // Check if Python health API is available
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE}/health/status`);
        if (res.ok) {
          setApiStatus("connected");
        } else {
          setApiStatus("error");
        }
      } catch (err) {
        setApiStatus("error");
      }
    };
    checkHealth();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      setError("");
    } else {
      setError("Please select an image file");
      setSelectedImage(null);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    if (!token) {
      setError("Please login to ask health questions");
      return;
    }

    setError("");
    setLoading(true);

    // Add user message to chat
    const userMessage = {
      role: "user",
      content: question,
      image: selectedImage ? URL.createObjectURL(selectedImage) : null,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setSelectedImage(null);

    try {
      // Build FormData with question + optional image
      const formData = new FormData();
      formData.append("question", question);
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      // Send to backend proxy which forwards to Python API
      const response = await fetch(
        selectedImage
          ? `${API_BASE}/health/question`
          : `${API_BASE}/health/question-text`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // Only set Content-Type for JSON (no image).
            // For FormData (with image), let browser set it automatically.
            ...(!selectedImage && { "Content-Type": "application/json" }),
          },
          body: selectedImage
            ? formData // FormData for image upload
            : JSON.stringify({ question }), // JSON for text-only
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      const result = await response.json();
      console.log("Full response:", JSON.stringify(result, null, 2));

      // Extract answer from Python API response
      const answer =
        result.data?.answer ||
        result.data?.response ||
        result.data?.data?.answer ||
        result.data?.data?.response ||
        result.data?.message ||
        result.answer ||
        result.response ||
        JSON.stringify(result.data ?? result);

      // Add AI response to chat
      const aiMessage = {
        role: "assistant",
        content: answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Health chat error:", err);
      setError(err.message || "Failed to get health answer");

      // Add error message to chat
      const errorMessage = {
        role: "error",
        content: err.message || "An error occurred",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-semibold text-slate-900">
          Health Assistant
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Ask medical questions powered by AI. Get evidence-based health
          information with optional medical image analysis.
        </p>

        {/* Status indicator */}
        <div className="mt-4 flex items-center gap-2">
          <div
            className={`h-3 w-3 rounded-full ${
              apiStatus === "connected" ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm font-medium text-slate-700">
            {apiStatus === "connected" && "Medical AI Connected"}
            {apiStatus === "error" && "Medical AI Unavailable"}
            {apiStatus === "checking" && "Connecting..."}
          </span>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Conversation</h2>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Clear chat
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="mb-6 max-h-96 space-y-4 overflow-y-auto rounded-2xl bg-slate-50 p-4">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-slate-500">
              Ask a health question to get started...
            </p>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-sky-600 text-white"
                      : msg.role === "error"
                        ? "bg-red-100 text-red-800"
                        : "bg-slate-200 text-slate-900"
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="uploaded"
                      className="mb-2 max-h-32 rounded-lg"
                    />
                  )}
                  <p className="break-words text-sm leading-5">{msg.content}</p>
                  <span className="mt-2 block text-xs opacity-70">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 border border-red-100 p-4">
            <p className="text-sm text-red-700 font-medium">⚠️ {error}</p>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question Input */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Your Health Question
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., What are the symptoms of dehydration? What should I do after a workout?"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Attach Medical Image (Optional)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={loading}
                className="block flex-1 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm file:mr-2 file:rounded-full file:border-0 file:bg-sky-100 file:px-3 file:py-1 file:text-sm file:font-medium file:text-sky-700 hover:file:bg-sky-200"
              />
            </div>

            {/* Selected Image Preview */}
            {selectedImage && (
              <div className="mt-3 flex items-start gap-3 rounded-2xl bg-slate-50 border border-slate-100 p-3">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="preview"
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    {selectedImage.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(selectedImage.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-red-600 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!question.trim() || loading || apiStatus !== "connected"}
            className="w-full rounded-3xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? "Analyzing..." : "Ask Health Question"}
          </button>
        </form>
      </div>

      {/* Info Box */}
      <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-6">
        <h3 className="font-semibold text-blue-900">
          💡 Tips for Best Results
        </h3>
        <ul className="mt-2 space-y-1 text-sm text-blue-800">
          <li>• Be specific about your symptoms or health concerns</li>
          <li>
            • Provide relevant context (age, medical history, current
            medications)
          </li>
          <li>
            • Upload medical images for visual analysis (X-rays, lab results,
            etc.)
          </li>
          <li>
            • Always consult a healthcare professional for serious conditions
          </li>
        </ul>
      </div>
    </section>
  );
}

export default HealthChat;
