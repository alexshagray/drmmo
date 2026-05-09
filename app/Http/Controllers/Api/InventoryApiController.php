<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InventoryApiController extends Controller
{
    public function index(): JsonResponse
    {
        $items = InventoryItem::with('logs')
            ->orderBy('name')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'category' => $item->category,
                    'type_of_emergency' => $item->type_of_emergency ?? null,
                    'quantity' => $item->quantity,
                    'min_stock_level' => $item->min_stock_level,
                    'condition' => $item->condition ?? 'good',
                    'created_at' => $item->created_at?->toISOString(),
                    'updated_at' => $item->updated_at?->toISOString(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    public function show(InventoryItem $item): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'item_id' => $item->id,
                'item_name' => $item->name,
                'category' => $item->category,
                'stock_quantity' => $item->quantity,
                'unit_measure' => $item->unit_measure ?? 'pcs',
                'reorder_level' => $item->min_stock_level,
                'location_bin' => $item->location_bin ?? 'A1',
                'status' => $this->getStatus($item),
                'condition' => $item->condition ?? 'good',
                'created_at' => $item->created_at?->toISOString(),
                'updated_at' => $item->updated_at?->toISOString(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'item_name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'stock_quantity' => 'required|integer|min:0',
            'reorder_level' => 'required|integer|min:0',
            'location_bin' => 'nullable|string|max:255',
            'condition' => 'nullable|string|in:brand new,good,damaged,under maintenance',
        ]);

        $item = InventoryItem::create([
            'name' => $validated['item_name'],
            'category' => $validated['category'],
            'quantity' => $validated['stock_quantity'],
            'min_stock_level' => $validated['reorder_level'],
            'location_bin' => $validated['location_bin'] ?? 'A1',
            'condition' => $validated['condition'] ?? 'good',
        ]);

        InventoryLog::create([
            'inventory_item_id' => $item->id,
            'type' => 'stock_update',
            'message' => 'Item created via API with quantity ' . $item->quantity,
            'quantity_before' => 0,
            'quantity_after' => $item->quantity,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Item created successfully',
            'data' => [
                'item_id' => $item->id,
                'item_name' => $item->name,
                'category' => $item->category,
                'stock_quantity' => $item->quantity,
                'status' => $this->getStatus($item),
            ],
        ], 201);
    }

    public function update(Request $request, InventoryItem $item): JsonResponse
    {
        $validated = $request->validate([
            'item_name' => 'sometimes|string|max:255',
            'category' => 'sometimes|string|max:255',
            'stock_quantity' => 'sometimes|integer|min:0',
            'reorder_level' => 'sometimes|integer|min:0',
            'location_bin' => 'nullable|string|max:255',
            'condition' => 'nullable|string|in:brand new,good,damaged,under maintenance',
        ]);

        $oldQty = $item->quantity;

        if (isset($validated['item_name'])) {
            $item->name = $validated['item_name'];
        }
        if (isset($validated['category'])) {
            $item->category = $validated['category'];
        }
        if (isset($validated['stock_quantity'])) {
            $item->quantity = $validated['stock_quantity'];
        }
        if (isset($validated['reorder_level'])) {
            $item->min_stock_level = $validated['reorder_level'];
        }
        if (isset($validated['location_bin'])) {
            $item->location_bin = $validated['location_bin'];
        }
        if (isset($validated['condition'])) {
            $item->condition = $validated['condition'];
        }

        $item->save();

        if ($oldQty !== $item->quantity) {
            InventoryLog::create([
                'inventory_item_id' => $item->id,
                'type' => 'stock_update',
                'message' => 'Quantity updated via API from ' . $oldQty . ' to ' . $item->quantity,
                'quantity_before' => $oldQty,
                'quantity_after' => $item->quantity,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Item updated successfully',
            'data' => [
                'item_id' => $item->id,
                'item_name' => $item->name,
                'stock_quantity' => $item->quantity,
                'status' => $this->getStatus($item),
            ],
        ]);
    }

    public function destroy(InventoryItem $item): JsonResponse
    {
        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item deleted successfully',
        ]);
    }

    private function getStatus(InventoryItem $item): string
    {
        if ($item->quantity <= 0) {
            return 'Out of Stock';
        }
        if ($item->quantity <= $item->min_stock_level) {
            return 'Under Maintenance';
        }
        return 'In Stock';
    }
}
