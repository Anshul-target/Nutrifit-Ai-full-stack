import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://localhost:5000/api";
const ANALYZE_URL = `${API_BASE}/voice/analyze`;
const HISTORY_URL = `${API_BASE}/voice/history`;

function VoicePage() {
  const [audioFile, setAudioFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const { token, user } = useAuth();

  const handleUpload = (e) => {
    setAudioFile(e.target.files?.[0] || null);
    setResult(null);
    setError("");
  };

  const generateSummary = async () => {
    if (!audioFile) return;
    if (!token) {
      setError("Please login to analyze audio.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const form = new FormData();
      form.append("audio", audioFile);
      form.append("include_pdf", "false");

      const response = await fetch(ANALYZE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      setResult(data);
      // prepend to history if saved analysis returned
      try {
        setHistory((h) => [data, ...(Array.isArray(h) ? h : [])]);
      } catch (err) {
        // no-op
      }
    } catch (err) {
      setError(err.message || "Analysis failed.");
      console.error("Full error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!token) return;
    setLoadingHistory(true);
    setHistoryError("");
    try {
      const res = await fetch(HISTORY_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`History fetch failed: ${res.status}`);
      const json = await res.json();
      setHistory(
        Array.isArray(json) ? json : (json.data ?? json.history ?? []),
      );
    } catch (err) {
      setHistoryError(err.message || "Failed to load history");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (token) fetchHistory();
  }, [token]);

  const analysis = result || null;

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-semibold text-slate-900">
          Voice wellness summary
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Upload a dietician-client audio consultation. NutriFit AI will analyze
          tone, dietary habits, health concerns, and generate a personalized
          nutrition plan.
        </p>
      </div>

      {/* Upload */}
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
        <label className="mb-4 inline-block text-sm font-medium text-slate-700">
          Upload audio note (MP3, WAV, M4A, OGG, WEBM)
        </label>
        <input
          type="file"
          accept="audio/*,.mpeg,.opus,.ogg,.m4a,.mp3,.wav,.webm"
          onChange={handleUpload}
          className="block w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
        />

        {audioFile && (
          <div className="mt-4 rounded-3xl bg-slate-50 border border-slate-200 px-5 py-4 text-sm text-slate-600">
            <span className="font-semibold text-slate-800">Selected:</span>{" "}
            {audioFile.name}
          </div>
        )}

        <button
          onClick={generateSummary}
          disabled={!audioFile || loading}
          className="mt-6 w-full rounded-3xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? "Analyzing audio... please wait" : "Generate Summary"}
        </button>

        {error && (
          <p className="mt-4 text-sm text-red-600 font-medium">{error}</p>
        )}
      </div>

      {/* History */}
      <div>
        <div className="mt-4" />
        <div className="rounded-[1rem] bg-white p-4">
          <h4 className="text-sm font-semibold text-slate-800">
            Recent Analyses
          </h4>
          {loadingHistory && (
            <p className="text-xs text-slate-500">Loading history…</p>
          )}
          {historyError && (
            <p className="text-xs text-red-600">{historyError}</p>
          )}
          {!loadingHistory && history.length === 0 && (
            <p className="text-xs text-slate-500 mt-2">No analyses yet.</p>
          )}
          <div className="mt-2 space-y-2">
            {(Array.isArray(history) ? history : []).map((h, idx) => (
              <button
                key={h._id || idx}
                onClick={() => setResult(h)}
                className="w-full text-left rounded-2xl border border-slate-100 px-4 py-3 text-sm hover:bg-slate-50"
              >
                <div className="flex items-center justify-between">
                  <div className="text-slate-800">
                    {h.summary?.slice(0, 80) || "Audio analysis"}
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(h.createdAt).toLocaleString()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-12 shadow-soft flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />
          <p className="text-sm text-slate-600">
            NutriFit AI is analyzing your audio via Gemini...
          </p>
        </div>
      )}

      {/* Results */}
      {analysis && !loading && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
            <h2 className="text-2xl font-semibold text-slate-900">
              Consultation Summary
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              {analysis.summary}
            </p>

            {/* Tone */}
            {analysis.tone_emotion && (
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-800">
                  🎭 Tone: {analysis.tone_emotion.primary}
                </span>
                {analysis.tone_emotion.secondary?.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700"
                  >
                    {t}
                  </span>
                ))}
                <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
                  Confidence:{" "}
                  {Math.round(analysis.tone_emotion.confidence * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Health Concerns + Dietary Habits */}
          <div className="grid gap-6 lg:grid-cols-2">
            {analysis.key_health_concerns?.length > 0 && (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
                <h3 className="text-xl font-semibold text-slate-900">
                  🩺 Key Health Concerns
                </h3>
                <div className="mt-4 space-y-3">
                  {analysis.key_health_concerns.map((c, i) => (
                    <div
                      key={i}
                      className="rounded-3xl bg-red-50 border border-red-100 p-4"
                    >
                      <p className="font-semibold text-red-800">{c.label}</p>
                      <p className="mt-1 text-sm text-red-700">{c.evidence}</p>
                      <p className="mt-1 text-xs text-red-500">
                        Confidence: {Math.round(c.confidence * 100)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.dietary_habits?.length > 0 && (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
                <h3 className="text-xl font-semibold text-slate-900">
                  🥗 Dietary Habits
                </h3>
                <div className="mt-4 space-y-3">
                  {analysis.dietary_habits.map((h, i) => (
                    <div
                      key={i}
                      className="rounded-3xl bg-amber-50 border border-amber-100 p-4"
                    >
                      <p className="font-semibold text-amber-800">{h.label}</p>
                      <p className="mt-1 text-sm text-amber-700">{h.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Suggested Improvements */}
          {analysis.suggested_improvements?.length > 0 && (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
              <h3 className="text-xl font-semibold text-slate-900">
                💡 Suggested Improvements
              </h3>
              <ul className="mt-4 space-y-3">
                {analysis.suggested_improvements.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-sky-500 flex-shrink-0" />
                    <p className="text-sm text-slate-700">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Personalized Nutrition */}
          {analysis.personalized_nutrition && (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
              <h3 className="text-xl font-semibold text-slate-900">
                🎯 Personalized Nutrition Plan
              </h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-sky-50 p-5 text-center">
                  <p className="text-xs uppercase tracking-wide text-sky-600 font-semibold">
                    Calorie Target
                  </p>
                  <p className="mt-2 text-2xl font-bold text-sky-900">
                    {analysis.personalized_nutrition.calorie_target}
                  </p>
                </div>
                <div className="rounded-3xl bg-emerald-50 p-5 text-center">
                  <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">
                    Hydration
                  </p>
                  <p className="mt-2 text-2xl font-bold text-emerald-900">
                    {analysis.personalized_nutrition.hydration_l_per_day}L/day
                  </p>
                </div>
                <div className="rounded-3xl bg-violet-50 p-5 text-center">
                  <p className="text-xs uppercase tracking-wide text-violet-600 font-semibold">
                    Macro Split
                  </p>
                  <p className="mt-2 text-sm font-bold text-violet-900">
                    P:{" "}
                    {analysis.personalized_nutrition.macro_split?.protein_pct}%
                    &nbsp; C:{" "}
                    {analysis.personalized_nutrition.macro_split?.carb_pct}%
                    &nbsp; F:{" "}
                    {analysis.personalized_nutrition.macro_split?.fat_pct}%
                  </p>
                </div>
              </div>

              {analysis.personalized_nutrition.sample_meal_plan?.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-slate-700 mb-3">
                    Sample Meal Plan
                  </p>
                  <div className="space-y-2">
                    {analysis.personalized_nutrition.sample_meal_plan.map(
                      (meal, i) => (
                        <div
                          key={i}
                          className="rounded-3xl bg-slate-50 border border-slate-200 px-5 py-3 text-sm text-slate-700"
                        >
                          {meal}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Follow-up Questions */}
          {analysis.follow_up_questions?.length > 0 && (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
              <h3 className="text-xl font-semibold text-slate-900">
                ❓ Follow-up Questions
              </h3>
              <ul className="mt-4 space-y-3">
                {analysis.follow_up_questions.map((q, i) => (
                  <li
                    key={i}
                    className="rounded-3xl bg-slate-50 border border-slate-200 px-5 py-3 text-sm text-slate-700"
                  >
                    {i + 1}. {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Transcript */}
          {analysis.transcript && (
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
              <h3 className="text-xl font-semibold text-slate-900">
                📝 Full Transcript
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-600 whitespace-pre-wrap">
                {analysis.transcript}
              </p>
            </div>
          )}

          {/* Analyze Another */}
          <button
            onClick={() => {
              setAudioFile(null);
              setResult(null);
            }}
            className="w-full rounded-3xl border-2 border-sky-600 bg-white px-6 py-3 text-sm font-semibold text-sky-600 transition hover:bg-sky-50"
          >
            Analyze Another Audio
          </button>
        </div>
      )}
    </section>
  );
}

export default VoicePage;
