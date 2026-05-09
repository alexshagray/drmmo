import Staff1Layout from '@/Layouts/Staff1Layout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function DispatchRequests() {
    const [dispatchRequests, setDispatchRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDispatchRequests = async () => {
        try {
            const response = await axios.get('/api/dispatch-request');
            setDispatchRequests(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dispatch requests:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDispatchRequests();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await axios.patch(`/api/dispatch-request/${id}`, { status });
            fetchDispatchRequests();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    return (
        <Staff1Layout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Dispatch Requests</h2>}
        >
            <Head title="Dispatch Requests" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Dispatch Requests</h3>
                        {loading ? (
                            <div className="text-gray-500">Loading...</div>
                        ) : dispatchRequests.length === 0 ? (
                            <div className="text-gray-500">No dispatch requests found</div>
                        ) : (
                            <div className="space-y-4">
                                {dispatchRequests.map((request) => (
                                    <div key={request.id} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Request #{request.id}</h4>
                                                <p className="text-sm text-gray-600">Requester: {request.requester_name}</p>
                                                <p className="text-sm text-gray-600">Date/Time: {new Date(request.date_time).toLocaleString()}</p>
                                                {request.category && (
                                                    <p className="text-sm text-gray-600">Category: {request.category}</p>
                                                )}
                                            </div>
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {request.status}
                                            </span>
                                        </div>
                                        <div className="mb-3">
                                            <h5 className="font-medium text-gray-700 mb-2">Items:</h5>
                                            <ul className="list-disc list-inside text-sm text-gray-600">
                                                {request.items && request.items.map((item, index) => (
                                                    <li key={index}>
                                                        {item.item} - Qty: {item.qty}
                                                        {item.remarks && ` (${item.remarks})`}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        {request.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => updateStatus(request.id, 'approved')}
                                                    className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(request.id, 'rejected')}
                                                    className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Staff1Layout>
    );
}
