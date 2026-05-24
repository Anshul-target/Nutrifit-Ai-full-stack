import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const { forgotPassword, status } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    const result = await forgotPassword(email);
    setMessage(result.message);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-96px)] max-w-4xl flex-col justify-center gap-12 py-12">
      <div className="rounded-[2rem] bg-white px-8 py-10 shadow-soft sm:px-12">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">
            Forgot your password?
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Enter your email and we will send a reset link so you can access
            your wellness dashboard again.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {message && <p className="text-sm text-slate-700">{message}</p>}

          <button
            type="submit"
            className="w-full rounded-3xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            {status === "loading" ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Remembered your password?{" "}
          <Link
            to="/auth"
            className="font-semibold text-sky-700 hover:text-sky-900"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
