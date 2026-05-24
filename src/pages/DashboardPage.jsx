import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import MealCard from "../components/MealCard.jsx";
import SummaryCard from "../components/SummaryCard.jsx";
import FeatureCard from "../components/FeatureCard.jsx";
import OnboardingModal from "../components/OnboardingModal.jsx";
import API_BASE from "../config.js";

const features = [
  {
    title: "Personalized meal plans",
    description:
      "AI-crafted meals that suit your dietary style and calorie goal.",
    icon: "🥗",
  },
  {
    title: "Photo calorie scan",
    description:
      "Upload a photo and let the system estimate the nutrition content.",
    icon: "📸",
  },
  {
    title: "Voice wellness summary",
    description: "Send a voice recording and receive a daily health summary.",
    icon: "🎙️",
  },
];

const API_BASE = `${API_BASE}/api`;

function DashboardPage() {
  const { user, token } = useAuth();
  const isGuest = !user;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [meals, setMeals] = useState([]);

  // Fetch dashboard data on mount
  useEffect(() => {
    if (isGuest || !token) {
      setLoading(false);
      return;
    }

    const fetchDashboard = async () => {
      try {
        const response = await fetch(`${API_BASE}/onboarding/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const result = await response.json();
        setOnboardingDone(result.onboardingDone);
        setProfile(result.profile);
        setDashboardData(result.dashboardData);

        // Set meals from dashboardData
        if (result.dashboardData?.meals) {
          const mealImages = [
            "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&fit=crop",
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&fit=crop",
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&fit=crop",
          ];

          setMeals(
            result.dashboardData.meals.map((meal, idx) => ({
              id: idx + 1,
              title: meal.name,
              image: mealImages[idx] || mealImages[0],
              calories: meal.calories,
              description: meal.description,
              ingredients: meal.ingredients || [],
            })),
          );
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token, isGuest]);

  const handleRegenerate = (id) => {
    setMeals((current) =>
      current.map((meal) =>
        meal.id === id
          ? {
              ...meal,
              description:
                "Updated meal suggestion with richer veggies and protein.",
              calories: meal.calories + 30,
            }
          : meal,
      ),
    );
  };

  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  // Show onboarding modal if not done
  if (!isGuest && !loading && onboardingDone === false) {
    return <OnboardingModal />;
  }

  // Loading state
  if (loading) {
    return (
      <section className="space-y-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </section>
    );
  }

  // Guest or error state
  if (isGuest) {
    return (
      <section className="space-y-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                {greeting}
              </p>
              <h1 className="mt-4 text-4xl font-semibold text-slate-900">
                Explore our nutrition plans
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Browse sample meal plans and see how NutriFit AI organizes your
                daily calories. Sign in to personalize your recommendations.
              </p>
            </div>
          </div>
          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-700">
            <p className="text-sm font-semibold text-slate-900">
              📋 Preview mode
            </p>
            <p className="mt-2 text-sm leading-6">
              Sign in to save your progress, generate tailored plans, and unlock
              full AI meal recommendations.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="inline-flex rounded-3xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Build dynamic dailySummary from dashboardData
  const dailySummary = [
    {
      label: "Daily calories",
      value: dashboardData.dailySummary?.calories || 0,
      detail: `Your recommended goal for ${profile?.goal || "your goal"}`,
    },
    {
      label: "Protein",
      value: `${dashboardData.dailySummary?.protein || 0}g`,
      detail: `${dashboardData.macroBreakdown?.protein?.percentage || 0}% of daily intake`,
    },
    {
      label: "Hydration",
      value: `${dashboardData.dailySummary?.hydration || 0}L`,
      detail: "Stay consistent throughout the day",
    },
  ];

  // Build macroBreakdown with colors
  const macroBreakdown = [
    {
      label: "Protein",
      value: `${dashboardData.macroBreakdown?.protein?.grams || 0}g`,
      percentage: dashboardData.macroBreakdown?.protein?.percentage || 0,
      color: "bg-pink-500",
      detail: `${dashboardData.macroBreakdown?.protein?.percentage || 0}% of daily intake`,
    },
    {
      label: "Carbs",
      value: `${dashboardData.macroBreakdown?.carbs?.grams || 0}g`,
      percentage: dashboardData.macroBreakdown?.carbs?.percentage || 0,
      color: "bg-amber-500",
      detail: `${dashboardData.macroBreakdown?.carbs?.percentage || 0}% of daily intake`,
    },
    {
      label: "Fats",
      value: `${dashboardData.macroBreakdown?.fats?.grams || 0}g`,
      percentage: dashboardData.macroBreakdown?.fats?.percentage || 0,
      color: "bg-emerald-500",
      detail: `${dashboardData.macroBreakdown?.fats?.percentage || 0}% of daily intake`,
    },
  ];

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
              {greeting}
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-slate-900">
              Welcome back, {user?.name || "Champion"}.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Your AI-personalized plan is ready. Review your daily goals,
              manage meals, and track your progress towards{" "}
              {profile?.goal?.toLowerCase() || "your goal"}.
            </p>
          </div>
          <div className="rounded-3xl bg-sky-100 px-6 py-5 text-sky-900 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em]">Active plan</p>
            <p className="mt-3 text-3xl font-semibold">
              {dashboardData?.activePlan || "Personalized Plan"}
            </p>
            <p className="mt-2 text-sm text-slate-700">
              Tailored for {profile?.goal?.toLowerCase()} and{" "}
              {profile?.dietaryPreference?.toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {dailySummary.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
        <h2 className="text-2xl font-semibold text-slate-900">
          Macro breakdown
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Your daily macronutrient distribution to support your{" "}
          {profile?.goal?.toLowerCase() || "fitness goals"}.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {macroBreakdown.map((macro) => (
            <div
              key={macro.label}
              className="space-y-4 rounded-3xl bg-slate-50 p-6"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">
                  {macro.label}
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {macro.value}
                </p>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full ${macro.color}`}
                    style={{ width: `${macro.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600">{macro.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <h3 className="text-xl font-semibold text-slate-900">
            Personalized tips
          </h3>
          <ul className="mt-6 space-y-4">
            {dashboardData?.nutritionTips?.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-4">
                <span className="text-2xl">
                  {idx === 0 ? "💡" : idx === 1 ? "🎯" : "⚡"}
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Tip {idx + 1}</p>
                  <p className="text-sm text-slate-600">{tip}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <h3 className="text-xl font-semibold text-slate-900">
            Your progress
          </h3>
          <div className="mt-6 space-y-5">
            {dashboardData?.progressPercentages && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-700">
                      Calorie tracking
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {dashboardData.progressPercentages.calories}%
                    </p>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-sky-500"
                      style={{
                        width: `${dashboardData.progressPercentages.calories}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-700">
                      Protein intake
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {dashboardData.progressPercentages.protein}%
                    </p>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-emerald-500"
                      style={{
                        width: `${dashboardData.progressPercentages.protein}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-700">
                      Hydration
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {dashboardData.progressPercentages.hydration}%
                    </p>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-violet-500"
                      style={{
                        width: `${dashboardData.progressPercentages.hydration}%`,
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Meals for today
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              AI-selected recipes optimized for{" "}
              {profile?.goal?.toLowerCase() || "your goals"}.
            </p>
          </div>
          <div className="text-sm text-slate-500">
            Tap regenerate to refresh a meal suggestion.
          </div>
        </div>

        {meals.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {meals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onRegenerate={handleRegenerate}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-slate-600">
              No meals available yet. Complete onboarding to generate your meal
              plan.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default DashboardPage;
