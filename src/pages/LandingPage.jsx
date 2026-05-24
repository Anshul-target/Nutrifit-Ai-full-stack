import { Link } from "react-router-dom";
import FeatureCard from "../components/FeatureCard.jsx";

const landingFeatures = [
  {
    title: "AI-driven meal plans",
    description:
      "Personalized nutrition plans built around your lifestyle and goals.",
    icon: "🍽️",
  },
  {
    title: "Photo calorie scanner",
    description:
      "Upload meal photos and get fast calorie estimates with AI assistance.",
    icon: "📷",
  },
  {
    title: "Voice health check-ins",
    description:
      "Record a quick voice note and get a wellness summary instantly.",
    icon: "🎧",
  },
  {
    title: "Progress dashboard",
    description:
      "Track calories, macros, hydration, and daily momentum at a glance.",
    icon: "📊",
  },
];

function LandingPage() {
  return (
    <div className="space-y-16 py-10 lg:py-16">
      <section className="rounded-[2rem] bg-white p-8 shadow-soft sm:p-12">
        <div className="grid gap-10 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">
              NutriFit AI — wellness made simple
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                Personalized nutrition, powered by AI.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                NutriFit AI helps you stay on track with meals, calorie
                analysis, and voice-driven wellness summaries — all from one
                modern dashboard.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/auth"
                className="inline-flex items-center justify-center rounded-3xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                Start free trial
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
              >
                Join NutriFit
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="overflow-hidden rounded-[2rem] bg-slate-100 p-4">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
                alt="Healthy meal plan"
                className="h-72 w-full rounded-[1.5rem] object-cover"
              />
            </div>
            <div className="grid gap-4">
              <div className="overflow-hidden rounded-[2rem] bg-slate-100 p-4">
                <img
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80"
                  alt="Nutrition dashboard"
                  className="h-32 w-full rounded-[1.5rem] object-cover"
                />
              </div>
              <div className="overflow-hidden rounded-[2rem] bg-slate-100 p-4">
                <img
                  src="https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80"
                  alt="Voice wellness check"
                  className="h-32 w-full rounded-[1.5rem] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-white p-8 shadow-soft">
          <h2 className="text-3xl font-semibold text-slate-900">
            Why NutriFit AI?
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Start with a smart nutrition assistant that learns from your meals,
            voice updates, and preferences. Use the dashboard to stay motivated
            and make healthier choices every day.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-4 rounded-3xl bg-slate-50 p-5">
              <div className="mt-1 h-10 w-10 rounded-3xl bg-sky-100 text-center text-xl text-sky-700">
                🚀
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  Fast onboarding
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Set up your profile and start seeing meal suggestions
                  immediately.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-3xl bg-slate-50 p-5">
              <div className="mt-1 h-10 w-10 rounded-3xl bg-emerald-100 text-center text-xl text-emerald-700">
                🧠
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  AI-powered insights
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Leverage intelligent summaries for your meals, calories, and
                  voice health check-ins.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-3xl bg-slate-50 p-5">
              <div className="mt-1 h-10 w-10 rounded-3xl bg-violet-100 text-center text-xl text-violet-700">
                ❤️
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  Built for wellness
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Keep calories, hydration, and meal quality aligned with your
                  goals.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {landingFeatures.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] bg-slate-900 px-8 py-12 text-white shadow-soft sm:px-12">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-sky-300">
              Ready for your next step?
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
              Start building better nutrition habits with AI support.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Create your account now and access meal planning, photo analysis,
              and voice summaries in one place.
            </p>
            <Link
              to="/signup"
              className="mt-8 inline-flex items-center justify-center rounded-3xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Create your free account
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <img
              src="https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=800&q=80"
              alt="Healthy food"
              className="h-44 w-full rounded-[1.75rem] object-cover"
            />
            <img
              src="https://images.unsplash.com/photo-1516685018646-549d1c5f243c?auto=format&fit=crop&w=800&q=80"
              alt="Wellness summary"
              className="h-44 w-full rounded-[1.75rem] object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
