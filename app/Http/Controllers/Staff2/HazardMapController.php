<?php

namespace App\Http\Controllers\Staff2;

use App\Http\Controllers\Controller;
use App\Models\Barangay;
use App\Models\HazardMapImage;
use App\Models\Incident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class HazardMapController extends Controller
{
    public function index(): Response
    {
        $historicalIncidents = Incident::whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->select('id', 'title', 'severity', 'status', 'latitude', 'longitude', 'location_name', 'type')
            ->orderBy('reported_at', 'desc')
            ->limit(500)
            ->get();

        $barangays = Barangay::with('hazardImages')->get();

        return Inertia::render('Staff2/HazardMap', [
            'historicalIncidents' => $historicalIncidents,
            'barangays' => $barangays,
        ]);
    }

    public function store(Request $Request)
    {
        $request = $Request;

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
            'description' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'barangay_id' => 'nullable|exists:barangays,id',
        ]);

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('hazard-maps', 'public');
        }

        HazardMapImage::create([
            'user_id' => Auth::id(),
            'barangay_id' => $validated['barangay_id'] ?? null,
            'title' => $validated['title'],
            'image_path' => $imagePath,
            'description' => $validated['description'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
        ]);

        return back()->with('success', 'Hazard map image uploaded successfully.');
    }

    public function update(Request $request, HazardMapImage $hazardMapImage)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'description' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'barangay_id' => 'nullable|exists:barangays,id',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($hazardMapImage->image_path) {
                Storage::disk('public')->delete($hazardMapImage->image_path);
            }
            $hazardMapImage->image_path = $request->file('image')->store('hazard-maps', 'public');
        }

        $hazardMapImage->title = $validated['title'];
        $hazardMapImage->description = $validated['description'] ?? null;
        $hazardMapImage->latitude = $validated['latitude'] ?? null;
        $hazardMapImage->longitude = $validated['longitude'] ?? null;
        $hazardMapImage->barangay_id = $validated['barangay_id'] ?? null;
        $hazardMapImage->save();

        return back()->with('success', 'Hazard map image updated successfully.');
    }

    public function destroy(HazardMapImage $hazardMapImage)
    {
        // Delete the image file from storage
        if ($hazardMapImage->image_path) {
            Storage::disk('public')->delete($hazardMapImage->image_path);
        }

        $hazardMapImage->delete();

        return back()->with('success', 'Hazard map image deleted successfully.');
    }

    public function storeBarangay(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:barangays',
            'description' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'population' => 'nullable|integer',
            'hazard_type' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            try {
                $imagePath = $request->file('image')->store('hazard-maps', 'public');
            } catch (\Exception $e) {
                \Log::error('Image upload failed: ' . $e->getMessage());
                return back()->with('error', 'Image upload failed: ' . $e->getMessage());
            }
        }

        try {
            Barangay::create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
                'population' => $validated['population'] ?? null,
                'hazard_type' => $validated['hazard_type'] ?? null,
                'image_path' => $imagePath,
            ]);
        } catch (\Exception $e) {
            \Log::error('Barangay creation failed: ' . $e->getMessage());
            return back()->with('error', 'Barangay creation failed: ' . $e->getMessage());
        }

        return back()->with('success', 'Barangay created successfully.');
    }

    public function updateBarangay(Request $request, Barangay $barangay)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:barangays,name,' . $barangay->id,
            'description' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'population' => 'nullable|integer',
            'hazard_type' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240',
        ]);

        if ($request->hasFile('image')) {
            if ($barangay->image_path) {
                Storage::disk('public')->delete($barangay->image_path);
            }
            $barangay->image_path = $request->file('image')->store('hazard-maps', 'public');
        }

        $barangay->name = $validated['name'];
        $barangay->description = $validated['description'] ?? null;
        $barangay->latitude = $validated['latitude'] ?? null;
        $barangay->longitude = $validated['longitude'] ?? null;
        $barangay->population = $validated['population'] ?? null;
        $barangay->hazard_type = $validated['hazard_type'] ?? null;
        $barangay->save();

        return back()->with('success', 'Barangay updated successfully.');
    }
}
