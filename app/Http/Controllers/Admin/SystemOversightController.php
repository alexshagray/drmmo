<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemLog;
use App\Models\User;
use App\Models\InventoryItem;
use App\Models\Incident;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SystemOversightController extends Controller
{
    public function index(): Response
    {
        $stats = [
            'users' => User::count(),
            'inventory_items' => InventoryItem::count(),
            'active_incidents' => Incident::where('status', 'active')->count(),
            'resolved_incidents' => Incident::where('status', 'resolved')->count(),
        ];

        $logs = SystemLog::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return Inertia::render('Admin/SystemOversight', [
            'stats' => $stats,
            'logs' => $logs,
        ]);
    }
}
