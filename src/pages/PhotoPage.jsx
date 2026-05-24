import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const API_BASE_URL = "http://localhost:5000/api";

function PhotoPage() {
  const { user, token } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [analysisText, setAnalysisText] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch history when component mounts or token changes
  useEffect(() => {
    if (token) {
      fetchHistory();
    }
  }, [token]);

  const fetchHistory = async () => {
    if (!token) return;
    setLoadingHistory(true);
    try {
      const response = await fetch(`${API_BASE_URL}/photo/history`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const previewUrl = useMemo(() => {
    if (!selectedImage) return null;
    return URL.createObjectURL(selectedImage);
  }, [selectedImage]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) processImage(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
  };

  const processImage = async (file) => {
    if (!token) {
      setError("Please sign in to analyze photos");
      return;
    }

    setSelectedImage(file);
    setShowResults(false);
    setAnalysisText("");
    setError("");
    setLoading(true);

    try {
      const form = new FormData();
      form.append("file", file);

      const response = await fetch(`${API_BASE_URL}/photo/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Analysis failed");
      }

      const data = await response.json();
      setAnalysisText(
        `Detected Foods:\n${data.data.detectedFoods
          .map((f) => `- ${f.name} (${f.quantity})`)
          .join(
            "\n",
          )}\n\nNutrition:\n- Calories: ${data.data.nutritionData.calories} kcal\n- Protein: ${data.data.nutritionData.protein}g\n- Carbs: ${data.data.nutritionData.carbs}g\n- Fat: ${data.data.nutritionData.fat}g\n- Fiber: ${data.data.nutritionData.fiber}g`,
      );
      setShowResults(true);
      await fetchHistory(); // Refresh history
    } catch (err) {
      setError("Analysis failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeAnother = () => {
    setSelectedImage(null);
    setShowResults(false);
    setAnalysisText("");
    setError("");
    setLoading(false);
  };

  // Parse markdown-style text into sections for nice display
  const renderAnalysis = (text) => {
    const lines = text.split("\n").filter((l) => l.trim() !== "");
    return lines.map((line, i) => {
      if (line.startsWith("### ")) {
        return (
          <h3
            key={i}
            className="mt-6 text-lg font-bold text-slate-900 first:mt-0"
          >
            {line.replace("### ", "")}
          </h3>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2
            key={i}
            className="mt-6 text-xl font-bold text-slate-900 first:mt-0"
          >
            {line.replace("## ", "")}
          </h2>
        );
      }
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <p key={i} className="mt-3 font-semibold text-slate-800">
            {line.replace(/\*\*/g, "")}
          </p>
        );
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <li
            key={i}
            className="mt-2 flex items-start gap-2 text-sm text-slate-700"
          >
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-sky-500 flex-shrink-0" />
            <span>{line.replace(/^[-*] /, "").replace(/\*\*/g, "")}</span>
          </li>
        );
      }
      return (
        <p key={i} className="mt-2 text-sm leading-6 text-slate-700">
          {line.replace(/\*\*/g, "")}
        </p>
      );
    });
  };

  if (!token) {
    return (
      <section className="space-y-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <h1 className="text-3xl font-semibold text-slate-900">
            Photo calorie recognition
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Upload a meal photo and NutriFit AI will instantly estimate
            calories.
          </p>
        </div>

        <div className="rounded-[2rem] border border-sky-200 bg-sky-50 p-8 text-center">
          <p className="text-slate-700 font-semibold">
            Sign in to use Photo Calorie
          </p>
          <div className="mt-4 flex gap-4 justify-center flex-wrap">
            <Link
              to="/auth"
              className="inline-flex rounded-3xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="inline-flex rounded-3xl border border-sky-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-sky-300"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-semibold text-slate-900">
          Photo calorie recognition
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Upload a meal photo and NutriFit AI will instantly estimate calories,
          detect ingredients, and provide a detailed nutrition breakdown.
        </p>
      </div>

      {/* Upload Area */}
      {!showResults && !loading && (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative rounded-[2rem] border-4 border-dashed p-12 text-center transition ${
              dragActive
                ? "border-sky-500 bg-sky-50"
                : "border-slate-300 bg-slate-50 hover:border-sky-400"
            }`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
                <span className="text-3xl">📸</span>
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  Drag & drop your meal photo
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  or click to browse from your device
                </p>
              </div>
              <button className="mt-4 rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700">
                Upload Photo
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm font-medium text-red-600">{error}</p>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-12 shadow-soft">
          <div className="flex flex-col items-center gap-6">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Uploaded meal"
                className="h-64 w-full max-w-sm rounded-[2rem] object-cover border border-slate-200"
              />
            )}
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />
              <p className="text-sm font-medium text-slate-600">
                Analyzing meal...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {showResults && previewUrl && !loading && (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-2xl font-semibold text-slate-900">
              Analysis Result
            </h2>
            <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              ✓ Analysis Complete
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
            {/* Image */}
            <div className="overflow-hidden rounded-[2rem] border border-slate-200">
              <img
                src={previewUrl}
                alt="Meal analysis"
                className="h-full w-full object-cover max-h-96"
              />
            </div>

            {/* Analysis */}
            <div className="rounded-[2rem] bg-slate-50 border border-slate-200 p-6 overflow-y-auto max-h-[32rem]">
              <ul className="space-y-0">{renderAnalysis(analysisText)}</ul>
            </div>
          </div>

          <button
            onClick={handleAnalyzeAnother}
            className="mt-8 w-full rounded-3xl border-2 border-sky-600 bg-white px-6 py-3 text-sm font-semibold text-sky-600 transition hover:bg-sky-50"
          >
            Analyze Another Photo
          </button>
        </div>
      )}

      {/* History Section */}
      {history.length > 0 && (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <h2 className="text-2xl font-semibold text-slate-900">
            Analysis History
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Your recent photo analyses
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((item) => (
              <div
                key={item._id}
                className="rounded-[2rem] border border-slate-200 bg-slate-50 p-4 hover:border-sky-300 transition"
              >
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {item.filename}
                </p>
                <p className="mt-2 text-xs text-slate-600">
                  {item.detectedFoods?.length || 0} foods detected
                </p>
                <p className="mt-1 text-xs font-medium text-slate-700">
                  {item.nutritionData?.calories || 0} kcal
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default PhotoPage;
