import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function SystemOversight({ stats, logs }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    System Oversight
                </h2>
            }
        >
            <Head title="System Oversight" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-sm font-medium text-gray-500">Users</h3>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.users}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-sm font-medium text-gray-500">Inventory Items</h3>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.inventory_items}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-sm font-medium text-gray-500">Active Incidents</h3>
                            <p className="mt-2 text-3xl font-bold text-yellow-600">{stats.active_incidents}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-sm font-medium text-gray-500">Resolved Incidents</h3>
                            <p className="mt-2 text-3xl font-bold text-green-600">{stats.resolved_incidents}</p>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">System Logs</h3>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {logs.map((log) => (
                                    <tr key={log.id}>
                                        <td className="px-4 py-2">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                log.level === 'error' ? 'bg-red-100 text-red-800' :
                                                log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {log.level}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{log.category}</td>
                                        <td className="px-4 py-2 text-sm text-gray-900">{log.message}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{log.user?.name || 'System'}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
