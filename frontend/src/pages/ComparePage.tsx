import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

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

const STATS = ['intelligence', 'strength', 'speed', 'durability', 'combat', 'power'] as const
const STAT_LABELS = ['Intelligence', 'Strength', 'Speed', 'Durability', 'Combat', 'Power']

function HeroSearch({
  label,
  selected,
  onSelect,
}: {
  label: string
  selected: Hero | null
  onSelect: (hero: Hero) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Hero[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const search = async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const res = await api.get('/heroes/search', { params: { q } })
      setResults(res.data.data ?? [])
      setShowResults(true)
    } catch {}
    finally { setLoading(false) }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    search(val)
  }

  const handleSelect = (hero: Hero) => {
    onSelect(hero)
    setQuery(hero.name)
    setShowResults(false)
    setResults([])
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{label}</p>

      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 150)}
          placeholder="Search a hero..."
          className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:border-yellow-400 transition-colors text-sm"
        />
        {loading && (
          <span className="absolute right-3 top-3 text-gray-400 text-xs">...</span>
        )}

        {/* Dropdown results */}
        {showResults && results.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg overflow-hidden shadow-xl max-h-48 overflow-y-auto">
            {results.map((hero) => (
              <button
                key={hero.id}
                onMouseDown={() => handleSelect(hero)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-700 transition-colors text-left"
              >
                {hero.image_url && (
                  <img src={hero.image_url} alt={hero.name} className="w-8 h-8 rounded object-cover" />
                )}
                <div>
                  <p className="text-white text-sm font-medium">{hero.name}</p>
                  <p className="text-gray-400 text-xs">{hero.publisher ?? 'Unknown'}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected hero card */}
      {selected && (
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="aspect-square bg-gray-700 overflow-hidden">
            {selected.image_url ? (
              <img src={selected.image_url} alt={selected.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">🦸</div>
            )}
          </div>
          <div className="p-3">
            <h3 className="text-white font-bold">{selected.name}</h3>
            <p className="text-gray-400 text-sm">{selected.publisher ?? 'Unknown'}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ComparePage() {
  const [searchParams] = useSearchParams()
  const [hero1, setHero1] = useState<Hero | null>(null)
  const [hero2, setHero2] = useState<Hero | null>(null)

  // Pre-fill hero1 if coming from HeroDetailPage compare button
  useEffect(() => {
    const slug = searchParams.get('hero1')
    if (!slug) return
    api.get(`/heroes/${slug}`)
      .then((res) => setHero1(res.data.data))
      .catch(() => {})
  }, [])

  const radarData = {
    labels: STAT_LABELS,
    datasets: [
      ...(hero1 ? [{
        label: hero1.name,
        data: STATS.map((s) => hero1[s] ?? 0),
        backgroundColor: 'rgba(250, 204, 21, 0.15)',
        borderColor: 'rgba(250, 204, 21, 0.8)',
        pointBackgroundColor: 'rgba(250, 204, 21, 1)',
        borderWidth: 2,
      }] : []),
      ...(hero2 ? [{
        label: hero2.name,
        data: STATS.map((s) => hero2[s] ?? 0),
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        borderColor: 'rgba(99, 102, 241, 0.8)',
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
      }] : []),
    ],
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
      legend: {
        labels: { color: '#e5e7eb', font: { size: 12 } },
      },
    },
  }

  const getWinner = (stat: typeof STATS[number]) => {
    const v1 = hero1?.[stat] ?? 0
    const v2 = hero2?.[stat] ?? 0
    if (v1 > v2) return 1
    if (v2 > v1) return 2
    return 0
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">
          Hero <span className="text-yellow-400">Comparison</span>
        </h1>
        <p className="text-gray-400">Search two heroes to compare their power stats</p>
      </div>

      {/* Hero selectors */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        <HeroSearch label="Hero 1" selected={hero1} onSelect={setHero1} />
        <HeroSearch label="Hero 2" selected={hero2} onSelect={setHero2} />
      </div>

      {/* Comparison section */}
      {hero1 && hero2 && (
        <div className="flex flex-col gap-6">

          {/* Dual radar chart */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4 text-center">Power Stats Comparison</h2>
            <div className="max-w-sm mx-auto">
              <Radar data={radarData} options={radarOptions} />
            </div>
          </div>

          {/* Stat-by-stat breakdown */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">Stat Breakdown</h2>
            <div className="flex flex-col gap-4">
              {STATS.map((stat, i) => {
                const v1 = hero1[stat] ?? 0
                const v2 = hero2[stat] ?? 0
                const winner = getWinner(stat)
                return (
                  <div key={stat}>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span className={winner === 1 ? 'text-yellow-400 font-bold' : ''}>{v1}</span>
                      <span className="uppercase tracking-wider">{STAT_LABELS[i]}</span>
                      <span className={winner === 2 ? 'text-indigo-400 font-bold' : ''}>{v2}</span>
                    </div>
                    <div className="flex gap-1 h-2">
                      {/* Hero 1 bar — grows right to left */}
                      <div className="flex-1 bg-gray-700 rounded-l-full overflow-hidden flex justify-end">
                        <div
                          className="bg-yellow-400 h-full rounded-l-full transition-all"
                          style={{ width: `${v1}%` }}
                        />
                      </div>
                      {/* Hero 2 bar — grows left to right */}
                      <div className="flex-1 bg-gray-700 rounded-r-full overflow-hidden">
                        <div
                          className="bg-indigo-400 h-full rounded-r-full transition-all"
                          style={{ width: `${v2}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Overall winner */}
            <div className="mt-6 pt-4 border-t border-gray-700 text-center">
              {(() => {
                const wins1 = STATS.filter((s) => (hero1[s] ?? 0) > (hero2[s] ?? 0)).length
                const wins2 = STATS.filter((s) => (hero2[s] ?? 0) > (hero1[s] ?? 0)).length
                if (wins1 === wins2) return <p className="text-gray-300">⚖️ It's a tie!</p>
                const winner = wins1 > wins2 ? hero1 : hero2
                const color = wins1 > wins2 ? 'text-yellow-400' : 'text-indigo-400'
                return (
                  <p className="text-white">
                    Overall winner:{' '}
                    <span className={`font-bold ${color}`}>{winner.name}</span>
                    <span className="text-gray-400 text-sm ml-2">
                      ({wins1 > wins2 ? wins1 : wins2}/{STATS.length} stats)
                    </span>
                  </p>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Prompt if only one hero selected */}
      {(hero1 || hero2) && !(hero1 && hero2) && (
        <div className="text-center text-gray-400 py-10">
          Now search for a second hero to compare
        </div>
      )}

    </div>
  )
}