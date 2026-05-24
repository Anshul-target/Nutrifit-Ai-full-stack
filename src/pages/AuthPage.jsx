import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import OAuthButtons from "../components/OAuthButtons.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function AuthPage() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login, status } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const result = await login(credentials);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-96px)] max-w-4xl flex-col justify-center gap-12 py-12">
      <div className="rounded-[2rem] bg-white px-8 py-10 shadow-soft sm:px-12">
        <div className="mb-8 flex flex-col gap-4 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">
            Welcome back to NutriFit AI
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-6 text-slate-600">
            Log in to continue tracking your calories, meal plans, and
            AI-powered wellness insights.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6">
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Login
            </p>
          </div>
          <div className="text-sm text-slate-500">
            New here?{" "}
            <Link
              to="/signup"
              className="font-semibold text-sky-700 hover:text-sky-900"
            >
              Create account
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
              required
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              required
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-between gap-4">
            <button
              type="submit"
              className="rounded-3xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              {status === "loading" ? "Signing in..." : "Sign in"}
            </button>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Forgot password?
            </Link>
          </div>
        </form>

        <div className="mt-10 border-t border-slate-200 pt-8">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            Or continue with
          </p>
          <OAuthButtons />
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
