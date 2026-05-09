<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Incident;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class IncidentApiController extends Controller
{
    public function index(): JsonResponse
    {
        $incidents = Incident::with(['patients', 'dispatches'])
            ->orderBy('reported_at', 'desc')
            ->get()
            ->map(function ($incident) {
                return [
                    'id' => (string) $incident->id,
                    'responder_id' => $incident->responder_id,
                    'location' => $incident->location_name ?? 'Unknown Location',
                    'call_information' => $incident->description,
                    'status' => $incident->status,
                    'severity' => $incident->severity,
                    'type' => $incident->type,
                    'latitude' => $incident->latitude,
                    'longitude' => $incident->longitude,
                    'created_at' => $incident->reported_at?->toDateString() ?? $incident->created_at?->toDateString(),
                    'patients_count' => $incident->patients->count(),
                    'dispatches_count' => $incident->dispatches->count(),
                    'is_verified' => $incident->is_verified,
                    'verified_at' => $incident->verified_at?->toDateTimeString(),
                    'verified_by' => $incident->verified_by,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $incidents,
        ]);
    }

    public function show(Incident $incident): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'id' => (string) $incident->id,
                'responder_id' => $incident->responder_id,
                'location' => $incident->location_name ?? 'Unknown Location',
                'call_information' => $incident->description,
                'status' => $incident->status,
                'severity' => $incident->severity,
                'type' => $incident->type,
                'latitude' => $incident->latitude,
                'longitude' => $incident->longitude,
                'title' => $incident->title,
                'created_at' => $incident->reported_at?->toDateString() ?? $incident->created_at?->toDateString(),
                'patients' => $incident->patients,
                'dispatches' => $incident->dispatches,
                'is_verified' => $incident->is_verified,
                'verified_at' => $incident->verified_at?->toDateTimeString(),
                'verified_by' => $incident->verified_by,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'age' => 'nullable|string|max:50',
            'gender' => 'nullable|string|max:20',
            'civil_status' => 'nullable|string|max:50',
            'contact_number' => 'nullable|string|max:50',
            'location_name' => 'nullable|string|max:255',
            'call_information' => 'nullable|string',
            'description' => 'nullable|string',
            'status' => 'required|in:active,resolved,pending,cancelled',
            'severity' => 'required|in:low,medium,high,critical',
            'type' => 'required|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'responders' => 'nullable|string|max:255',
            'received_by' => 'nullable|string|max:255',
        ]);

        $incident = Incident::create([
            'title' => $validated['title'],
            'age' => $validated['age'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'civil_status' => $validated['civil_status'] ?? null,
            'contact_number' => $validated['contact_number'] ?? null,
            'location_name' => $validated['location_name'] ?? $validated['title'],
            'description' => $validated['description'] ?? $validated['call_information'] ?? null,
            'status' => $validated['status'] === 'pending' ? 'active' : $validated['status'],
            'severity' => $validated['severity'],
            'type' => $validated['type'],
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'responders' => $validated['responders'] ?? null,
            'received_by' => $validated['received_by'] ?? null,
            'reported_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Incident reported successfully',
            'data' => [
                'id' => (string) $incident->id,
                'location' => $incident->location_name,
                'status' => $incident->status,
                'severity' => $incident->severity,
                'created_at' => $incident->reported_at->toDateString(),
            ],
        ], 201);
    }

    public function update(Request $request, Incident $incident): JsonResponse
    {
        $validated = $request->validate([
            'location' => 'sometimes|string|max:255',
            'call_information' => 'nullable|string',
            'status' => 'sometimes|in:active,resolved,pending,cancelled',
            'severity' => 'sometimes|in:low,medium,high,critical',
            'type' => 'sometimes|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        if (isset($validated['location'])) {
            $incident->location_name = $validated['location'];
            $incident->title = $validated['location'];
        }
        if (isset($validated['call_information'])) {
            $incident->description = $validated['call_information'];
        }
        if (isset($validated['status'])) {
            $newStatus = $validated['status'] === 'pending' ? 'active' : $validated['status'];
            if ($newStatus === 'resolved' && $incident->status !== 'resolved') {
                $incident->resolved_at = now();
            }
            $incident->status = $newStatus;
        }
        if (isset($validated['severity'])) {
            $incident->severity = $validated['severity'];
        }
        if (isset($validated['type'])) {
            $incident->type = $validated['type'];
        }
        if (array_key_exists('latitude', $validated)) {
            $incident->latitude = $validated['latitude'];
        }
        if (array_key_exists('longitude', $validated)) {
            $incident->longitude = $validated['longitude'];
        }

        $incident->save();

        return response()->json([
            'success' => true,
            'message' => 'Incident updated successfully',
            'data' => [
                'id' => (string) $incident->id,
                'location' => $incident->location_name,
                'status' => $incident->status,
                'severity' => $incident->severity,
                'created_at' => $incident->reported_at?->toDateString(),
            ],
        ]);
    }

    public function destroy(Incident $incident): JsonResponse
    {
        $incident->delete();

        return response()->json([
            'success' => true,
            'message' => 'Incident deleted successfully',
        ]);
    }

    public function verify(Request $request, Incident $incident): JsonResponse
    {
        $validated = $request->validate([
            'verified_by' => 'required|string|max:255',
        ]);

        $incident->update([
            'is_verified' => true,
            'verified_at' => now(),
            'verified_by' => $validated['verified_by'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Incident verified successfully',
            'data' => [
                'id' => (string) $incident->id,
                'is_verified' => true,
                'verified_at' => $incident->verified_at->toDateTimeString(),
                'verified_by' => $incident->verified_by,
            ],
        ]);
    }
}
