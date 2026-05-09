<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DispatchRequest;
use Illuminate\Http\Request;

class DispatchRequestController extends Controller
{
    public function index()
    {
        $dispatchRequests = DispatchRequest::orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $dispatchRequests,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'requester_name' => 'required|string|max:255',
            'date_time' => 'required|date',
            'category' => 'nullable|string|max:255',
            'items' => 'required|array',
            'items.*.number' => 'nullable|string',
            'items.*.qty' => 'required|string',
            'items.*.item' => 'required|string',
            'items.*.remarks' => 'nullable|string',
        ]);

        $dispatchRequest = DispatchRequest::create([
            'requester_name' => $validated['requester_name'],
            'date_time' => $validated['date_time'],
            'category' => $validated['category'] ?? null,
            'items' => $validated['items'],
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Dispatch request submitted successfully',
            'data' => $dispatchRequest,
        ], 201);
    }

    public function update(Request $request, DispatchRequest $dispatchRequest)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $dispatchRequest->update([
            'status' => $validated['status'],
        ]);

        // If approved, decrease inventory quantities
        if ($validated['status'] === 'approved' && $dispatchRequest->items) {
            foreach ($dispatchRequest->items as $item) {
                $inventoryItem = \App\Models\InventoryItem::where('name', $item['item'])->first();
                if ($inventoryItem) {
                    $inventoryItem->decrement('quantity', (int)$item['qty']);
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Dispatch request status updated successfully',
            'data' => $dispatchRequest,
        ]);
    }

    public function destroy(DispatchRequest $dispatchRequest)
    {
        $dispatchRequest->delete();

        return response()->json([
            'success' => true,
            'message' => 'Dispatch request deleted successfully',
        ]);
    }
}
