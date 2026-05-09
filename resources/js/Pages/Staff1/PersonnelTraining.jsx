import Staff1Layout from '@/Layouts/Staff1Layout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function PersonnelTraining({ personnel }) {
    const [editing, setEditing] = useState(null);
    const { data, setData, post, patch, delete: destroy, reset, processing, errors } = useForm({
        name: '',
        contact_number: '',
        specialization: '',
        barangay: '',
        age: '',
        sex: '',
        status: 'active',
        notes: '',
    });

    // Group personnel by barangay
    const groupedByBarangay = personnel.reduce((acc, person) => {
        const barangay = person.barangay || 'Unknown';
        if (!acc[barangay]) {
            acc[barangay] = {
                barangay,
                total: 0,
                active: 0,
                inactive: 0,
                expired: 0,
                personnel: []
            };
        }
        acc[barangay].total++;
        acc[barangay].personnel.push(person);
        if (person.status === 'active') acc[barangay].active++;
        if (person.status === 'inactive') acc[barangay].inactive++;
        if (person.status === 'expired') acc[barangay].expired++;
        return acc;
    }, {});

    const submit = (e) => {
        e.preventDefault();
        if (editing) {
            patch(route('staff1.personnel.update', editing.id), { onSuccess: () => { reset(); setEditing(null); } });
        } else {
            post(route('staff1.personnel.store'), { onSuccess: () => reset() });
        }
    };

    const editPerson = (p) => {
        setEditing(p);
        setData({
            name: p.name,
            contact_number: p.contact_number || '',
            specialization: p.specialization,
            barangay: p.barangay || '',
            age: p.age || '',
            sex: p.sex || '',
            status: p.status,
            notes: p.notes || '',
        });
    };

    const deletePerson = (id) => {
        if (confirm('Delete this personnel record?')) destroy(route('staff1.personnel.destroy', id));
    };

    return (
        <Staff1Layout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Personnel Training Management</h2>}
        >
            <Head title="Personnel Training" />
            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Dashboard Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                            <div className="text-sm opacity-90">Total Personnel</div>
                            <div className="text-3xl font-bold">{personnel.length}</div>
                        </div>
                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                            <div className="text-sm opacity-90">Active</div>
                            <div className="text-3xl font-bold">{personnel.filter(p => p.status === 'active').length}</div>
                        </div>
                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
                            <div className="text-sm opacity-90">Inactive</div>
                            <div className="text-3xl font-bold">{personnel.filter(p => p.status === 'inactive').length}</div>
                        </div>
                        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
                            <div className="text-sm opacity-90">Expired</div>
                            <div className="text-3xl font-bold">{personnel.filter(p => p.status === 'expired').length}</div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-8">
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                            <h3 className="text-lg font-semibold text-white">{editing ? 'Edit Personnel' : 'Add New Personnel'}</h3>
                        </div>
                        <form onSubmit={submit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Complete Name</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                                    {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                                    <input 
                                        type="text" 
                                        value={data.contact_number} 
                                        onChange={e => {
                                            const value = e.target.value.replace(/[^0-9]/g, '');
                                            if (value.length <= 11) {
                                                setData('contact_number', value);
                                            }
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                        placeholder="09XXXXXXXXX"
                                        maxLength={11}
                                        required 
                                    />
                                    {errors.contact_number && <div className="text-red-600 text-sm mt-1">{errors.contact_number}</div>}
                                    {data.contact_number && data.contact_number.length > 0 && data.contact_number.length < 11 && (
                                        <div className="text-yellow-600 text-sm mt-1">Contact number must be 11 digits</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
                                    <input type="text" value={data.specialization} onChange={e => setData('specialization', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Barangay</label>
                                    <input type="text" value={data.barangay} onChange={e => setData('barangay', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                                    {errors.barangay && <div className="text-red-600 text-sm mt-1">{errors.barangay}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                                    <input type="number" value={data.age} onChange={e => setData('age', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" min="1" max="120" />
                                    {errors.age && <div className="text-red-600 text-sm mt-1">{errors.age}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sex</label>
                                    <select value={data.sex} onChange={e => setData('sex', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="">Select Sex</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.sex && <div className="text-red-600 text-sm mt-1">{errors.sex}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                    <select value={data.status} onChange={e => setData('status', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                                    <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="2" />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="submit" disabled={processing} className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md">
                                    {editing ? 'Update Personnel' : 'Add Personnel'}
                                </button>
                                {editing && (
                                    <button type="button" onClick={() => { setEditing(null); reset(); }} className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Table */}
                    <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-white">Trained Personnel List</h3>
                            <div className="text-white text-sm">Total Personnel: {personnel.length}</div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">No</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact Number</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Specialization</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Barangay</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Age</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Sex</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {personnel.map((person, index) => (
                                        <tr key={person.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{person.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{person.contact_number || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{person.specialization}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{person.barangay || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{person.age || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{person.sex || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                    person.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    person.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {person.status.charAt(0).toUpperCase() + person.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button onClick={() => editPerson(person)} className="text-blue-600 hover:text-blue-900 font-medium mr-3">Edit</button>
                                                <button onClick={() => deletePerson(person.id)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Staff1Layout>
    );
}
