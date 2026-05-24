function OAuthButtons() {
  return (
    <div className="space-y-3">
      <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 transition hover:border-slate-300">
        <img
          src="https://www.svgrepo.com/show/475656/google.svg"
          alt="Google logo"
          className="h-5 w-5"
        />
        Continue with Google
      </button>
      <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-900 px-4 py-3 text-white transition hover:bg-slate-800">
        <span className="text-xl"></span>
        Continue with Apple
      </button>
    </div>
  );
}

export default OAuthButtons;
