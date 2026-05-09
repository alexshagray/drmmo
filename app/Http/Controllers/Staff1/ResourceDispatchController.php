<?php

namespace App\Http\Controllers\Staff1;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\Incident;
use App\Models\ResourceDispatch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ResourceDispatchController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Staff1/ResourceDispatch', [
            'dispatches' => ResourceDispatch::with(['item', 'incident'])
                ->orderBy('created_at', 'desc')
                ->get(),
            'availableItems' => InventoryItem::where('quantity', '>', 0)
                ->where('status', 'available')
                ->get(),
            'activeIncidents' => Incident::where('status', 'active')
                ->select('id', 'title', 'location_name')
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'incident_id' => 'nullable|exists:incidents,id',
            'quantity_dispatched' => 'required|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        $item = InventoryItem::findOrFail($validated['inventory_item_id']);

        if ($item->quantity < $validated['quantity_dispatched']) {
            return back()->withErrors(['quantity_dispatched' => 'Not enough stock available.']);
        }

        $oldQty = $item->quantity;
        $item->decrement('quantity', $validated['quantity_dispatched']);

        $dispatch = ResourceDispatch::create([
            ...$validated,
            'status' => 'dispatched',
            'dispatched_at' => now(),
        ]);

        return back()->with('status', 'Resource dispatched.');
    }

    public function update(Request $request, ResourceDispatch $dispatch)
    {
        $validated = $request->validate([
            'status' => 'required|in:dispatched,delivered,cancelled',
        ]);

        $dispatch->update($validated);

        if ($validated['status'] === 'cancelled') {
            $dispatch->item->increment('quantity', $dispatch->quantity_dispatched);
        }

        return back()->with('status', 'Dispatch updated.');
    }
}
