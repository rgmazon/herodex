import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Radar } from 'react-chartjs-2'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface Hero {
  id: number
  slug: string
  name: string
  full_name: string | null
  publisher: string | null
  alignment: string | null
  image_url: string | null
  gender: string | null
  race: string | null
  height: string | null
  weight: string | null
  occupation: string | null
  place_of_birth: string | null
  first_appearance: string | null
  aliases: string[]
  intelligence: number | null
  strength: number | null
  speed: number | null
  durability: number | null
  combat: number | null
  power: number | null
}

interface Team {
  id: number
  team_name: string
  members: { hero_id: number }[]
}

export default function HeroDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [hero, setHero] = useState<Hero | null>(null)
  const [loading, setLoading] = useState(true)
  const [favorited, setFavorited] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false)
  const [teamLoading, setTeamLoading] = useState(false)
  const [wiki, setWiki] = useState<{ extract: string; url: string; thumbnail: string | null } | null>(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    api.get(`/heroes/${slug}`)
      .then((res) => {
        setHero(res.data.data)
        if (isAuthenticated) {
          api.get('/teams')
            .then((r) => setTeams(r.data.data ?? []))
            .catch(() => {})
        }
        // Fetch Wikipedia summary
        api.get(`/heroes/${res.data.data.slug}/wiki`)
          .then((r) => setWiki(r.data.data))
          .catch(() => {})
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!hero || !isAuthenticated) return
    api.get(`/favorites/${hero.slug}/check`)
      .then((res) => setFavorited(res.data.favorited))
      .catch(() => {})
  }, [hero, isAuthenticated])

  const toggleFavorite = async () => {
    if (!hero || !isAuthenticated) {
      navigate('/login')
      return
    }
    setFavLoading(true)
    try {
      if (favorited) {
        await api.delete(`/favorites/${hero.slug}`)
        setFavorited(false)
      } else {
        await api.post(`/favorites/${hero.slug}`)
        setFavorited(true)
      }
    } catch {}
    finally { setFavLoading(false) }
  }

  const addToTeam = async (teamId: number) => {
    if (!hero) return
    setTeamLoading(true)
    try {
      await api.post(`/teams/${teamId}/members/${hero.slug}`)
      const res = await api.get('/teams')
      setTeams(res.data.data ?? [])
    } catch {}
    finally {
      setTeamLoading(false)
      setTeamDropdownOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-lg">Loading...</p>
      </div>
    )
  }

  if (!hero) return null

  const hasStats = [hero.intelligence, hero.strength, hero.speed, hero.durability, hero.combat, hero.power].some(s => s !== null)

  const radarData = {
    labels: ['Intelligence', 'Strength', 'Speed', 'Durability', 'Combat', 'Power'],
    datasets: [{
      label: hero.name,
      data: [
        hero.intelligence ?? 0,
        hero.strength ?? 0,
        hero.speed ?? 0,
        hero.durability ?? 0,
        hero.combat ?? 0,
        hero.power ?? 0,
      ],
      backgroundColor: 'rgba(250, 204, 21, 0.15)',
      borderColor: 'rgba(250, 204, 21, 0.8)',
      pointBackgroundColor: 'rgba(250, 204, 21, 1)',
      pointBorderColor: '#fff',
      borderWidth: 2,
    }],
  }

  const radarOptions = {
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { display: false },
        grid: { color: 'rgba(255,255,255,0.1)' },
        pointLabels: { color: '#9ca3af', font: { size: 12 } },
        angleLines: { color: 'rgba(255,255,255,0.1)' },
      },
    },
    plugins: {
      legend: { display: false },
    },
  }

  const alignmentColor = hero.alignment === 'good'
    ? 'bg-green-900 text-green-300'
    : hero.alignment === 'bad'
    ? 'bg-red-900 text-red-300'
    : 'bg-gray-700 text-gray-300'

  const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) =>
    value && value !== '-' ? (
      <div className="flex gap-2">
        <span className="text-gray-400 text-sm min-w-32">{label}</span>
        <span className="text-white text-sm">{value}</span>
      </div>
    ) : null

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors"
      >
        ← Back
      </button>

      <div className="grid md:grid-cols-3 gap-8">

        {/* Left column — image + actions */}
        <div className="md:col-span-1">
          <div className="rounded-2xl overflow-hidden bg-gray-800 mb-4">
            {hero.image_url ? (
              <img src={hero.image_url} alt={hero.name} className="w-full object-cover" />
            ) : (
              <div className="aspect-square flex items-center justify-center text-6xl">🦸</div>
            )}
          </div>

          {/* Favorite button */}
          <button
            onClick={toggleFavorite}
            disabled={favLoading}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors mb-2 ${
              favorited
                ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            {favLoading ? '...' : favorited ? '★ Favorited' : '☆ Add to Favorites'}
          </button>

          {/* Compare button */}
          <button
            onClick={() => navigate(`/compare?hero1=${hero.slug}`)}
            className="w-full py-2.5 rounded-xl font-semibold text-sm bg-gray-700 text-white hover:bg-gray-600 transition-colors mb-2"
          >
            ⚔ Compare
          </button>

          {/* Add to Team button */}
          {isAuthenticated && teams.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setTeamDropdownOpen(!teamDropdownOpen)}
                disabled={teamLoading}
                className="w-full py-2.5 rounded-xl font-semibold text-sm bg-gray-700 text-white hover:bg-gray-600 transition-colors"
              >
                {teamLoading ? '...' : '👥 Add to Team'}
              </button>

              {teamDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-xl overflow-hidden shadow-xl">
                  {teams.map((team) => {
                    const isMember = team.members.some((m) => m.hero_id === hero.id)
                    const isFull = team.members.length >= 6
                    return (
                      <button
                        key={team.id}
                        onClick={() => !isMember && !isFull && addToTeam(team.id)}
                        disabled={isMember || isFull}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
                      >
                        <span className="text-white text-sm">{team.team_name}</span>
                        <span className="text-gray-400 text-xs">
                          {isMember ? '✓ Added' : isFull ? 'Full' : `${team.members.length}/6`}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column — details */}
        <div className="md:col-span-2">

          {/* Name + badges */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-1">{hero.name}</h1>
            {hero.full_name && hero.full_name !== '-' && (
              <p className="text-gray-400 mb-2">{hero.full_name}</p>
            )}
            <div className="flex gap-2 flex-wrap">
              {hero.publisher && (
                <span className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
                  {hero.publisher}
                </span>
              )}
              {hero.alignment && (
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${alignmentColor}`}>
                  {hero.alignment}
                </span>
              )}
            </div>
          </div>

          {/* Biography */}
          <div className="bg-gray-800 rounded-2xl p-5 mb-4">
            <h2 className="text-white font-semibold mb-3">Biography</h2>
            <div className="flex flex-col gap-2">
              <InfoRow label="Gender" value={hero.gender} />
              <InfoRow label="Race" value={hero.race} />
              <InfoRow label="Height" value={hero.height} />
              <InfoRow label="Weight" value={hero.weight} />
              <InfoRow label="Occupation" value={hero.occupation} />
              <InfoRow label="Place of Birth" value={hero.place_of_birth} />
              <InfoRow label="First Appearance" value={hero.first_appearance} />
              {hero.aliases?.length > 0 && (
                <div className="flex gap-2">
                  <span className="text-gray-400 text-sm min-w-32">Aliases</span>
                  <span className="text-white text-sm">{hero.aliases.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Wikipedia Background */}
          {wiki?.extract && (
            <div className="bg-gray-800 rounded-2xl p-5 mb-4">
              <h2 className="text-white font-semibold mb-3">Background</h2>
              <p className="text-gray-300 text-sm leading-relaxed">{wiki.extract}</p>
              {wiki.url && (
                
                  <a href={wiki.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-yellow-400 hover:text-yellow-300 text-xs font-medium transition-colors"
                >
                  Read more on Wikipedia →
                </a>
              )}
            </div>
          )}

          {/* Power stats */}
          {hasStats && (
            <div className="bg-gray-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold mb-4">Power Stats</h2>
              <div className="max-w-xs mx-auto">
                <Radar data={radarData} options={radarOptions} />
              </div>
              <div className="mt-4 flex flex-col gap-2">
                {[
                  { label: 'Intelligence', value: hero.intelligence },
                  { label: 'Strength', value: hero.strength },
                  { label: 'Speed', value: hero.speed },
                  { label: 'Durability', value: hero.durability },
                  { label: 'Combat', value: hero.combat },
                  { label: 'Power', value: hero.power },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-gray-400 text-xs w-24">{label}</span>
                    <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-yellow-400 h-1.5 rounded-full transition-all"
                        style={{ width: `${value ?? 0}%` }}
                      />
                    </div>
                    <span className="text-white text-xs w-6 text-right">{value ?? '?'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}