import Staff2Layout from '@/Layouts/Staff2Layout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function ResponderCoordination({ patients, incidents, responders }) {
    const [editing, setEditing] = useState(null);
    const { data, setData, post, patch, delete: destroy, reset, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        emergency_contact: '',
        medical_history: '',
        condition: '',
        status: 'stable',
        incident_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (editing) {
            patch(route('staff2.responders.update', editing.id), { onSuccess: () => { reset(); setEditing(null); } });
        } else {
            post(route('staff2.responders.store'), { onSuccess: () => reset() });
        }
    };

    const editPatient = (p) => {
        setEditing(p);
        setData({
            name: p.name,
            email: p.email || '',
            phone: p.phone || '',
            emergency_contact: p.emergency_contact || '',
            medical_history: p.medical_history || '',
            condition: p.condition || '',
            status: p.status,
            incident_id: p.incident_id || '',
        });
    };

    const deletePatient = (id) => {
        if (confirm('Delete this patient record?')) destroy(route('staff2.responders.destroy', id));
    };

    return (
        <Staff2Layout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Responder Coordination</h2>}
        >
            <Head title="Responder Coordination" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-sm font-medium text-gray-500">Active Responders</h3>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{responders.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-sm font-medium text-gray-500">Active Incidents</h3>
                            <p className="mt-2 text-3xl font-bold text-yellow-600">{incidents.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-sm font-medium text-gray-500">Total Patients</h3>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{patients.length}</p>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">{editing ? 'Edit Patient' : 'Add Patient Record'}</h3>
                        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                                {errors.name && <div className="text-red-600 text-sm">{errors.name}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                                <input type="text" value={data.emergency_contact} onChange={e => setData('emergency_contact', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Incident</label>
                                <select value={data.incident_id} onChange={e => setData('incident_id', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                    <option value="">None</option>
                                    {incidents.map(inc => (
                                        <option key={inc.id} value={inc.id}>{inc.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select value={data.status} onChange={e => setData('status', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                    <option value="stable">Stable</option>
                                    <option value="critical">Critical</option>
                                    <option value="deceased">Deceased</option>
                                    <option value="discharged">Discharged</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Medical History</label>
                                <textarea value={data.medical_history} onChange={e => setData('medical_history', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" rows="2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Condition</label>
                                <input type="text" value={data.condition} onChange={e => setData('condition', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            </div>
                            <div className="md:col-span-3 flex gap-3">
                                <button type="submit" disabled={processing} className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700">
                                    {editing ? 'Update' : 'Add'} Patient
                                </button>
                                {editing && (
                                    <button type="button" onClick={() => { setEditing(null); reset(); }} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-50">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Records</h3>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Incident</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {patients.map((p) => (
                                    <tr key={p.id} className={p.status === 'critical' ? 'bg-red-50' : (p.status === 'stable' ? 'bg-green-50' : '')}>
                                        <td className="px-4 py-2 text-sm text-gray-900">{p.name}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{p.phone || 'N/A'}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{p.condition || 'N/A'}</td>
                                        <td className="px-4 py-2">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                p.status === 'stable' ? 'bg-green-100 text-green-800' :
                                                p.status === 'critical' ? 'bg-red-100 text-red-800' :
                                                p.status === 'discharged' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{p.incident?.title || 'N/A'}</td>
                                        <td className="px-4 py-2 text-sm">
                                            <button onClick={() => editPatient(p)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                            <button onClick={() => deletePatient(p.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Staff2Layout>
    );
}
