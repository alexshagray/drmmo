<?php

namespace App\Http\Controllers\Staff2;

use App\Http\Controllers\Controller;
use App\Models\Incident;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IncidentController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Staff2/IncidentStatus', [
            'incidents' => Incident::with('patients', 'dispatches')
                ->orderBy('reported_at', 'desc')
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'age' => 'nullable|string|max:50',
            'gender' => 'nullable|string|max:20',
            'civil_status' => 'nullable|string|max:50',
            'contact_number' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'type' => 'required|string|max:255',
            'severity' => 'required|in:low,medium,high,critical',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'location_name' => 'nullable|string|max:255',
            'responders' => 'nullable|string|max:255',
            'received_by' => 'nullable|string|max:255',
        ]);

        Incident::create([
            ...$validated,
            'status' => 'active',
            'reported_at' => now(),
        ]);

        return back()->with('status', 'Incident reported.');
    }

    public function update(Request $request, Incident $incident)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'age' => 'nullable|string|max:50',
            'gender' => 'nullable|string|max:20',
            'civil_status' => 'nullable|string|max:50',
            'contact_number' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'type' => 'required|string|max:255',
            'severity' => 'required|in:low,medium,high,critical',
            'status' => 'required|in:active,resolved,cancelled',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'location_name' => 'nullable|string|max:255',
            'responders' => 'nullable|string|max:255',
            'received_by' => 'nullable|string|max:255',
        ]);

        if ($validated['status'] === 'resolved' && $incident->status !== 'resolved') {
            $validated['resolved_at'] = now();
        }

        $incident->update($validated);

        return back()->with('status', 'Incident updated.');
    }

    public function destroy(Incident $incident)
    {
        $incident->delete();
        return back()->with('status', 'Incident removed.');
    }
}
