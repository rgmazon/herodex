import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

interface Hero {
  id: number
  slug: string
  name: string
  image_url: string | null
}

interface TeamMember {
  id: number
  hero_team_id: number
  hero_id: number
  hero: Hero
}

interface HeroTeam {
  id: number
  team_name: string
  members: TeamMember[]
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<HeroTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [newTeamName, setNewTeamName] = useState('')
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/teams')
      .then((res) => setTeams(res.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const createTeam = async () => {
    if (!newTeamName.trim()) return
    setCreating(true)
    try {
      const res = await api.post('/teams', { team_name: newTeamName.trim() })
      setTeams((prev) => [res.data.data, ...prev])
      setNewTeamName('')
    } catch {}
    finally { setCreating(false) }
  }

  const deleteTeam = async (teamId: number) => {
    await api.delete(`/teams/${teamId}`)
    setTeams((prev) => prev.filter((t) => t.id !== teamId))
  }

  const removeMember = async (teamId: number, heroSlug: string) => {
    await api.delete(`/teams/${teamId}/members/${heroSlug}`)
    setTeams((prev) => prev.map((t) =>
      t.id === teamId
        ? { ...t, members: t.members.filter((m) => m.hero.slug !== heroSlug) }
        : t
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading teams...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">My Teams</h1>
        <p className="text-gray-400">
          {teams.length === 0
            ? 'No teams yet — create one below'
            : `${teams.length} team${teams.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {/* Create team form */}
      <div className="bg-gray-800 rounded-2xl p-5 mb-8 flex gap-3">
        <input
          type="text"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && createTeam()}
          placeholder="Team name (e.g. Avengers)"
          maxLength={100}
          className="flex-1 bg-gray-700 text-white placeholder-gray-500 border border-gray-600 rounded-lg px-4 py-2.5 focus:outline-none focus:border-yellow-400 transition-colors text-sm"
        />
        <button
          onClick={createTeam}
          disabled={creating || !newTeamName.trim()}
          className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-bold px-5 py-2.5 rounded-lg transition-colors text-sm"
        >
          {creating ? '...' : 'Create Team'}
        </button>
      </div>

      {/* Teams list */}
      {teams.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🦸</p>
          <p className="text-gray-400">Create your first team above.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {teams.map((team) => (
            <div key={team.id} className="bg-gray-800 rounded-2xl p-5">

              {/* Team header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-white font-bold text-lg">{team.team_name}</h2>
                  <p className="text-gray-400 text-sm">
                    {team.members.length}/6 members
                  </p>
                </div>
                <button
                  onClick={() => deleteTeam(team.id)}
                  className="text-gray-500 hover:text-red-400 text-sm transition-colors"
                >
                  Delete team
                </button>
              </div>

              {/* Members grid */}
              {team.members.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No members yet — add heroes from their profile pages.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {team.members.map((member) => (
                    <div key={member.id} className="relative group">
                      <div
                        onClick={() => navigate(`/heroes/${member.hero.slug}`)}
                        className="bg-gray-700 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-yellow-400 transition-all"
                      >
                        <div className="aspect-square overflow-hidden">
                          {member.hero.image_url ? (
                            <img
                              src={member.hero.image_url}
                              alt={member.hero.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">
                              🦸
                            </div>
                          )}
                        </div>
                        <p className="text-white text-xs font-medium p-2 truncate">
                          {member.hero.name}
                        </p>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => removeMember(team.id, member.hero.slug)}
                        className="absolute top-1 right-1 bg-gray-900/80 hover:bg-red-900/80 text-white hover:text-red-300 rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove from team"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* Empty slots */}
                  {Array.from({ length: 6 - team.members.length }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="aspect-square bg-gray-700/50 rounded-xl border-2 border-dashed border-gray-600 flex items-center justify-center"
                    >
                      <span className="text-gray-600 text-2xl">+</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}