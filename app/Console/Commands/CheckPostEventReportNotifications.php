<?php

namespace App\Console\Commands;

use App\Models\Incident;
use App\Models\PostEventReport;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

#[Signature('app:check-post-event-report-notifications')]
#[Description('Check for incidents that are 2 days old and notify Staff 2 to create post-event reports')]
class CheckPostEventReportNotifications extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Get incidents that are 2 days old (resolved) and don't have a post-event report
        $twoDaysAgo = now()->subDays(2);
        
        $incidentsNeedingReports = Incident::where('status', 'resolved')
            ->where('resolved_at', '>=', $twoDaysAgo)
            ->where('resolved_at', '<', now()->subDays(1))
            ->whereDoesntHave('postEventReports')
            ->get();

        // Get Staff 2 users
        $staff2Users = User::where('role', 'staff2')->get();

        foreach ($incidentsNeedingReports as $incident) {
            // Check if notification already exists for this incident
            $existingNotification = Notification::where('type', 'post_event_reminder')
                ->whereJsonContains('data->incident_id', $incident->id)
                ->exists();

            if (!$existingNotification) {
                foreach ($staff2Users as $user) {
                    Notification::create([
                        'user_id' => $user->id,
                        'type' => 'post_event_reminder',
                        'title' => 'Post-Event Report Due',
                        'message' => "Post-event report is due for incident: {$incident->title}",
                        'data' => json_encode([
                            'incident_id' => $incident->id,
                            'incident_title' => $incident->title,
                            'incident_date' => $incident->resolved_at->format('Y-m-d'),
                        ]),
                        'is_read' => false,
                    ]);
                }
            }
        }

        $this->info('Checked post-event report notifications. Processed ' . $incidentsNeedingReports->count() . ' incidents.');
    }
}
