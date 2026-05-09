import Staff1Layout from '@/Layouts/Staff1Layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function PostEventReports({ reports, summary }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        summary: '',
        actions_taken: '',
        lessons_learned: '',
        recommendations: '',
        status: 'draft',
    });

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('staff1.post-event.store'), {
            onSuccess: () => closeModal(),
        });
    };

    return (
        <Staff1Layout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Manage Post-Event Reports</h2>}
        >
            <Head title="Manage Post-Event" />

            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-500">Total Reports</h3>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{summary?.total_reports || 0}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-500">Draft</h3>
                        <p className="mt-2 text-3xl font-bold text-yellow-600">{summary?.draft_count || 0}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-500">Final</h3>
                        <p className="mt-2 text-3xl font-bold text-green-600">{summary?.final_count || 0}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-500">This Month</h3>
                        <p className="mt-2 text-3xl font-bold text-blue-600">{summary?.this_month_count || 0}</p>
                    </div>
                </div>

                {/* Reports Table */}
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Post-Event Reports</h3>
                        <button
                            onClick={openModal}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Create New Report
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {reports && reports.length > 0 ? (
                                    reports.map((report) => (
                                        <tr key={report.id}>
                                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{report.title}</td>
                                            <td className="px-4 py-2 text-sm text-gray-500">{new Date(report.created_at).toLocaleDateString()}</td>
                                            <td className="px-4 py-2">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    report.status === 'final' ? 'bg-green-100 text-green-800' :
                                                    report.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                                    report.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                                <button className="text-indigo-600 hover:text-indigo-900 mr-2">View</button>
                                                <button className="text-blue-600 hover:text-blue-900">Edit</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-8 text-center text-sm text-gray-500">
                                            No post-event reports found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Status Overview</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Draft</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${summary?.total_reports ? (summary.draft_count / summary.total_reports) * 100 : 0}%` }} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{summary?.draft_count || 0}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Final</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${summary?.total_reports ? (summary.final_count / summary.total_reports) * 100 : 0}%` }} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{summary?.final_count || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {reports && reports.slice(0, 5).map((report) => (
                                <div key={report.id} className="flex items-start gap-3">
                                    <div className={`h-2 w-2 mt-2 rounded-full ${
                                        report.status === 'final' ? 'bg-green-500' :
                                        report.status === 'draft' ? 'bg-yellow-500' :
                                        'bg-gray-500'
                                    }`} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{report.title}</p>
                                        <p className="text-xs text-gray-500">{new Date(report.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                            {(!reports || reports.length === 0) && (
                                <p className="text-sm text-gray-500">No recent activity</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={closeModal}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Create Post-Event Report</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Title</label>
                                            <input
                                                type="text"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                required
                                            />
                                            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Summary</label>
                                            <textarea
                                                value={data.summary}
                                                onChange={(e) => setData('summary', e.target.value)}
                                                rows={3}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                required
                                            />
                                            {errors.summary && <p className="mt-1 text-sm text-red-600">{errors.summary}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Actions Taken</label>
                                            <textarea
                                                value={data.actions_taken}
                                                onChange={(e) => setData('actions_taken', e.target.value)}
                                                rows={2}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                            {errors.actions_taken && <p className="mt-1 text-sm text-red-600">{errors.actions_taken}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Lessons Learned</label>
                                            <textarea
                                                value={data.lessons_learned}
                                                onChange={(e) => setData('lessons_learned', e.target.value)}
                                                rows={2}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                            {errors.lessons_learned && <p className="mt-1 text-sm text-red-600">{errors.lessons_learned}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Recommendations</label>
                                            <textarea
                                                value={data.recommendations}
                                                onChange={(e) => setData('recommendations', e.target.value)}
                                                rows={2}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                            {errors.recommendations && <p className="mt-1 text-sm text-red-600">{errors.recommendations}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Status</label>
                                            <select
                                                value={data.status}
                                                onChange={(e) => setData('status', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            >
                                                <option value="draft">Draft</option>
                                                <option value="final">Final</option>
                                                <option value="archived">Archived</option>
                                            </select>
                                            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                    >
                                        {processing ? 'Creating...' : 'Create Report'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </Staff1Layout>
    );
}
