import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function NavBar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-semibold text-slate-900">
          NutriFit AI
        </Link>

        <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <Link to="/" className="hover:text-slate-900">
            Home
          </Link>
          <Link to="/dashboard" className="hover:text-slate-900">
            Nutrition Plans
          </Link>
          <Link to="/photo-calorie" className="hover:text-slate-900">
            Photo Calorie
          </Link>
          <Link to="/voice-summary" className="hover:text-slate-900">
            Voice Summary
          </Link>
          <Link to="/health" className="hover:text-slate-900">
            Health Assistant
          </Link>
          <Link to="/auth" className="hover:text-slate-900">
            Login
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 sm:inline-block">
                {user.name}
              </span>
              <button
                onClick={logout}
                className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/signup"
              className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              Sign Up
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default NavBar;
