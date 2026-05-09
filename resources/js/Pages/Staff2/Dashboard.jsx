import Staff2Layout from '@/Layouts/Staff2Layout';
import { Head } from '@inertiajs/react';

const stats = [
    { label: 'Active', value: '12', color: 'from-pink-400 to-rose-500' },
    { label: 'Acknowledged', value: '8', color: 'from-blue-400 to-cyan-500' },
    { label: 'Responders', value: '24', color: 'from-emerald-400 to-teal-500' },
    { label: 'Reports', value: '5', color: 'from-amber-400 to-orange-500' },
];

const chartBars = [
    { h: '45%', color: 'bg-pink-400' }, { h: '70%', color: 'bg-rose-400' },
    { h: '55%', color: 'bg-blue-400' }, { h: '85%', color: 'bg-cyan-400' },
    { h: '60%', color: 'bg-emerald-400' }, { h: '40%', color: 'bg-teal-400' },
    { h: '75%', color: 'bg-amber-400' }, { h: '50%', color: 'bg-orange-400' },
];

const incidents = [
    { title: 'Fire at Barangay 1', type: 'fire', time: '2m ago', status: 'active' },
    { title: 'Flood Warning Zone 3', type: 'flood', time: '15m ago', status: 'ack' },
    { title: 'Medical Emergency St. 2', type: 'medical', time: '1h ago', status: 'done' },
    { title: 'Road Accident Highway', type: 'accident', time: '2h ago', status: 'done' },
];

export default function Staff2Dashboard() {
    return (
        <Staff2Layout>
            <Head title="Staff 2 Dashboard" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-700 uppercase">Dashboard</h1>
                    <div className="relative">
                        <input type="text" placeholder="Search..." className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm" />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {stats.map((s) => (
                        <div key={s.label} className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center">
                                <div className={`h-6 w-6 rounded-full bg-gradient-to-br ${s.color}`}></div>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase">{s.label}</p>
                                <p className="text-2xl font-bold text-gray-700">{s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chart + Calendar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-base font-bold text-gray-700">Activity Overview</h3>
                            <div className="flex gap-2 text-xs">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-400" /> Incidents</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> Acknowledged</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Resolved</span>
                            </div>
                        </div>
                        <div className="h-56 flex items-end gap-4">
                            {chartBars.map((bar, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <div className={`w-full max-w-[32px] rounded-t-md ${bar.color}`} style={{ height: bar.h }} />
                                    <span className="text-[10px] text-gray-400">{i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Calendar */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-gray-700">Calendar</h3>
                            <span className="text-xs font-medium text-cyan-500 bg-cyan-50 px-3 py-1 rounded-full">{new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}</span>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400 mb-2">
                            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-sm">
                            {Array.from({ length: 3 }, (_, i) => <span key={i} className="h-8 w-8" />)}
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                                <span key={d} className={`h-8 w-8 flex items-center justify-center rounded-full ${d === new Date().getDate() ? 'bg-cyan-400 text-white font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}>{d}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Incidents + Comments */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-base font-bold text-gray-700">Recent Incidents</h3>
                            <span className="text-xs font-medium text-cyan-500">View All</span>
                        </div>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
                                <tr><th className="px-6 py-3 text-left">Title</th><th className="px-6 py-3 text-left">Type</th><th className="px-6 py-3 text-left">Status</th><th className="px-6 py-3 text-right">Time</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {incidents.map((inc, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 font-medium text-gray-800">{inc.title}</td>
                                        <td className="px-6 py-3 text-gray-500 capitalize">{inc.type}</td>
                                        <td className="px-6 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${inc.status === 'active' ? 'bg-rose-100 text-rose-800' : inc.status === 'ack' ? 'bg-cyan-100 text-cyan-800' : 'bg-emerald-100 text-emerald-800'}`}>{inc.status}</span></td>
                                        <td className="px-6 py-3 text-right text-gray-400 text-xs">{inc.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-base font-bold text-gray-700 mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {[{n: 'Responder A', a: 'acknowledged incident', t: '5m ago', c: 'bg-pink-400'}, {n: 'Team Lead', a: 'updated status', t: '12m ago', c: 'bg-blue-400'}, {n: 'Staff 1', a: 'dispatched resources', t: '30m ago', c: 'bg-emerald-400'}, {n: 'Admin', a: 'approved report', t: '1h ago', c: 'bg-amber-400'}].map((u, i) => (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className={`h-10 w-10 rounded-full ${u.c} flex items-center justify-center text-white text-xs font-bold`}>{u.n.charAt(0)}</div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-800"><span className="font-semibold">{u.n}</span> {u.a}</p>
                                        <p className="text-xs text-gray-400">{u.t}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Staff2Layout>
    );
}
