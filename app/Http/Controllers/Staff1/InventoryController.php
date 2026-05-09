<?php

namespace App\Http\Controllers\Staff1;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(): Response
    {
        $items = InventoryItem::with('logs')->orderBy('name')->get();
        $lowStockItems = $items->filter(fn ($i) => $i->quantity <= $i->min_stock_level)->values();

        return Inertia::render('Staff1/Inventory', [
            'items' => $items,
            'dispatches' => \App\Models\ResourceDispatch::with(['item', 'incident'])
                ->orderBy('created_at', 'desc')
                ->limit(20)
                ->get(),
            'dispatchRequests' => \App\Models\DispatchRequest::orderBy('created_at', 'desc')->get(),
            'recentLogs' => InventoryLog::with('item')
                ->orderBy('created_at', 'desc')
                ->limit(20)
                ->get(),
            'lowStockItems' => $lowStockItems,
            'summary' => [
                'total_items' => $items->count(),
                'total_quantity' => $items->sum('quantity'),
                'good_condition_items' => $items->whereIn('condition', ['brand new', 'good'])->count(),
                'poor_items' => $items->where('condition', 'poor')->count(),
                'low_stock_count' => $lowStockItems->count(),
                'total_dispatches' => \App\Models\ResourceDispatch::count(),
                'pending_dispatches' => \App\Models\ResourceDispatch::where('status', 'dispatched')->count(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type_of_emergency' => 'required|string|max:255',
            'type_of_supply' => 'required|string|max:255',
            'quantity' => 'required|integer|min:0',
            'stock' => 'required|integer|min:0',
            'condition' => 'required|string|in:brand new,good,damaged,under maintenance',
        ]);

        $item = InventoryItem::create([
            'name' => $validated['name'],
            'type_of_emergency' => $validated['type_of_emergency'],
            'category' => $validated['type_of_supply'],
            'quantity' => $validated['quantity'],
            'min_stock_level' => $validated['stock'],
            'condition' => $validated['condition'],
        ]);

        InventoryLog::create([
            'inventory_item_id' => $item->id,
            'type' => 'stock_update',
            'message' => 'Item created with quantity ' . $item->quantity,
            'quantity_before' => 0,
            'quantity_after' => $item->quantity,
        ]);

        return back()->with('status', 'Item added.');
    }

    public function update(Request $request, InventoryItem $item)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type_of_emergency' => 'required|string|max:255',
            'type_of_supply' => 'required|string|max:255',
            'quantity' => 'required|integer|min:0',
            'stock' => 'required|integer|min:0',
            'condition' => 'required|string|in:brand new,good,damaged,under maintenance',
        ]);

        $oldQty = $item->quantity;
        $item->update([
            'name' => $validated['name'],
            'type_of_emergency' => $validated['type_of_emergency'],
            'category' => $validated['type_of_supply'],
            'quantity' => $validated['quantity'],
            'min_stock_level' => $validated['stock'],
            'condition' => $validated['condition'],
        ]);

        if ($oldQty !== $item->quantity) {
            InventoryLog::create([
                'inventory_item_id' => $item->id,
                'type' => 'stock_update',
                'message' => 'Quantity updated from ' . $oldQty . ' to ' . $item->quantity,
                'quantity_before' => $oldQty,
                'quantity_after' => $item->quantity,
            ]);
        }

        if ($item->quantity <= $item->min_stock_level) {
            InventoryLog::create([
                'inventory_item_id' => $item->id,
                'type' => 'low_stock',
                'message' => 'Low stock alert: ' . $item->quantity . ' remaining (min: ' . $item->min_stock_level . ')',
            ]);
        }

        return back()->with('status', 'Item updated.');
    }

    public function destroy(InventoryItem $item)
    {
        $item->delete();
        return back()->with('status', 'Item deleted.');
    }
}
