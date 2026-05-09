<?php

namespace App\Http\Controllers\Staff1;

use App\Http\Controllers\Controller;
use App\Models\InventoryLog;
use App\Models\ResourceDispatch;
use Inertia\Inertia;
use Inertia\Response;

class ConsumptionReportController extends Controller
{
    public function index(): Response
    {
        $dispatches = ResourceDispatch::with(['item', 'incident'])
            ->whereIn('status', ['dispatched', 'delivered'])
            ->orderBy('created_at', 'desc')
            ->get();

        $logs = InventoryLog::with('item')
            ->where('type', 'stock_update')
            ->whereNotNull('quantity_before')
            ->whereNotNull('quantity_after')
            ->whereColumn('quantity_after', '<', 'quantity_before')
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get();

        $itemConsumption = $dispatches->groupBy('item.name')->map(function ($group) {
            return [
                'item_name' => $group->first()->item?->name ?? 'N/A',
                'total_dispatched' => $group->sum('quantity_dispatched'),
                'dispatch_count' => $group->count(),
            ];
        })->values()->sortByDesc('total_dispatched')->values();

        return Inertia::render('Staff1/ConsumptionReports', [
            'dispatches' => $dispatches,
            'logs' => $logs,
            'itemConsumption' => $itemConsumption,
            'summary' => [
                'total_dispatched' => $dispatches->sum('quantity_dispatched'),
                'total_incidents' => $dispatches->pluck('incident_id')->unique()->count(),
                'unique_items' => $dispatches->pluck('inventory_item_id')->unique()->count(),
            ],
        ]);
    }
}
