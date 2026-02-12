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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <ChefHat className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                Recipe Transformer
              </h1>
              <p className="text-orange-100 mt-1" style={{ fontFamily: 'system-ui, sans-serif' }}>
                Discover delicious recipes tailored to your taste
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Search View */}
        {view === 'search' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Ingredients Search Input */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-orange-500">
              <label className="block text-lg font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                What ingredients do you have?
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  value={ingredientsQuery}
                  onChange={(e) => setIngredientsQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchByIngredients()}
                  placeholder="e.g. chicken, garlic, rice, tomatoes"
                  className="w-full pl-14 pr-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Enter ingredients separated by commas. We'll find recipes that use as many as possible.
              </p>
            </div>

            {/* Diet & Options */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'Georgia, serif' }}>
                <Filter className="w-6 h-6 text-orange-600" />
                Diet
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Optional. Select one or more diets to filter recipes (e.g. Vegetarian, Vegan).
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {dietOptions.map((diet) => (
                  <button
                    key={diet}
                    type="button"
                    onClick={() => toggleDiet(diet)}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                      selectedDiets.includes(diet)
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {diet}
                  </button>
                ))}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'Georgia, serif' }}>
                Cuisine
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Optional. Filter by cuisine type.
              </p>
              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="w-full max-w-md px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all bg-white mb-8"
              >
                {cuisineOptions.map((cuisine) => (
                  <option key={cuisine || 'any'} value={cuisine}>
                    {cuisine || 'Any cuisine'}
                  </option>
                ))}
              </select>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'Georgia, serif' }}>
                Intolerances
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Optional. Exclude ingredients you need to avoid (e.g. Dairy, Gluten, Nuts).
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {intoleranceOptions.map((intolerance) => (
                  <button
                    key={intolerance}
                    type="button"
                    onClick={() => toggleIntolerance(intolerance)}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                      selectedIntolerances.includes(intolerance)
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {intolerance}
                  </button>
                ))}
              </div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Other options
              </h4>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ignorePantry}
                    onChange={(e) => setIgnorePantry(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-gray-700">Ignore pantry staples (salt, water, flour, etc.)</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ingredients to ignore
                  </label>
                  <input
                    type="text"
                    value={excludeIngredientsQuery}
                    onChange={(e) => setExcludeIngredientsQuery(e.target.value)}
                    placeholder="e.g. nuts, shellfish, mushrooms"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Comma-separated. Recipes containing these will be excluded.
                  </p>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={searchByIngredients}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-5 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
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
                <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Georgia, serif' }}>
                  Found {totalResults} recipes
                </h2>
                <p className="text-gray-600 mt-1">
                  Click a card to see full recipe and nutrition
                </p>
              </div>
              <button
                onClick={() => setView('search')}
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                New Search
              </button>
            </div>

            {/* Recipe Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader className="w-12 h-12 text-orange-600 animate-spin" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recipes.map((recipe, index) => (
                    <div
                      key={recipe.id}
                      onClick={() => viewRecipeDetail(recipe.id)}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-all hover:shadow-2xl group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-orange-100 to-red-100">
                        {recipe.image ? (
                          <img
                            src={recipe.image}
                            alt={recipe.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ChefHat className="w-16 h-16 text-orange-300" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-gray-800 text-lg line-clamp-2 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                          {recipe.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          {(typeof recipe.usedIngredientCount === 'number' || (recipe.usedIngredients && recipe.usedIngredients.length > 0)) && (
                            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                              Used: {typeof recipe.usedIngredientCount === 'number' ? recipe.usedIngredientCount : recipe.usedIngredients.length}
                            </span>
                          )}
                          {(typeof recipe.missedIngredientCount === 'number' || (recipe.missedIngredients && recipe.missedIngredients.length > 0)) && (
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
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
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Results
            </button>

            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Recipe Header */}
              <div className="relative h-96 bg-gradient-to-br from-orange-100 to-red-100">
                {selectedRecipe.image ? (
                  <img
                    src={selectedRecipe.image}
                    alt={selectedRecipe.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ChefHat className="w-32 h-32 text-orange-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                    {selectedRecipe.title}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-white">
                    {selectedRecipe.readyInMinutes && (
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                        <Clock className="w-5 h-5" />
                        <span className="font-medium">{selectedRecipe.readyInMinutes} minutes</span>
                      </div>
                    )}
                    {selectedRecipe.servings && (
                      <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full font-medium">
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
                    <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                      About This Recipe
                    </h2>
                    <div
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: selectedRecipe.summary }}
                    />
                  </div>
                )}

                {/* Ingredients */}
                {selectedRecipe.extendedIngredients && selectedRecipe.extendedIngredients.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                      Ingredients
                    </h2>
                    <div className="bg-orange-50 rounded-xl p-6">
                      <ul className="space-y-3">
                        {selectedRecipe.extendedIngredients.map((ingredient, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-800">{ingredient.original}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {(selectedRecipe.analyzedInstructions && selectedRecipe.analyzedInstructions.length > 0) ? (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                      Instructions
                    </h2>
                    <div className="space-y-6">
                      {selectedRecipe.analyzedInstructions[0].steps.map((step, index) => (
                        <div key={index} className="flex gap-6">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {step.number}
                          </div>
                          <div className="flex-1 pt-2">
                            <p className="text-gray-800 leading-relaxed">{step.step}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : selectedRecipe.instructions && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                      Instructions
                    </h2>
                    <div
                      className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: selectedRecipe.instructions }}
                    />
                  </div>
                )}

                {/* Nutrition */}
                {selectedRecipe.nutrition && selectedRecipe.nutrition.nutrients && selectedRecipe.nutrition.nutrients.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                      Nutrition (per serving)
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedRecipe.nutrition.nutrients.slice(0, 12).map((nutrient, index) => (
                        <div key={index} className="bg-orange-50 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {Number.isInteger(nutrient.amount) ? nutrient.amount : Math.round(nutrient.amount * 10) / 10}{nutrient.unit}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{nutrient.name}</div>
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
      <footer className="mt-20 py-8 bg-gradient-to-r from-orange-600 to-red-600 text-white text-center">
        <p className="text-orange-100">
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
