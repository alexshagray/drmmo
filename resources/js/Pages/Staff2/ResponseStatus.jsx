import Staff2Layout from '@/Layouts/Staff2Layout';
import { Head } from '@inertiajs/react';

export default function ResponseStatus({ incidents, patients, responders }) {
    const totalIncidents = incidents.length;
    const activeIncidents = incidents.filter(i => i.status === 'active' || i.status === 'acknowledged').length;
    const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;
    const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;

    const statusColor = (status) => {
        if (status === 'resolved') return 'bg-green-100 text-green-800';
        if (status === 'active' || status === 'acknowledged') return 'bg-yellow-100 text-yellow-800';
        if (status === 'cancelled') return 'bg-gray-100 text-gray-800';
        return 'bg-blue-100 text-blue-800';
    };

    return (
        <Staff2Layout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Track Response Status</h2>}
        >
            <Head title="Response Status" />
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Incidents</p>
                        <p className="text-2xl font-bold text-gray-800 mt-0.5">{totalIncidents}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active Responses</p>
                        <p className="text-2xl font-bold text-yellow-600 mt-0.5">{activeIncidents}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Resolved</p>
                        <p className="text-2xl font-bold text-green-600 mt-0.5">{resolvedIncidents}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Critical</p>
                        <p className="text-2xl font-bold text-red-600 mt-0.5">{criticalIncidents}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Incident Response Tracker</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Patients</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {incidents.map((inc) => (
                                        <tr key={inc.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{inc.title}</td>
                                            <td className="px-4 py-2">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    inc.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                                    inc.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                                    inc.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {inc.severity}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColor(inc.status)}`}>
                                                    {inc.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-500">{inc.location_name || 'N/A'}</td>
                                            <td className="px-4 py-2 text-sm text-gray-500">{patients?.filter(p => p.incident_id === inc.id).length || 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Responder Overview</h3>
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase">Total Responders</p>
                                <p className="text-2xl font-bold text-gray-900">{responders?.length || 0}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase">Total Patients</p>
                                <p className="text-2xl font-bold text-gray-900">{patients?.length || 0}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase">Avg. per Incident</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {totalIncidents > 0 ? ((patients?.length || 0) / totalIncidents).toFixed(1) : '0'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Staff2Layout>
    );
}
