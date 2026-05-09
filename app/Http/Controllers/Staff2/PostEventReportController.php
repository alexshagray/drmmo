<?php

namespace App\Http\Controllers\Staff2;

use App\Http\Controllers\Controller;
use App\Models\Incident;
use App\Models\PostEventReport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PostEventReportController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Staff2/PostEventReports', [
            'reports' => PostEventReport::with(['incident'])
                ->orderBy('created_at', 'desc')
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'incident_id' => 'required|exists:incidents,id',
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

        return back()->with('status', 'Report updated.');
    }

    public function destroy(PostEventReport $report)
    {
        $report->delete();
        return back()->with('status', 'Report deleted.');
    }
}
