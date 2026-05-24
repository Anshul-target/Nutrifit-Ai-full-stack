function FeatureCard({ title, description, icon }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-1">
      <div className="mb-4 h-12 w-12 rounded-3xl bg-sky-100 text-sky-700 flex items-center justify-center text-xl">
        {icon}
      </div>
      <h4 className="text-lg font-semibold text-slate-900">{title}</h4>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

export default FeatureCard;
