import Staff1Layout from '@/Layouts/Staff1Layout';
import { Head } from '@inertiajs/react';

export default function MonitoringAlerts({ lowStockItems, alerts, equipmentStatus }) {
    return (
        <Staff1Layout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Monitoring & Alerts</h2>}
        >
            <Head title="Monitoring & Alerts" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {equipmentStatus.map((stat) => (
                            <div key={stat.status} className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-sm font-medium text-gray-500 capitalize">{stat.status} Equipment</h3>
                                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.count}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-red-800 mb-4">Low Stock Alerts</h3>
                        {lowStockItems.length === 0 ? (
                            <p className="text-gray-500">No low stock items.</p>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Min Level</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {lowStockItems.map((item) => (
                                        <tr key={item.id} className="bg-red-50">
                                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{item.name}</td>
                                            <td className="px-4 py-2 text-sm text-red-600 font-bold">{item.quantity}</td>
                                            <td className="px-4 py-2 text-sm text-gray-500">{item.min_stock_level}</td>
                                            <td className="px-4 py-2 text-sm text-gray-500">{item.location}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Logs</h3>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {alerts.map((log) => (
                                    <tr key={log.id}>
                                        <td className="px-4 py-2">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                log.type === 'low_stock' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {log.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{log.item?.name || 'N/A'}</td>
                                        <td className="px-4 py-2 text-sm text-gray-900">{log.message}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Staff1Layout>
    );
}
