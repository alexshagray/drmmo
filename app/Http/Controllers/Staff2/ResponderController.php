<?php

namespace App\Http\Controllers\Staff2;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Incident;
use App\Models\TrainedPersonnel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ResponderController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Staff2/ResponderCoordination', [
            'patients' => Patient::with('incident')
                ->orderBy('created_at', 'desc')
                ->get(),
            'incidents' => Incident::where('status', 'active')
                ->select('id', 'title', 'location_name')
                ->get(),
            'responders' => TrainedPersonnel::where('status', 'active')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:255',
            'emergency_contact' => 'nullable|string|max:255',
            'medical_history' => 'nullable|string',
            'condition' => 'nullable|string|max:255',
            'status' => 'required|in:stable,critical,deceased,discharged',
            'incident_id' => 'nullable|exists:incidents,id',
        ]);

        Patient::create($validated);

        return back()->with('status', 'Patient record created.');
    }

    public function update(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:255',
            'emergency_contact' => 'nullable|string|max:255',
            'medical_history' => 'nullable|string',
            'condition' => 'nullable|string|max:255',
            'status' => 'required|in:stable,critical,deceased,discharged',
            'incident_id' => 'nullable|exists:incidents,id',
        ]);

        $patient->update($validated);

        return back()->with('status', 'Patient record updated.');
    }

    public function destroy(Patient $patient)
    {
        $patient->delete();
        return back()->with('status', 'Patient record removed.');
    }
}
