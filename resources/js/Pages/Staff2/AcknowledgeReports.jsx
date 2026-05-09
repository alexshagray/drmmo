import Staff2Layout from '@/Layouts/Staff2Layout';
import { Head, useForm } from '@inertiajs/react';

export default function AcknowledgeReports({ incidents }) {
    const { patch, processing } = useForm();

    const acknowledge = (incident) => {
        if (confirm('Acknowledge this incident report?')) {
            patch(route('staff2.incidents.update', incident.id), {
                ...incident,
                status: 'acknowledged',
            });
        }
    };

    const severityColor = (s) => {
        if (s === 'critical') return 'bg-red-100 text-red-800';
        if (s === 'high') return 'bg-orange-100 text-orange-800';
        if (s === 'medium') return 'bg-yellow-100 text-yellow-800';
        return 'bg-blue-100 text-blue-800';
    };

    const pending = incidents.filter(i => i.status !== 'acknowledged' && i.status !== 'resolved' && i.status !== 'cancelled');
    const acknowledged = incidents.filter(i => i.status === 'acknowledged');

    return (
        <Staff2Layout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Acknowledge Reports</h2>}
        >
            <Head title="Acknowledge Reports" />
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Acknowledgment</h3>
                        {pending.length === 0 ? (
                            <p className="text-gray-500 text-sm">No pending reports to acknowledge.</p>
                        ) : (
                            <div className="space-y-3">
                                {pending.map((inc) => (
                                    <div key={inc.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium text-gray-900">{inc.title}</h4>
                                                <p className="text-sm text-gray-500">{inc.location_name || 'No location'}</p>
                                            </div>
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${severityColor(inc.severity)}`}>
                                                {inc.severity}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2">{inc.description}</p>
                                        <div className="mt-3 flex gap-3">
                                            <button
                                                onClick={() => acknowledge(inc)}
                                                disabled={processing}
                                                className="inline-flex items-center px-3 py-1.5 bg-emerald-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50"
                                            >
                                                Acknowledge
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Acknowledged Reports</h3>
                        {acknowledged.length === 0 ? (
                            <p className="text-gray-500 text-sm">No acknowledged reports yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {acknowledged.map((inc) => (
                                    <div key={inc.id} className="border border-gray-200 rounded-lg p-4 bg-emerald-50/50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium text-gray-900">{inc.title}</h4>
                                                <p className="text-sm text-gray-500">{inc.location_name || 'No location'}</p>
                                            </div>
                                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800">
                                                acknowledged
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2">{inc.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Staff2Layout>
    );
}
