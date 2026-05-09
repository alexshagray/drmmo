import Staff1Layout from '@/Layouts/Staff1Layout';
import { Head, useForm } from '@inertiajs/react';

export default function BarangayIssuance({ issuances, availableItems }) {
    const { data, setData, post, reset, processing, errors } = useForm({
        inventory_item_id: '',
        barangay_name: '',
        quantity_issued: 1,
        issued_by: '',
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('staff1.barangay-issuance.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <Staff1Layout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Barangay Issuance</h2>}
        >
            <Head title="Barangay Issuance" />

            <div className="space-y-6">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Issue Items to Barangay</h3>
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
                            <label className="block text-sm font-medium text-gray-700">Barangay Name</label>
                            <input type="text" value={data.barangay_name} onChange={e => setData('barangay_name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                            {errors.barangay_name && <div className="text-red-600 text-sm">{errors.barangay_name}</div>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Quantity</label>
                            <input type="number" value={data.quantity_issued} onChange={e => setData('quantity_issued', parseInt(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" min="1" required />
                            {errors.quantity_issued && <div className="text-red-600 text-sm">{errors.quantity_issued}</div>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Issued By</label>
                            <input type="text" value={data.issued_by} onChange={e => setData('issued_by', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                            {errors.issued_by && <div className="text-red-600 text-sm">{errors.issued_by}</div>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Notes</label>
                            <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" rows="2" />
                        </div>
                        <div className="md:col-span-3">
                            <button type="submit" disabled={processing} className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700">
                                Issue Items
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Issuance History</h3>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Barangay</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Issued By</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {issuances.map((i) => (
                                <tr key={i.id}>
                                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{i.item?.name || 'N/A'}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500">{i.barangay_name}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500">{i.quantity_issued}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500">{i.issued_by}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500">{new Date(i.issued_at).toLocaleString()}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500">{i.notes || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Staff1Layout>
    );
}
