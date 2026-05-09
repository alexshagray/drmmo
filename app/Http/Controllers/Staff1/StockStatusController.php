<?php

namespace App\Http\Controllers\Staff1;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use Inertia\Inertia;
use Inertia\Response;

class StockStatusController extends Controller
{
    public function index(): Response
    {
        $items = InventoryItem::orderBy('name')->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'category' => $item->category,
                'quantity' => $item->quantity,
                'min_stock_level' => $item->min_stock_level,
                'location' => $item->location,
                'status' => $item->status,
                'stock_level' => $item->quantity <= $item->min_stock_level ? 'low' : ($item->quantity == 0 ? 'out' : 'normal'),
            ];
        });

        return Inertia::render('Staff1/StockStatus', [
            'items' => $items,
            'summary' => [
                'total_items' => $items->count(),
                'in_stock' => $items->where('status', 'available')->count(),
                'low_stock' => $items->where('stock_level', 'low')->count(),
                'out_of_stock' => $items->where('stock_level', 'out')->count(),
            ],
        ]);
    }
}
