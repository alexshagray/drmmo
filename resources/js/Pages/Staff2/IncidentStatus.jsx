import Staff2Layout from '@/Layouts/Staff2Layout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function IncidentStatus({ incidents }) {
    const [editing, setEditing] = useState(null);
    const { data, setData, patch, delete: destroy, reset, processing } = useForm({
        title: '',
        age: '',
        gender: '',
        civil_status: '',
        contact_number: '',
        address: '',
        date: '',
        callerNumber: '',
        dispatchTime: '',
        enRouteTime: '',
        onSceneTime: '',
        transportTime: '',
        arrivedHF: '',
        departedHF: '',
        natureOfCall: '',
        description: '',
        type: 'general',
        severity: 'medium',
        latitude: '',
        longitude: '',
        location_name: '',
        responders: '',
        received_by: '',
        status: 'active',
    });

    const submit = (e) => {
        e.preventDefault();
        const submitData = {
            ...data,
            location_name: data.address || data.location_name,
        };
        patch(route('staff2.incidents.update', editing.id), submitData, {
            onSuccess: () => {
                reset();
                setEditing(null);
                router.reload();
            }
        });
    };

    const editIncident = (inc) => {
        setEditing(inc);
        setData({
            title: inc.title,
            age: inc.age || '',
            gender: inc.gender || '',
            civil_status: inc.civil_status || '',
            contact_number: inc.contact_number || '',
            address: inc.location_name || '',
            date: inc.reported_at ? new Date(inc.reported_at).toISOString().split('T')[0] : '',
            callerNumber: '',
            dispatchTime: '',
            enRouteTime: '',
            onSceneTime: '',
            transportTime: '',
            arrivedHF: '',
            departedHF: '',
            natureOfCall: inc.type || '',
            description: inc.description || '',
            type: inc.type,
            severity: inc.severity,
            latitude: inc.latitude || '',
            longitude: inc.longitude || '',
            location_name: inc.location_name || '',
            responders: inc.responders || '',
            received_by: inc.received_by || '',
            status: inc.status,
        });
    };

    const deleteIncident = (id) => {
        if (confirm('Delete this incident?')) destroy(route('staff2.incidents.destroy', id));
    };

    const severityOptions = ['low', 'medium', 'high', 'critical'];
    const statusOptions = ['active', 'resolved', 'cancelled'];
    const typeOptions = ['general', 'medical', 'fire', 'flood', 'earthquake', 'typhoon', 'other'];
    const genderOptions = ['male', 'female', 'other'];
    const civilStatusOptions = ['single', 'married', 'widowed', 'divorced'];
    const natureOfCallOptions = ['Emergency', 'Transport', 'Standby', 'Non-Emergency', 'Medical Assistance'];

    const severityColor = (s) => {
        if (s === 'critical') return 'bg-red-100 text-red-800';
        if (s === 'high') return 'bg-orange-100 text-orange-800';
        if (s === 'medium') return 'bg-yellow-100 text-yellow-800';
        return 'bg-blue-100 text-blue-800';
    };

    return (
        <Staff2Layout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Manage Incident Reports</h2>}
        >
            <Head title="Manage Incident Reports" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {editing && (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="px-6 py-4 bg-blue-900 border-b border-blue-800">
                                <h3 className="text-lg font-semibold text-white">Edit Patient Care Record</h3>
                            </div>
                            <form onSubmit={submit} className="p-6 space-y-6">
                                {/* Patient Information Section */}
                                <div className="border-l-4 border-blue-900 pl-4">
                                    <h4 className="text-base font-bold text-gray-900 mb-4 uppercase tracking-wide">Patient Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Name of Patient</label>
                                            <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="block w-full rounded border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter patient name" required />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Age</label>
                                            <input type="text" value={data.age} onChange={e => setData('age', e.target.value)} className="block w-full rounded border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Age" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Gender</label>
                                            <select value={data.gender} onChange={e => setData('gender', e.target.value)} className="block w-full rounded border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                                <option value="">Select</option>
                                                {genderOptions.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Contact #</label>
                                            <input type="text" value={data.contact_number} onChange={e => setData('contact_number', e.target.value)} className="block w-full rounded border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Contact number" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Civil Status</label>
                                            <select value={data.civil_status} onChange={e => setData('civil_status', e.target.value)} className="block w-full rounded border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                                <option value="">Select</option>
                                                {civilStatusOptions.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Address</label>
                                            <input type="text" value={data.address} onChange={e => setData('address', e.target.value)} className="block w-full rounded border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter address" />
                                        </div>
                                    </div>
                                </div>

                                {/* Incident Information Section */}
                                <div className="border-l-4 border-blue-900 pl-4">
                                    <h4 className="text-base font-bold text-gray-900 mb-4 uppercase tracking-wide">Incident Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Date</label>
                                            <input type="date" value={data.date} onChange={e => setData('date', e.target.value)} className="block w-full rounded border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Caller #</label>
                                            <input type="text" value={data.callerNumber} onChange={e => setData('callerNumber', e.target.value)} className="block w-full rounded border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Caller number" />
                                        </div>
                                    </div>

                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-2 mt-4">Time Records</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                        {[
                                            { key: 'dispatchTime', label: 'Dispatch Time' },
                                            { key: 'enRouteTime', label: 'En Route Time' },
                                            { key: 'onSceneTime', label: 'On Scene Time' },
                                            { key: 'transportTime', label: 'Transport Time' },
                                            { key: 'arrivedHF', label: 'Arrived HF' },
                                            { key: 'departedHF', label: 'Departed HF' },
                                        ].map((field) => (
                                            <div key={field.key}>
                                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">{field.label}</label>
                                                <input type="time" value={data[field.key]} onChange={e => setData(field.key, e.target.value)} className="block w-full rounded border-gray-300 border px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                            </div>
                                        ))}
                                    </div>

                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-2 mt-4">Nature of Call</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                        {natureOfCallOptions.map((option) => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => setData('natureOfCall', option)}
                                                className={`p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                                                    data.natureOfCall === option
                                                        ? 'bg-blue-900 border-blue-900 text-white'
                                                        : 'bg-white border-gray-300 text-gray-700 hover:border-blue-900'
                                                }`}
                                            >
                                                📞 {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Responders & Received By Section */}
                                <div className="border-l-4 border-blue-900 pl-4">
                                    <h4 className="text-base font-bold text-gray-900 mb-4 uppercase tracking-wide">Responders & Received By</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Responders</label>
                                            <input type="text" value={data.responders} onChange={e => setData('responders', e.target.value)} className="block w-full rounded border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter responder names..." />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Received By</label>
                                            <input type="text" value={data.received_by} onChange={e => setData('received_by', e.target.value)} className="block w-full rounded border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter received by..." />
                                        </div>
                                    </div>
                                </div>

                                {/* Special Instructions Section */}
                                <div className="border-l-4 border-blue-900 pl-4">
                                    <h4 className="text-base font-bold text-gray-900 mb-4 uppercase tracking-wide">Special Instructions</h4>
                                    <div>
                                        <textarea value={data.description} onChange={e => setData('description', e.target.value)} className="block w-full rounded border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="4" placeholder="Enter any additional remarks or special instructions..." />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4 border-t border-gray-200">
                                    <button type="submit" disabled={processing} className="inline-flex items-center px-6 py-3 bg-blue-900 border border-transparent rounded font-semibold text-sm text-white uppercase tracking-wider hover:bg-blue-800 transition-colors">
                                        {processing ? 'Saving...' : 'Save Record ✓'}
                                    </button>
                                    <button type="button" onClick={() => { setEditing(null); reset(); }} className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 rounded font-semibold text-sm text-gray-700 uppercase tracking-wider hover:bg-gray-50 transition-colors">
                                        Clear Form
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Care Record</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Civil Status</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact #</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nature of Call</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Responders</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Received By</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {incidents.map((inc) => (
                                        <tr key={inc.id} className={inc.status === 'active' ? 'bg-yellow-50' : (inc.status === 'resolved' ? 'bg-green-50' : '')}>
                                            <td className="px-3 py-2 text-sm font-medium text-gray-900">{inc.title || 'N/A'}</td>
                                            <td className="px-3 py-2 text-sm text-gray-500">{inc.age || 'N/A'}</td>
                                            <td className="px-3 py-2 text-sm text-gray-500 capitalize">{inc.gender || 'N/A'}</td>
                                            <td className="px-3 py-2 text-sm text-gray-500 capitalize">{inc.civil_status || 'N/A'}</td>
                                            <td className="px-3 py-2 text-sm text-gray-500">{inc.address || 'N/A'}</td>
                                            <td className="px-3 py-2 text-sm text-gray-500">{inc.contact_number || 'N/A'}</td>
                                            <td className="px-3 py-2 text-sm text-gray-500">{inc.reported_at ? new Date(inc.reported_at).toLocaleDateString() : 'N/A'}</td>
                                            <td className="px-3 py-2 text-sm text-gray-500">{inc.type || 'N/A'}</td>
                                            <td className="px-3 py-2 text-sm text-gray-500">{inc.responders || 'N/A'}</td>
                                            <td className="px-3 py-2 text-sm text-gray-500">{inc.received_by || 'N/A'}</td>
                                            <td className="px-3 py-2 text-sm">
                                                <button onClick={() => editIncident(inc)} className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                                                <button onClick={() => deleteIncident(inc.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </Staff2Layout>
    );
}
