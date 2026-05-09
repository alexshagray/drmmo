<?php

namespace App\Http\Controllers\Staff1;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\InventoryLog;
use Inertia\Inertia;
use Inertia\Response;

class InventoryReportController extends Controller
{
    public function index(): Response
    {
        $items = InventoryItem::orderBy('name')->get();

        $categorySummary = $items->groupBy('category')->map(function ($group) {
            return [
                'category' => $group->first()->category,
                'count' => $group->count(),
                'total_quantity' => $group->sum('quantity'),
                'low_stock_count' => $group->filter(fn ($i) => $i->quantity <= $i->min_stock_level)->count(),
            ];
        })->values();

        $recentLogs = InventoryLog::with('item')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return Inertia::render('Staff1/InventoryReports', [
            'items' => $items,
            'categorySummary' => $categorySummary,
            'recentLogs' => $recentLogs,
            'summary' => [
                'total_items' => $items->count(),
                'total_quantity' => $items->sum('quantity'),
                'low_stock_items' => $items->filter(fn ($i) => $i->quantity <= $i->min_stock_level)->count(),
                'maintenance_items' => $items->where('status', 'maintenance')->count(),
            ],
        ]);
    }
}
