import Staff1Layout from '@/Layouts/Staff1Layout';
import { Head } from '@inertiajs/react';

export default function InventoryReports({ items, categorySummary, recentLogs, summary }) {
    return (
        <Staff1Layout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Generate Inventory Reports</h2>}
        >
            <Head title="Inventory Reports" />

            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-500">Total Items</h3>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{summary.total_items}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-500">Total Quantity</h3>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{summary.total_quantity}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-500">Low Stock</h3>
                        <p className="mt-2 text-3xl font-bold text-red-600">{summary.low_stock_items}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-500">Under Maintenance</h3>
                        <p className="mt-2 text-3xl font-bold text-yellow-600">{summary.maintenance_items}</p>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Category Summary</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Count</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Quantity</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Low Stock Count</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {categorySummary.map((cat) => (
                                    <tr key={cat.category}>
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{cat.category}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{cat.count}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{cat.total_quantity}</td>
                                        <td className="px-4 py-2 text-sm">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                cat.low_stock_count > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                                {cat.low_stock_count}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory List</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Min Level</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {items.map((item) => (
                                    <tr key={item.id} className={item.quantity <= item.min_stock_level ? 'bg-red-50' : ''}>
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{item.name}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{item.category}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{item.quantity}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{item.min_stock_level}</td>
                                        <td className="px-4 py-2 text-sm">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                item.status === 'available' ? 'bg-green-100 text-green-800' :
                                                item.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity Logs</h3>
                    <div className="overflow-x-auto">
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
                                {recentLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td className="px-4 py-2">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                log.type === 'low_stock' ? 'bg-red-100 text-red-800' :
                                                log.type === 'stock_update' ? 'bg-blue-100 text-blue-800' :
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
