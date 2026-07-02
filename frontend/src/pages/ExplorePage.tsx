import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

interface Hero {
  id: number
  slug: string
  name: string
  publisher: string | null
  alignment: string | null
  image_url: string | null
  intelligence: number | null
  strength: number | null
  speed: number | null
  durability: number | null
  combat: number | null
  power: number | null
}

export default function ExplorePage() {
  const [query, setQuery] = useState('')
  const [heroes, setHeroes] = useState<Hero[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const search = async () => {
    if (query.trim().length < 2) return
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const res = await api.get('/heroes/search', { params: { q: query } })
      setHeroes(res.data.data ?? [])
    } catch {
      setError('Something went wrong. Please try again.')
      setHeroes([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') search()
  }

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

      {/* Search bar */}
      <div className="flex gap-3 max-w-xl mx-auto mb-10">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search heroes... (e.g. Batman)"
          className="flex-1 bg-gray-800 text-white placeholder-gray-500 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition-colors"
        />
        <button
          onClick={search}
          disabled={loading || query.trim().length < 2}
          className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-bold px-6 py-3 rounded-lg transition-colors"
        >
          {loading ? '...' : 'Search'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-center text-red-400 mb-6">{error}</p>
      )}

      {/* No results */}
      {searched && !loading && heroes.length === 0 && !error && (
        <p className="text-center text-gray-400">
          No heroes found for "<span className="text-white">{query}</span>"
        </p>
      )}

      {/* Results grid */}
      {heroes.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {heroes.map((hero) => (
            <div
              key={hero.id}
              onClick={() => navigate(`/heroes/${hero.slug}`)}
              className="bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-yellow-400 transition-all group"
            >
              {/* Hero image */}
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

              {/* Hero info */}
              <div className="p-3">
                <h3 className="text-white font-semibold text-sm truncate">
                  {hero.name}
                </h3>
                <p className="text-gray-400 text-xs truncate mt-0.5">
                  {hero.publisher ?? 'Unknown'}
                </p>
                {hero.alignment && (
                  <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${
                    hero.alignment === 'good'
                      ? 'bg-green-900 text-green-300'
                      : hero.alignment === 'bad'
                      ? 'bg-red-900 text-red-300'
                      : 'bg-gray-700 text-gray-300'
                  }`}>
                    {hero.alignment}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}