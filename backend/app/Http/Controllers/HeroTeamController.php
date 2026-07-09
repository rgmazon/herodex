<?php

namespace App\Http\Controllers;

use App\Models\Hero;
use App\Models\HeroTeam;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HeroTeamController extends Controller
{
    /**
     * List the authenticated user's teams with members.
     * GET /api/teams
     */
    public function index(Request $request): JsonResponse
    {
        $teams = $request->user()
            ->heroTeams()
            ->with('members.hero')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $teams]);
    }

    /**
     * Create a new team.
     * POST /api/teams
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'team_name' => ['required', 'string', 'max:100'],
        ]);

        $team = $request->user()->heroTeams()->create($validated);

        return response()->json(['data' => $team], 201);
    }

    /**
     * Delete a team.
     * DELETE /api/teams/{team}
     */
    public function destroy(Request $request, HeroTeam $team): JsonResponse
    {
        // Ensure the team belongs to the authenticated user
        if ($team->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $team->delete();

        return response()->json(['message' => 'Team deleted.']);
    }

    /**
     * Add a hero to a team.
     * POST /api/teams/{team}/members/{hero}
     */
    public function addMember(Request $request, HeroTeam $team, Hero $hero): JsonResponse
    {
        if ($team->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        // Enforce max 6 members
        if ($team->members()->count() >= 6) {
            return response()->json([
                'message' => 'Team is full. Maximum 6 heroes per team.',
            ], 422);
        }

        // Prevent duplicate members
        if ($team->members()->where('hero_id', $hero->id)->exists()) {
            return response()->json([
                'message' => 'Hero is already in this team.',
            ], 409);
        }

        $team->members()->create(['hero_id' => $hero->id]);

        return response()->json([
            'message' => 'Hero added to team.',
            'data'    => $team->load('members.hero'),
        ], 201);
    }

    /**
     * Remove a hero from a team.
     * DELETE /api/teams/{team}/members/{hero}
     */
    public function removeMember(Request $request, HeroTeam $team, Hero $hero): JsonResponse
    {
        if ($team->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $team->members()->where('hero_id', $hero->id)->delete();

        return response()->json(['message' => 'Hero removed from team.']);
    }
}