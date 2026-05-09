import Staff1Layout from '@/Layouts/Staff1Layout';
import { Head } from '@inertiajs/react';

export default function StockStatus({ items, summary }) {
    return (
        <Staff1Layout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Track Stock Status</h2>}
        >
            <Head title="Stock Status" />

            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-500">Total Items</h3>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{summary.total_items}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-500">In Stock</h3>
                        <p className="mt-2 text-3xl font-bold text-green-600">{summary.in_stock}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-500">Low Stock</h3>
                        <p className="mt-2 text-3xl font-bold text-yellow-600">{summary.low_stock}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-500">Out of Stock</h3>
                        <p className="mt-2 text-3xl font-bold text-red-600">{summary.out_of_stock}</p>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Current Stock Levels</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Min Level</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock Level</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{item.name}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{item.category}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{item.quantity}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{item.min_stock_level}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{item.location || 'N/A'}</td>
                                        <td className="px-4 py-2 text-sm">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                item.status === 'available' ? 'bg-green-100 text-green-800' :
                                                item.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-sm">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                item.stock_level === 'low' ? 'bg-yellow-100 text-yellow-800' :
                                                item.stock_level === 'out' ? 'bg-red-100 text-red-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {item.stock_level === 'low' ? 'Low' : item.stock_level === 'out' ? 'Out' : 'Normal'}
                                            </span>
                                        </td>
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
