<?php

namespace App\Http\Controllers\Staff1;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MonitoringAlertController extends Controller
{
    public function index(): Response
    {
        $lowStockItems = InventoryItem::whereColumn('quantity', '<=', 'min_stock_level')
            ->where('status', 'available')
            ->get();

        $alerts = InventoryLog::with('item')
            ->whereIn('type', ['low_stock', 'alert'])
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        $equipmentStatus = InventoryItem::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();

        return Inertia::render('Staff1/MonitoringAlerts', [
            'lowStockItems' => $lowStockItems,
            'alerts' => $alerts,
            'equipmentStatus' => $equipmentStatus,
        ]);
    }
}
