import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

interface Hero {
  id: number;
  slug: string;
  name: string;
  publisher: string | null;
  alignment: string | null;
  image_url: string | null;
}

interface NewsArticle {
  title: string;
  description: string | null;
  image: string;
  url: string;
  source: string;
  published_at: string | null;
}

interface SearchHistoryItem {
  id: number;
  keyword: string;
  searched_at: string;
}

function HeroCard({ hero, onClick }: { hero: Hero; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-yellow-400 transition-all group"
    >
      <div className="aspect-square bg-gray-700 overflow-hidden">
        {hero.image_url ? (
          <img
            src={hero.image_url}
            alt={hero.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-4xl">
            🦸
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-white font-semibold text-sm truncate">
          {hero.name}
        </h3>
        <p className="text-gray-400 text-xs truncate mt-0.5">
          {hero.publisher ?? "Unknown"}
        </p>
        {hero.alignment && (
          <span
            className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${
              hero.alignment === "good"
                ? "bg-green-900 text-green-300"
                : hero.alignment === "bad"
                  ? "bg-red-900 text-red-300"
                  : "bg-gray-700 text-gray-300"
            }`}
          >
            {hero.alignment}
          </span>
        )}
      </div>
    </div>
  );
}

function NewsCard({ article }: { article: NewsArticle }) {
  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-gray-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-yellow-400 transition-all group flex flex-col"
    >
      <div className="aspect-video bg-gray-700 overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-white text-sm font-semibold line-clamp-2 mb-2 group-hover:text-yellow-400 transition-colors">
          {article.title}
        </p>
        {article.description && (
          <p className="text-gray-400 text-xs line-clamp-2 mb-3 flex-1">
            {article.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-yellow-400 text-xs font-medium">
            {article.source}
          </span>
          {date && <span className="text-gray-500 text-xs">{date}</span>}
        </div>
      </div>
    </a>
  );
}

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [featuredHeroes, setFeaturedHeroes] = useState<Hero[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Hero[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Debounce the query for suggestions — fires 300ms after user stops typing
  const [debouncedQuery] = useDebounce(query, 500);

  // Load featured heroes + news on mount
  useEffect(() => {
    api
      .get("/heroes/featured")
      .then((res) => setFeaturedHeroes(res.data.data ?? []))
      .catch(() => {});

    api
      .get("/news")
      .then((res) => setNews(res.data.data ?? []))
      .catch(() => {});
  }, []);

  // Load search history for authenticated users
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    api
      .get("/search-history")
      .then((res) => setSearchHistory(res.data.data ?? []))
      .catch(() => {});
  }, [isAuthenticated, authLoading]);

  // Auto-suggest as user types (debounced)
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    api
      .get("/heroes/search", { params: { q: debouncedQuery } })
      .then((res) => {
        const results = res.data.data ?? [];
        setSuggestions(results.slice(0, 6)); // max 6 suggestions
        setShowSuggestions(results.length > 0);
      })
      .catch(() => setSuggestions([]));
  }, [debouncedQuery]);

  const search = async () => {
    if (query.trim().length < 2) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    setShowSuggestions(false);
    setSuggestions([]);
    try {
      const res = await api.get("/heroes/search", { params: { q: query } });
      setHeroes(res.data.data ?? []);
      if (isAuthenticated) {
        api
          .get("/search-history")
          .then((res) => setSearchHistory(res.data.data ?? []))
          .catch(() => {});
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setHeroes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") search();
    if (e.key === "Escape") setShowSuggestions(false);
  };

  const handleSuggestionClick = (hero: Hero) => {
    setShowSuggestions(false);
    setSuggestions([]);
    navigate(`/heroes/${hero.slug}`);
  };

  const clearSearch = () => {
    setQuery("");
    setHeroes([]);
    setSearched(false);
    setError(null);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Hero section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Find Your <span className="text-yellow-400">Hero</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Search across Marvel, DC, and more
        </p>
      </div>

      {/* Search bar + suggestions */}
      <div className="max-w-xl mx-auto mb-10">
        <div className="flex gap-3 relative">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Search heroes... (e.g. Batman)"
              className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors"
            />

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-gray-800 border border-gray-600 rounded-xl overflow-hidden shadow-2xl">
                {suggestions.map((hero) => (
                  <button
                    key={hero.id}
                    onMouseDown={() => handleSuggestionClick(hero)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700 transition-colors text-left"
                  >
                    {hero.image_url ? (
                      <img
                        src={hero.image_url}
                        alt={hero.name}
                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gray-600 flex items-center justify-center text-sm flex-shrink-0">
                        🦸
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {hero.name}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        {hero.publisher ?? "Unknown"}
                      </p>
                    </div>
                    {hero.alignment && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                          hero.alignment === "good"
                            ? "bg-green-900 text-green-300"
                            : hero.alignment === "bad"
                              ? "bg-red-900 text-red-300"
                              : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {hero.alignment}
                      </span>
                    )}
                  </button>
                ))}

                {/* View all results option */}
                <button
                  onMouseDown={search}
                  className="w-full px-4 py-2.5 text-yellow-400 hover:bg-gray-700 text-sm font-medium transition-colors text-left border-t border-gray-700"
                >
                  View all results for "{query}" →
                </button>
              </div>
            )}
          </div>

          {searched ? (
            <button
              onClick={clearSearch}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-5 py-3 rounded-lg transition-colors"
            >
              Clear
            </button>
          ) : (
            <button
              onClick={search}
              disabled={loading || query.trim().length < 2}
              className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-bold px-6 py-3 rounded-lg transition-colors"
            >
              {loading ? "..." : "Search"}
            </button>
          )}
        </div>

        {/* Recent searches */}
        {isAuthenticated && searchHistory.length > 0 && !searched && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-xs uppercase tracking-wider">
                Recent searches
              </p>
              <button
                onClick={() => {
                  api
                    .delete("/search-history")
                    .then(() => setSearchHistory([]));
                }}
                className="text-gray-500 hover:text-red-400 text-xs transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setQuery(item.keyword);
                    setTimeout(() => search(), 0);
                  }}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm px-3 py-1.5 rounded-lg transition-colors border border-gray-700 hover:border-gray-500"
                >
                  🔍 {item.keyword}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search results */}
      {searched && (
        <>
          {error && <p className="text-center text-red-400 mb-6">{error}</p>}
          {!loading && heroes.length === 0 && !error && (
            <p className="text-center text-gray-400 mb-6">
              No heroes found for "<span className="text-white">{query}</span>"
            </p>
          )}
          {heroes.length > 0 && (
            <div className="mb-12">
              <h2 className="text-white font-semibold text-lg mb-4">
                Results for "<span className="text-yellow-400">{query}</span>"
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {heroes.map((hero) => (
                  <HeroCard
                    key={hero.id}
                    hero={hero}
                    onClick={() => navigate(`/heroes/${hero.slug}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Featured heroes */}
      {!searched && featuredHeroes.length > 0 && (
        <div className="mb-12">
          <h2 className="text-white font-semibold text-lg mb-4">
            🦸 Featured Heroes
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {featuredHeroes.map((hero) => (
              <HeroCard
                key={hero.id}
                hero={hero}
                onClick={() => navigate(`/heroes/${hero.slug}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* News */}
      {news.length > 0 && (
        <div>
          <h2 className="text-white font-semibold text-lg mb-4">
            📰 Latest Superhero News
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {news.map((article, i) => (
              <NewsCard key={i} article={article} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
