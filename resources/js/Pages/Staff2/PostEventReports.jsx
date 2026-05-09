import Staff2Layout from '@/Layouts/Staff2Layout';
import { Head } from '@inertiajs/react';

export default function PostEventReports({ reports }) {
    return (
        <Staff2Layout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Post-Event Reporting</h2>}
        >
            <Head title="Post-Event Reports" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Post-Event Reports</h3>
                        <div className="space-y-4">
                            {reports.map((r) => (
                                <div key={r.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-lg font-medium text-gray-900">{r.title}</h4>
                                            <p className="text-sm text-gray-500">Incident: {r.incident?.title || 'N/A'}</p>
                                            <p className="text-sm text-gray-500">Date: {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                            r.status === 'final' ? 'bg-green-100 text-green-800' :
                                            r.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {r.status}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-700">{r.summary}</p>
                                    {r.actions_taken && (
                                        <p className="mt-2 text-sm text-gray-600"><strong>Actions Taken:</strong> {r.actions_taken}</p>
                                    )}
                                    {r.lessons_learned && (
                                        <p className="mt-2 text-sm text-gray-600"><strong>Lessons Learned:</strong> {r.lessons_learned}</p>
                                    )}
                                    {r.recommendations && (
                                        <p className="mt-2 text-sm text-gray-600"><strong>Recommendations:</strong> {r.recommendations}</p>
                                    )}
                                </div>
                            ))}
                            {reports.length === 0 && (
                                <p className="text-gray-500 text-center py-8">No post-event reports available.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Staff2Layout>
    );
}
