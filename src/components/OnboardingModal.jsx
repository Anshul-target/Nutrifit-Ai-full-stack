import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function OnboardingModal() {
  const { token, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    height: "",
    gender: "Male",
    goal: "Maintenance",
    activityLevel: "Moderately Active",
    dietaryPreference: "Non-Vegetarian",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleNext = () => {
    // Validate current step
    if (step === 1) {
      if (!formData.age || !formData.weight || !formData.height) {
        setError("Please fill in all fields");
        return;
      }
      if (formData.age < 13 || formData.age > 120) {
        setError("Please enter a valid age");
        return;
      }
      if (formData.weight < 20 || formData.weight > 300) {
        setError("Please enter a valid weight");
        return;
      }
      if (formData.height < 100 || formData.height > 250) {
        setError("Please enter a valid height");
        return;
      }
    }

    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/onboarding/complete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to complete onboarding");
      }

      const result = await response.json();

      // Update context with new user data
      updateUser({
        onboardingDone: true,
        profile: result.profile,
        dashboardData: result.dashboardData,
      });
      window.location.reload(); // ← ADD THIS
    } catch (err) {
      console.error("Onboarding error:", err);
      setError(err.message || "Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = (step / 3) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-screen max-w-2xl w-full overflow-y-auto rounded-[2rem] bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900">
            Welcome to NutriFit AI 🎯
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Let's create your personalized nutrition plan
          </p>

          {/* Progress Bar */}
          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-sky-600 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-medium text-slate-600">
            Step {step} of 3
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Physical Stats */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Physical Information
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Age (years)
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="25"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="70"
                    step="0.1"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    placeholder="175"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Goals & Activity */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Your Goals & Lifestyle
              </h2>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Primary Goal
                </label>
                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option>Weight Loss</option>
                  <option>Muscle Gain</option>
                  <option>Maintenance</option>
                  <option>Improve Stamina</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Activity Level
                </label>
                <select
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option>Sedentary</option>
                  <option>Lightly Active</option>
                  <option>Moderately Active</option>
                  <option>Very Active</option>
                </select>
              </div>

              <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Activity Level Tip:</strong> Sedentary = little/no
                  exercise, Lightly = 1-2 days/week, Moderately = 3-4 days/week,
                  Very = 5-7 days/week
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Dietary Preference */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Dietary Preference
              </h2>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Choose Your Preference
                </label>
                <select
                  name="dietaryPreference"
                  value={formData.dietaryPreference}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option>Vegetarian</option>
                  <option>Non-Vegetarian</option>
                  <option>Vegan</option>
                  <option>Keto</option>
                  <option>Paleo</option>
                </select>
              </div>

              <div className="space-y-3 rounded-2xl bg-green-50 border border-green-100 p-4">
                <p className="text-sm font-medium text-green-900">
                  ✅ Ready to Create Your Plan!
                </p>
                <p className="text-sm text-green-800">
                  Click "Complete Onboarding" and our AI will generate a
                  personalized nutrition plan just for you.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-100 p-4">
              <p className="text-sm font-medium text-red-800">❌ {error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="rounded-3xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="ml-auto rounded-3xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="ml-auto rounded-3xl bg-sky-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {loading ? "Creating Plan..." : "Complete Onboarding"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default OnboardingModal;
