<?php

namespace App\Http\Controllers\Staff1;

use App\Http\Controllers\Controller;
use App\Models\BarangayIssuance;
use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BarangayIssuanceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Staff1/BarangayIssuance', [
            'issuances' => BarangayIssuance::with('item')->orderBy('issued_at', 'desc')->get(),
            'availableItems' => InventoryItem::where('quantity', '>', 0)
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'barangay_name' => 'required|string|max:255',
            'quantity_issued' => 'required|integer|min:1',
            'issued_by' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $item = InventoryItem::findOrFail($validated['inventory_item_id']);

        if ($item->quantity < $validated['quantity_issued']) {
            return back()->withErrors(['quantity_issued' => 'Not enough stock available.']);
        }

        $item->decrement('quantity', $validated['quantity_issued']);

        BarangayIssuance::create([
            ...$validated,
            'issued_at' => now(),
        ]);

        return back()->with('status', 'Items issued to barangay.');
    }
}
