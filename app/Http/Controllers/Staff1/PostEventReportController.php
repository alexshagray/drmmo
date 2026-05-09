<?php

namespace App\Http\Controllers\Staff1;

use App\Http\Controllers\Controller;
use App\Models\PostEventReport;
use App\Models\Incident;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PostEventReportController extends Controller
{
    public function index(): Response
    {
        $reports = PostEventReport::with(['incident'])
            ->orderBy('created_at', 'desc')
            ->get();

        $summary = [
            'total_reports' => $reports->count(),
            'draft_count' => $reports->where('status', 'draft')->count(),
            'final_count' => $reports->where('status', 'final')->count(),
            'this_month_count' => $reports->filter(fn ($r) => $r->created_at->isCurrentMonth())->count(),
        ];

        return Inertia::render('Staff1/PostEventReports', [
            'reports' => PostEventReport::with(['incident'])
                ->orderBy('created_at', 'desc')
                ->get(),
            'summary' => $summary,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'required|string',
            'actions_taken' => 'nullable|string',
            'lessons_learned' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'status' => 'required|in:draft,final,archived',
        ]);

        PostEventReport::create($validated);

        return back()->with('status', 'Report created.');
    }

    public function update(Request $request, PostEventReport $report)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'required|string',
            'actions_taken' => 'nullable|string',
            'lessons_learned' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'status' => 'required|in:draft,final,archived',
        ]);

        $report->update($validated);

        return back()->with('status', 'Post-event report updated successfully.');
    }

    public function destroy(PostEventReport $report)
    {
        $report->delete();
        return back()->with('status', 'Post-event report deleted successfully.');
    }
}
