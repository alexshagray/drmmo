<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\Incident;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(): Response
    {
        $inventorySummary = [
            'total_items' => InventoryItem::count(),
            'total_quantity' => InventoryItem::sum('quantity'),
            'low_stock_count' => InventoryItem::whereColumn('quantity', '<=', 'min_stock_level')->count(),
            'by_category' => InventoryItem::selectRaw('category, COUNT(*) as count, SUM(quantity) as total')
                ->groupBy('category')
                ->get(),
        ];

        $incidentStats = [
            'total' => Incident::count(),
            'active' => Incident::where('status', 'active')->count(),
            'resolved' => Incident::where('status', 'resolved')->count(),
            'by_severity' => Incident::selectRaw('severity, COUNT(*) as count')
                ->groupBy('severity')
                ->get(),
        ];

        return Inertia::render('Admin/Reports', [
            'inventorySummary' => $inventorySummary,
            'incidentStats' => $incidentStats,
        ]);
    }
}
