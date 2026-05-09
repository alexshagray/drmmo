import Staff1Layout from '@/Layouts/Staff1Layout';
import { Head } from '@inertiajs/react';

export default function ConsumptionReports({ dispatches, logs, itemConsumption, summary }) {
    return (
        <Staff1Layout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Generate Consumption Reports</h2>}
        >
            <Head title="Consumption Reports" />

            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-500">Total Dispatched</h3>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{summary.total_dispatched}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-500">Incidents Served</h3>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{summary.total_incidents}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-500">Unique Items Used</h3>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{summary.unique_items}</p>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Item Consumption Summary</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Dispatched</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dispatch Count</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {itemConsumption.map((item) => (
                                    <tr key={item.item_name}>
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{item.item_name}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{item.total_dispatched}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{item.dispatch_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Dispatch History</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Incident</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dispatched</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {dispatches.map((d) => (
                                    <tr key={d.id}>
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{d.item?.name || 'N/A'}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{d.quantity_dispatched}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{d.incident?.title || 'N/A'}</td>
                                        <td className="px-4 py-2 text-sm">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                d.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                d.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {d.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{d.dispatched_at ? new Date(d.dispatched_at).toLocaleString() : 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Decrease Logs</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Before</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">After</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {logs.map((log) => (
                                    <tr key={log.id}>
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{log.item?.name || 'N/A'}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{log.quantity_before}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{log.quantity_after}</td>
                                        <td className="px-4 py-2 text-sm text-red-600 font-medium">-{log.quantity_before - log.quantity_after}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{log.message}</td>
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
