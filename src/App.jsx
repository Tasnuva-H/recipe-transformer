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
    <div className="min-h-screen relative bg-slate-50">
      {/* Optional background video: set src to your video (e.g. /background-video.mp4) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-[0.12]"
          src="/background-video.mp4"
          aria-hidden
        />
        <div className="absolute inset-0 bg-slate-50/90" aria-hidden />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Recipe Transformer
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Discover recipes tailored to your ingredients
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
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                What ingredients do you have?
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={ingredientsQuery}
                  onChange={(e) => setIngredientsQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchByIngredients()}
                  placeholder="e.g. chicken, garlic, rice, tomatoes"
                  className="w-full pl-11 pr-4 py-3 text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white transition-colors"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Comma-separated. We'll find recipes that use as many as possible.
              </p>
            </div>

            {/* Diet & Options */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                Diet
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Optional. One or more.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {dietOptions.map((diet) => (
                  <button
                    key={diet}
                    type="button"
                    onClick={() => toggleDiet(diet)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedDiets.includes(diet)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {diet}
                  </button>
                ))}
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                Cuisine
              </h3>
              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="w-full max-w-md px-3 py-2.5 border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-slate-900 text-sm mb-6"
              >
                {cuisineOptions.map((cuisine) => (
                  <option key={cuisine || 'any'} value={cuisine}>
                    {cuisine || 'Any cuisine'}
                  </option>
                ))}
              </select>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                Intolerances
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Optional. Exclude these.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {intoleranceOptions.map((intolerance) => (
                  <button
                    key={intolerance}
                    type="button"
                    onClick={() => toggleIntolerance(intolerance)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedIntolerances.includes(intolerance)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {intolerance}
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={ignorePantry}
                    onChange={(e) => setIgnorePantry(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Ignore pantry staples (salt, water, flour, etc.)
                </label>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Ingredients to ignore
                  </label>
                  <input
                    type="text"
                    value={excludeIngredientsQuery}
                    onChange={(e) => setExcludeIngredientsQuery(e.target.value)}
                    placeholder="e.g. nuts, shellfish, mushrooms"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none bg-white text-slate-900 text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Comma-separated.
                  </p>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={searchByIngredients}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  Finding recipes...
                </span>
              ) : (
                'Find recipes by ingredients'
              )}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-sm font-medium p-4 rounded-lg">
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
                <h2 className="text-xl font-bold text-slate-900">
                  {totalResults} recipes
                </h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  Click a card for full recipe and nutrition
                </p>
              </div>
              <button
                onClick={() => setView('search')}
                className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-lg font-medium text-sm border border-slate-300 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                New Search
              </button>
            </div>

            {/* Recipe Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recipes.map((recipe, index) => (
                    <div
                      key={recipe.id}
                      onClick={() => viewRecipeDetail(recipe.id)}
                      className="bg-white rounded-xl overflow-hidden cursor-pointer border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="relative h-40 overflow-hidden bg-slate-100">
                        {recipe.image ? (
                          <img
                            src={recipe.image}
                            alt={recipe.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ChefHat className="w-12 h-12 text-slate-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 mb-2">
                          {recipe.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {(typeof recipe.usedIngredientCount === 'number' || (recipe.usedIngredients && recipe.usedIngredients.length > 0)) && (
                            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium">
                              Used: {typeof recipe.usedIngredientCount === 'number' ? recipe.usedIngredientCount : recipe.usedIngredients.length}
                            </span>
                          )}
                          {(typeof recipe.missedIngredientCount === 'number' || (recipe.missedIngredients && recipe.missedIngredients.length > 0)) && (
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
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
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-lg font-medium text-sm border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Results
            </button>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Recipe Header */}
              <div className="relative h-72 bg-slate-100">
                {selectedRecipe.image ? (
                  <img
                    src={selectedRecipe.image}
                    alt={selectedRecipe.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ChefHat className="w-20 h-20 text-slate-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h1 className="text-2xl font-bold text-white mb-3">
                    {selectedRecipe.title}
                  </h1>
                  <div className="flex flex-wrap gap-2 text-white/90 text-sm">
                    {selectedRecipe.readyInMinutes && (
                      <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-lg font-medium">
                        <Clock className="w-4 h-4" />
                        {selectedRecipe.readyInMinutes} min
                      </div>
                    )}
                    {selectedRecipe.servings && (
                      <div className="bg-white/20 px-3 py-1.5 rounded-lg font-medium">
                        Serves {selectedRecipe.servings}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recipe Content */}
              <div className="p-6 space-y-6">
                {/* Summary */}
                {selectedRecipe.summary && (
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 mb-2">
                      About
                    </h2>
                    <div
                      className="text-slate-600 text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: selectedRecipe.summary }}
                    />
                  </div>
                )}

                {/* Ingredients */}
                {selectedRecipe.extendedIngredients && selectedRecipe.extendedIngredients.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 mb-2">
                      Ingredients
                    </h2>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <ul className="space-y-2 text-sm text-slate-700">
                        {selectedRecipe.extendedIngredients.map((ingredient, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />
                            {ingredient.original}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {(selectedRecipe.analyzedInstructions && selectedRecipe.analyzedInstructions.length > 0) ? (
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 mb-2">
                      Instructions
                    </h2>
                    <div className="space-y-4">
                      {selectedRecipe.analyzedInstructions[0].steps.map((step, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                            {step.number}
                          </div>
                          <p className="text-slate-600 text-sm leading-relaxed pt-1">{step.step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : selectedRecipe.instructions && (
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 mb-2">
                      Instructions
                    </h2>
                    <div
                      className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: selectedRecipe.instructions }}
                    />
                  </div>
                )}

                {/* Nutrition */}
                {selectedRecipe.nutrition && selectedRecipe.nutrition.nutrients && selectedRecipe.nutrition.nutrients.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 mb-2">
                      Nutrition (per serving)
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {selectedRecipe.nutrition.nutrients.slice(0, 12).map((nutrient, index) => (
                        <div key={index} className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
                          <div className="text-base font-bold text-indigo-600">
                            {Number.isInteger(nutrient.amount) ? nutrient.amount : Math.round(nutrient.amount * 10) / 10}{nutrient.unit}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{nutrient.name}</div>
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
      <footer className="relative z-10 mt-16 py-6 bg-slate-900 text-slate-400 text-center border-t border-slate-800">
        <p className="text-sm">
          Powered by Spoonacular API
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
