import Staff2Layout from '@/Layouts/Staff2Layout';
import { Head } from '@inertiajs/react';

export default function IncidentMap({ incidents }) {
    const incidentsWithLocation = incidents.filter(i => i.latitude && i.longitude);

    return (
        <Staff2Layout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Incident Map Location</h2>}
        >
            <Head title="Incident Map Location" />
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Active Incident Locations</h3>
                    {incidentsWithLocation.length === 0 ? (
                        <p className="text-gray-500">No incidents with location data available.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {incidentsWithLocation.map((inc) => (
                                <div key={inc.id} className={`border rounded-lg p-4 ${
                                    inc.severity === 'critical' ? 'border-red-400 bg-red-50' :
                                    inc.severity === 'high' ? 'border-orange-400 bg-orange-50' :
                                    inc.severity === 'medium' ? 'border-yellow-400 bg-yellow-50' :
                                    'border-blue-400 bg-blue-50'
                                }`}>
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-medium text-gray-900">{inc.title}</h4>
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                            inc.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                            inc.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                            inc.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {inc.severity}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{inc.location_name || 'Unknown location'}</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Lat: {inc.latitude}, Lng: {inc.longitude}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2 capitalize">{inc.type} | {inc.status}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Location Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">{incidentsWithLocation.length}</div>
                            <div className="text-xs text-gray-500">Mapped Incidents</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">
                                {incidentsWithLocation.filter(i => i.severity === 'critical').length}
                            </div>
                            <div className="text-xs text-gray-500">Critical</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">
                                {incidentsWithLocation.filter(i => i.severity === 'high').length}
                            </div>
                            <div className="text-xs text-gray-500">High</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                {incidents.filter(i => !i.latitude || !i.longitude).length}
                            </div>
                            <div className="text-xs text-gray-500">Unmapped</div>
                        </div>
                    </div>
                </div>
            </div>
        </Staff2Layout>
    );
}
