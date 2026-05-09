<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EquipmentReturn;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EquipmentReturnApiController extends Controller
{
    public function index(): JsonResponse
    {
        $returns = EquipmentReturn::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $returns,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'item_name' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
            'condition' => 'required|string|in:brand new,good,damaged,under maintenance,Brand New,Good,Damaged,Under Maintenance',
            'remarks' => 'nullable|string',
            'notification_id' => 'nullable|integer',
        ]);

        // Normalize inputs to title case for consistency
        $condition = ucwords($validated['condition']);
        $itemName = trim($validated['item_name']);

        // Check if there's an existing return with same item name and condition (pending status) - case-insensitive
        $existingReturn = EquipmentReturn::whereRaw('LOWER(item_name) = ?', [strtolower($itemName)])
            ->whereRaw('LOWER(`condition`) = ?', [strtolower($condition)])
            ->where('status', 'pending')
            ->first();

        if ($existingReturn) {
            // Update quantity of existing return
            $existingReturn->quantity += $validated['quantity'];
            $existingReturn->remarks = $validated['remarks'] ?? $existingReturn->remarks;
            $existingReturn->save();

            return response()->json([
                'success' => true,
                'message' => 'Equipment return quantity updated',
                'data' => $existingReturn,
            ]);
        }

        // Create new return if no existing match
        $return = EquipmentReturn::create([
            'item_name' => $itemName,
            'quantity' => $validated['quantity'],
            'condition' => $condition,
            'remarks' => $validated['remarks'] ?? null,
            'notification_id' => $validated['notification_id'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Equipment return added successfully',
            'data' => $return,
        ], 201);
    }

    public function update(Request $request, EquipmentReturn $return): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,approved,rejected',
        ]);

        $return->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Equipment return status updated',
            'data' => $return,
        ]);
    }

    public function destroy(EquipmentReturn $return): JsonResponse
    {
        $return->delete();

        return response()->json([
            'success' => true,
            'message' => 'Equipment return deleted',
        ]);
    }
}
