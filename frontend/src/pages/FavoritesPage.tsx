import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

interface Hero {
  id: number
  slug: string
  name: string
  publisher: string | null
  alignment: string | null
  image_url: string | null
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Hero[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/favorites')
      .then((res) => setFavorites(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const removeFavorite = async (slug: string, e: React.MouseEvent) => {
    e.stopPropagation() // prevent navigating to hero detail
    await api.delete(`/favorites/${slug}`)
    setFavorites((prev) => prev.filter((h) => h.slug !== slug))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading favorites...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">My Favorites</h1>
        <p className="text-gray-400">
          {favorites.length === 0
            ? 'No favorites yet — start exploring!'
            : `${favorites.length} hero${favorites.length === 1 ? '' : 's'} saved`}
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🦸</p>
          <p className="text-gray-400 mb-6">Your favorites list is empty.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-6 py-3 rounded-lg transition-colors"
          >
            Explore Heroes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {favorites.map((hero) => (
            <div
              key={hero.id}
              onClick={() => navigate(`/heroes/${hero.slug}`)}
              className="bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-yellow-400 transition-all group relative"
            >
              {/* Remove button */}
              <button
                onClick={(e) => removeFavorite(hero.slug, e)}
                className="absolute top-2 right-2 z-10 bg-gray-900/80 hover:bg-red-900/80 text-white hover:text-red-300 rounded-full w-7 h-7 flex items-center justify-center text-xs transition-colors"
                title="Remove from favorites"
              >
                ✕
              </button>

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
                <h3 className="text-white font-semibold text-sm truncate">{hero.name}</h3>
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