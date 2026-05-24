function MealCard({ meal, onRegenerate }) {
  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-soft transition hover:-translate-y-1">
      <img
        src={meal.image}
        alt={meal.title}
        className="h-56 w-full object-cover"
      />
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between text-sm font-medium text-slate-500">
          <span>{meal.calories} kcal</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {meal.title}
          </span>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-900">{meal.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {meal.description}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">Ingredients</p>
          <ul className="flex flex-wrap gap-2 text-xs text-slate-500">
            {meal.ingredients.map((ingredient) => (
              <li
                key={ingredient}
                className="rounded-full bg-slate-100 px-3 py-1"
              >
                {ingredient}
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => onRegenerate(meal.id)}
          className="w-full rounded-2xl bg-sky-600 px-4 py-3 text-white transition hover:bg-sky-700"
        >
          Regenerate Plan
        </button>
      </div>
    </article>
  );
}

export default MealCard;
