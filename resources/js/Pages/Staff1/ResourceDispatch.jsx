import Staff1Layout from '@/Layouts/Staff1Layout';
import { Head, useForm } from '@inertiajs/react';

export default function ResourceDispatch({ dispatches, availableItems, activeIncidents }) {
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        inventory_item_id: '',
        incident_id: '',
        quantity_dispatched: 1,
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('staff1.dispatches.store'), {
            onSuccess: () => reset(),
        });
    };

    const updateStatus = (id, status) => {
        patch(route('staff1.dispatches.update', id), { status });
    };

    return (
        <Staff1Layout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Resource Dispatch Logic</h2>}
        >
            <Head title="Resource Dispatch" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">New Dispatch</h3>
                        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Item</label>
                                <select value={data.inventory_item_id} onChange={e => setData('inventory_item_id', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
                                    <option value="">Select item</option>
                                    {availableItems.map(item => (
                                        <option key={item.id} value={item.id}>{item.name} ({item.quantity} available)</option>
                                    ))}
                                </select>
                                {errors.inventory_item_id && <div className="text-red-600 text-sm">{errors.inventory_item_id}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Incident</label>
                                <select value={data.incident_id} onChange={e => setData('incident_id', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                    <option value="">None</option>
                                    {activeIncidents.map(inc => (
                                        <option key={inc.id} value={inc.id}>{inc.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                <input type="number" value={data.quantity_dispatched} onChange={e => setData('quantity_dispatched', parseInt(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" min="1" required />
                                {errors.quantity_dispatched && <div className="text-red-600 text-sm">{errors.quantity_dispatched}</div>}
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Notes</label>
                                <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" rows="2" />
                            </div>
                            <div className="md:col-span-3">
                                <button type="submit" disabled={processing} className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700">
                                    Dispatch Resource
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Dispatch History</h3>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Incident</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dispatched</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {dispatches.map((d) => (
                                    <tr key={d.id}>
                                        <td className="px-4 py-2 text-sm text-gray-900">{d.item?.name || 'N/A'}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{d.quantity_dispatched}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{d.incident?.title || 'N/A'}</td>
                                        <td className="px-4 py-2">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                d.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                d.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {d.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{d.dispatched_at ? new Date(d.dispatched_at).toLocaleString() : 'N/A'}</td>
                                        <td className="px-4 py-2 text-sm">
                                            {d.status === 'dispatched' && (
                                                <>
                                                    <button onClick={() => updateStatus(d.id, 'delivered')} className="text-green-600 hover:text-green-900 mr-2">Deliver</button>
                                                    <button onClick={() => updateStatus(d.id, 'cancelled')} className="text-red-600 hover:text-red-900">Cancel</button>
                                                </>
                                            )}
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
