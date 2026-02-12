import React, { useState } from 'react';
import { Search, ChefHat, Clock, Filter, ChevronLeft, Loader } from 'lucide-react';

export default function RecipeTransformer() {
  const [view, setView] = useState('search'); // 'search', 'results', 'detail'
  const [ingredientsQuery, setIngredientsQuery] = useState('');
  const [ignorePantry, setIgnorePantry] = useState(true);
  const [excludeIngredientsQuery, setExcludeIngredientsQuery] = useState('');
  const [selectedDiets, setSelectedDiets] = useState([]);
  const [selectedIntolerances, setSelectedIntolerances] = useState([]);
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const RESULTS_PER_PAGE = 20;

  const dietOptions = [
    'Gluten Free',
    'Ketogenic',
    'Vegetarian',
    'Lacto-Vegetarian',
    'Ovo-Vegetarian',
    'Vegan',
    'Pescetarian',
    'Paleo',
    'Primal',
    'Low FODMAP',
    'Whole30',
  ];

  const dietToApiValue = (label) => {
    const map = {
      'Gluten Free': 'gluten free',
      'Ketogenic': 'ketogenic',
      'Vegetarian': 'vegetarian',
      'Lacto-Vegetarian': 'lacto-vegetarian',
      'Ovo-Vegetarian': 'ovo-vegetarian',
      'Vegan': 'vegan',
      'Pescetarian': 'pescetarian',
      'Paleo': 'paleo',
      'Primal': 'primal',
      'Low FODMAP': 'low fodmap',
      'Whole30': 'whole30',
    };
    return map[label] || label.toLowerCase();
  };

  const intoleranceOptions = [
    'Dairy',
    'Egg',
    'Gluten',
    'Grain',
    'Peanut',
    'Seafood',
    'Sesame',
    'Shellfish',
    'Soy',
    'Sulfite',
    'Tree Nut',
    'Wheat',
  ];

  const cuisineOptions = [
    '',
    'African',
    'Asian',
    'American',
    'British',
    'Cajun',
    'Caribbean',
    'Chinese',
    'Eastern European',
    'European',
    'French',
    'German',
    'Greek',
    'Indian',
    'Irish',
    'Italian',
    'Japanese',
    'Jewish',
    'Korean',
    'Latin American',
    'Mediterranean',
    'Mexican',
    'Middle Eastern',
    'Nordic',
    'Southern',
    'Spanish',
    'Thai',
    'Vietnamese',
  ];

  const cuisineToApiValue = (label) =>
    label ? label.toLowerCase().replace(/\s+/g, ' ').trim() : '';

  const intoleranceToApiValue = (label) =>
    label.toLowerCase().replace(/\s+/g, ' ').trim();

  const toggleDiet = (diet) => {
    setSelectedDiets((prev) =>
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]
    );
  };

  const toggleIntolerance = (intolerance) => {
    setSelectedIntolerances((prev) =>
      prev.includes(intolerance)
        ? prev.filter((i) => i !== intolerance)
        : [...prev, intolerance]
    );
  };

  const searchByIngredients = async () => {
    const trimmed = ingredientsQuery.trim();
    if (!trimmed) {
      setError('Please enter at least one ingredient (e.g. chicken, garlic, rice)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        ingredients: trimmed,
        number: String(RESULTS_PER_PAGE),
        ignorePantry: String(ignorePantry),
      });
      if (selectedDiets.length > 0) {
        params.set('diet', selectedDiets.map(dietToApiValue).join(','));
      }
      if (selectedIntolerances.length > 0) {
        params.set('intolerances', selectedIntolerances.map(intoleranceToApiValue).join(','));
      }
      if (excludeIngredientsQuery.trim()) {
        params.set('excludeIngredients', excludeIngredientsQuery.trim());
      }
      if (selectedCuisine) {
        params.set('cuisine', cuisineToApiValue(selectedCuisine));
      }
      const response = await fetch(`/api/recipes/by-ingredients?${params.toString()}`);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to fetch recipes');
      }

      const data = await response.json();
      const list = Array.isArray(data) ? data : (data.results || []);
      const total = data.totalResults ?? list.length;

      if (list.length > 0) {
        setRecipes(list);
        setTotalResults(total);
        setView('results');
      } else {
        setError('No recipes found for these ingredients. Try adding or changing ingredients.');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch recipes. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewRecipeDetail = async (recipeId) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/recipes/${recipeId}?includeNutrition=true`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to fetch recipe details');
      }
      const data = await response.json();
      setSelectedRecipe(data);
      setView('detail');
    } catch (err) {
      setError(err.message || 'Failed to load recipe details. Please try again.');
      console.error('Recipe detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Looping background video: add your video to public/background-video.mp4 (optional: public/background-poster.jpg for poster) */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="/background-video.mp4"
          poster="/background-poster.jpg"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/85 via-slate-900/75 to-slate-900/90" aria-hidden />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gradient-to-r from-orange-600 via-orange-500 to-rose-600 text-white shadow-[var(--shadow-header)] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="bg-white/25 p-3 rounded-2xl backdrop-blur-md shadow-lg border border-white/20">
              <ChefHat className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">
                Recipe Transformer
              </h1>
              <p className="text-white/90 mt-1 font-medium">
                Discover delicious recipes tailored to your taste
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Search View */}
        {view === 'search' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Ingredients Search Input */}
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-[var(--shadow-card)]">
              <label className="block text-lg font-bold text-slate-800 mb-4">
                What ingredients do you have?
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-orange-500" />
                <input
                  type="text"
                  value={ingredientsQuery}
                  onChange={(e) => setIngredientsQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchByIngredients()}
                  placeholder="e.g. chicken, garlic, rice, tomatoes"
                  className="w-full pl-14 pr-6 py-4 text-lg border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 focus:outline-none transition-all bg-white/80 shadow-inner"
                />
              </div>
              <p className="text-sm text-slate-600 mt-2">
                Enter ingredients separated by commas. We'll find recipes that use as many as possible.
              </p>
            </div>

            {/* Diet & Options */}
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-[var(--shadow-card)]">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Filter className="w-6 h-6 text-orange-500" />
                Diet
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Optional. Select one or more diets to filter recipes (e.g. Vegetarian, Vegan).
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {dietOptions.map((diet) => (
                  <button
                    key={diet}
                    type="button"
                    onClick={() => toggleDiet(diet)}
                    className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md ${
                      selectedDiets.includes(diet)
                        ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-[var(--shadow-button)] ring-2 ring-orange-400/50'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-lg border border-slate-200/80'
                    }`}
                  >
                    {diet}
                  </button>
                ))}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                Cuisine
              </h3>
              <p className="text-sm text-slate-600 mb-3">
                Optional. Filter by cuisine type.
              </p>
              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="w-full max-w-md px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 focus:outline-none transition-all bg-white shadow-inner mb-8 font-medium text-slate-800"
              >
                {cuisineOptions.map((cuisine) => (
                  <option key={cuisine || 'any'} value={cuisine}>
                    {cuisine || 'Any cuisine'}
                  </option>
                ))}
              </select>
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                Intolerances
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Optional. Exclude ingredients you need to avoid (e.g. Dairy, Gluten, Nuts).
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {intoleranceOptions.map((intolerance) => (
                  <button
                    key={intolerance}
                    type="button"
                    onClick={() => toggleIntolerance(intolerance)}
                    className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md ${
                      selectedIntolerances.includes(intolerance)
                        ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-[var(--shadow-button)] ring-2 ring-orange-400/50'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:shadow-lg border border-slate-200/80'
                    }`}
                  >
                    {intolerance}
                  </button>
                ))}
              </div>
              <div className="space-y-4">
          
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Ingredients to ignore
                  </label>
                  <input
                    type="text"
                    value={excludeIngredientsQuery}
                    onChange={(e) => setExcludeIngredientsQuery(e.target.value)}
                    placeholder="e.g. nuts, shellfish, mushrooms"
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 focus:outline-none transition-all bg-white/80 shadow-inner"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Comma-separated. Recipes containing these will be excluded.
                  </p>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={searchByIngredients}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-rose-600 text-white py-5 rounded-xl font-bold text-lg shadow-[var(--shadow-button)] hover:shadow-[var(--shadow-card-hover)] transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed ring-2 ring-orange-400/30 border border-white/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  Finding recipes...
                </span>
              ) : (
                'Find recipes by ingredients'
              )}
            </button>

            {error && (
              <div className="bg-red-500/15 backdrop-blur-sm border-l-4 border-red-500 text-red-900 font-medium p-4 rounded-xl shadow-lg">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Results View */}
        {view === 'results' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                  Found {totalResults} recipes
                </h2>
                <p className="text-white/90 mt-1 font-medium">
                  Click a card to see full recipe and nutrition
                </p>
              </div>
              <button
                onClick={() => setView('search')}
                className="flex items-center gap-2 px-6 py-3 bg-white/95 backdrop-blur-md text-slate-800 rounded-xl font-semibold shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] border border-white/20 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                New Search
              </button>
            </div>

            {/* Recipe Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader className="w-12 h-12 text-orange-400 animate-spin drop-shadow-lg" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recipes.map((recipe, index) => (
                    <div
                      key={recipe.id}
                      onClick={() => viewRecipeDetail(recipe.id)}
                      className="bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden cursor-pointer transform hover:scale-[1.03] transition-all shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] border border-white/20 group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-orange-200 to-rose-200">
                        {recipe.image ? (
                          <img
                            src={recipe.image}
                            alt={recipe.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ChefHat className="w-16 h-16 text-orange-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-slate-800 text-lg line-clamp-2 mb-2">
                          {recipe.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          {(typeof recipe.usedIngredientCount === 'number' || (recipe.usedIngredients && recipe.usedIngredients.length > 0)) && (
                            <span className="bg-emerald-500/20 text-emerald-800 px-3 py-1 rounded-full font-semibold shadow-sm">
                              Used: {typeof recipe.usedIngredientCount === 'number' ? recipe.usedIngredientCount : recipe.usedIngredients.length}
                            </span>
                          )}
                          {(typeof recipe.missedIngredientCount === 'number' || (recipe.missedIngredients && recipe.missedIngredients.length > 0)) && (
                            <span className="bg-amber-500/20 text-amber-800 px-3 py-1 rounded-full font-semibold shadow-sm">
                              Missing: {typeof recipe.missedIngredientCount === 'number' ? recipe.missedIngredientCount : recipe.missedIngredients.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Detail View */}
        {view === 'detail' && selectedRecipe && (
          <div className="space-y-8 animate-fadeIn">
            {/* Back Button */}
            <button
              onClick={() => setView('results')}
              className="flex items-center gap-2 px-6 py-3 bg-white/95 backdrop-blur-md text-slate-800 rounded-xl font-semibold shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] border border-white/20 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Results
            </button>

            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[var(--shadow-card)] overflow-hidden border border-white/20">
              {/* Recipe Header */}
              <div className="relative h-96 bg-gradient-to-br from-orange-200 to-rose-200">
                {selectedRecipe.image ? (
                  <img
                    src={selectedRecipe.image}
                    alt={selectedRecipe.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ChefHat className="w-32 h-32 text-orange-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h1 className="text-4xl font-extrabold text-white mb-4 drop-shadow-lg">
                    {selectedRecipe.title}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-white">
                    {selectedRecipe.readyInMinutes && (
                      <div className="flex items-center gap-2 bg-white/25 backdrop-blur-md px-4 py-2 rounded-full font-semibold shadow-lg border border-white/20">
                        <Clock className="w-5 h-5" />
                        <span>{selectedRecipe.readyInMinutes} minutes</span>
                      </div>
                    )}
                    {selectedRecipe.servings && (
                      <div className="bg-white/25 backdrop-blur-md px-4 py-2 rounded-full font-semibold shadow-lg border border-white/20">
                        Serves {selectedRecipe.servings}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recipe Content */}
              <div className="p-8 space-y-8">
                {/* Summary */}
                {selectedRecipe.summary && (
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">
                      About This Recipe
                    </h2>
                    <div
                      className="text-slate-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: selectedRecipe.summary }}
                    />
                  </div>
                )}

                {/* Ingredients */}
                {selectedRecipe.extendedIngredients && selectedRecipe.extendedIngredients.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">
                      Ingredients
                    </h2>
                    <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl p-6 border border-orange-200/50 shadow-inner">
                      <ul className="space-y-3">
                        {selectedRecipe.extendedIngredients.map((ingredient, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0 shadow-sm" />
                            <span className="text-slate-800 font-medium">{ingredient.original}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {(selectedRecipe.analyzedInstructions && selectedRecipe.analyzedInstructions.length > 0) ? (
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">
                      Instructions
                    </h2>
                    <div className="space-y-6">
                      {selectedRecipe.analyzedInstructions[0].steps.map((step, index) => (
                        <div key={index} className="flex gap-6">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-rose-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-orange-400/30">
                            {step.number}
                          </div>
                          <div className="flex-1 pt-2">
                            <p className="text-slate-800 leading-relaxed font-medium">{step.step}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : selectedRecipe.instructions && (
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">
                      Instructions
                    </h2>
                    <div
                      className="text-slate-700 leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: selectedRecipe.instructions }}
                    />
                  </div>
                )}

                {/* Nutrition */}
                {selectedRecipe.nutrition && selectedRecipe.nutrition.nutrients && selectedRecipe.nutrition.nutrients.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">
                      Nutrition (per serving)
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedRecipe.nutrition.nutrients.slice(0, 12).map((nutrient, index) => (
                        <div key={index} className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-xl p-4 text-center border border-orange-200/50 shadow-md">
                          <div className="text-2xl font-bold text-orange-600">
                            {Number.isInteger(nutrient.amount) ? nutrient.amount : Math.round(nutrient.amount * 10) / 10}{nutrient.unit}
                          </div>
                          <div className="text-sm text-slate-600 mt-1 font-medium">{nutrient.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-20 py-8 bg-gradient-to-r from-orange-600 via-orange-500 to-rose-600 text-white text-center border-t border-white/10 shadow-[var(--shadow-header)]">
        <p className="text-white/90 font-medium">
          Powered by Spoonacular API • Built with React & Tailwind CSS
        </p>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
