<?php

namespace App\Http\Controllers\Staff1;

use App\Http\Controllers\Controller;
use App\Models\TrainedPersonnel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PersonnelTrainingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Staff1/PersonnelTraining', [
            'personnel' => TrainedPersonnel::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_number' => 'required|digits:11|regex:/^09\d{9}$/|unique:trained_personnel,contact_number',
            'specialization' => 'required|string|max:255',
            'barangay' => 'required|string|max:255',
            'age' => 'nullable|integer|min:1|max:120',
            'sex' => 'nullable|in:Male,Female,Other',
            'status' => 'required|in:active,inactive,expired',
            'notes' => 'nullable|string',
        ]);

        TrainedPersonnel::create($validated);

        return back()->with('status', 'Personnel added.');
    }

    public function update(Request $request, TrainedPersonnel $personnel)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_number' => 'required|digits:11|regex:/^09\d{9}$/|unique:trained_personnel,contact_number,' . $personnel->id,
            'specialization' => 'required|string|max:255',
            'barangay' => 'required|string|max:255',
            'age' => 'nullable|integer|min:1|max:120',
            'sex' => 'nullable|in:Male,Female,Other',
            'status' => 'required|in:active,inactive,expired',
            'notes' => 'nullable|string',
        ]);

        $personnel->update($validated);

        return back()->with('status', 'Personnel updated.');
    }

    public function destroy(TrainedPersonnel $personnel)
    {
        $personnel->delete();
        return back()->with('status', 'Personnel removed.');
    }
}
