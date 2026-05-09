import Staff1Layout from '@/Layouts/Staff1Layout';
import { Head, Link } from '@inertiajs/react';

const stats = [
    { label: 'Total Equipment', value: '—', color: 'from-blue-500 to-indigo-600', icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
    { label: 'Active Dispatches', value: '—', color: 'from-orange-400 to-pink-500', icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
    { label: 'Trained Personnel', value: '—', color: 'from-emerald-400 to-teal-600', icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { label: 'Low Stock Items', value: '—', color: 'from-rose-400 to-red-600', icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> },
];

const chartBars = [
    { h: '40%', color: 'bg-blue-500' },
    { h: '65%', color: 'bg-pink-500' },
    { h: '50%', color: 'bg-green-400' },
    { h: '80%', color: 'bg-yellow-400' },
    { h: '60%', color: 'bg-blue-500' },
    { h: '45%', color: 'bg-pink-500' },
    { h: '70%', color: 'bg-green-400' },
    { h: '55%', color: 'bg-yellow-400' },
];

const recentAlerts = [
    { title: 'Stock Level Alert', desc: 'Item XYZ below threshold', time: '2m ago', type: 'warning' },
    { title: 'New Dispatch', desc: 'Resources sent to Barangay 1', time: '15m ago', type: 'info' },
    { title: 'Equipment Maintenance', desc: 'Generator #3 scheduled', time: '1h ago', type: 'maintenance' },
];

const quickLinks = [
    { label: 'Manage Equipment', route: 'staff1.inventory', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
    { label: 'Resource Dispatch', route: 'staff1.dispatches', color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' },
    { label: 'Stock Status', route: 'staff1.stock-status', color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' },
    { label: 'Low Stock Alerts', route: 'staff1.monitoring', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
    { label: 'Inventory Reports', route: 'staff1.inventory-reports', color: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100' },
    { label: 'Trained Personnel', route: 'staff1.personnel', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
    { label: 'Barangay Issuance', route: 'staff1.barangay-issuance', color: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100' },
    { label: 'Consumption Reports', route: 'staff1.consumption-reports', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' },
];

const days = Array.from({ length: 31 }, (_, i) => i + 1);
const today = new Date().getDate();
const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const currentMonth = monthNames[new Date().getMonth()];
const currentYear = new Date().getFullYear();

export default function Staff1Dashboard() {
    return (
        <Staff1Layout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Dashboard</h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            }
        >
            <Head title="Staff 1 Dashboard" />

            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {stats.map((s) => (
                        <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-md`}>
                                {s.icon}
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
                                <p className="text-2xl font-bold text-gray-800 mt-0.5">{s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Middle Row: Chart + Calendar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart Card */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-gray-800">Activity Overview</h3>
                            <div className="flex gap-2 text-xs">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Stock In</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500" /> Stock Out</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" /> Dispatched</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400" /> Issued</span>
                            </div>
                        </div>
                        <div className="h-48 flex items-end gap-3">
                            {chartBars.map((bar, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className={`w-full max-w-[32px] rounded-t-md ${bar.color} transition-all duration-500 group-hover:opacity-80`} style={{ height: bar.h }} />
                                    <span className="text-[10px] text-gray-400 font-medium">{i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Calendar Widget */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-gray-800">Calendar</h3>
                            <span className="text-xs font-medium text-gray-500">{currentMonth} {currentYear}</span>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400 mb-2">
                            <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-sm">
                            {Array.from({ length: 3 }, (_, i) => (
                                <span key={`pad-${i}`} className="h-8 w-8" />
                            ))}
                            {days.map((d) => (
                                <span
                                    key={d}
                                    className={`h-8 w-8 flex items-center justify-center rounded-full ${
                                        d === today ? 'bg-blue-600 text-white font-semibold shadow-md' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {d}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Recent Alerts + Quick Links */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Alerts */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-base font-bold text-gray-800">Recent Alerts</h3>
                            <Link href={route('staff1.monitoring')} className="text-xs font-medium text-blue-600 hover:text-blue-800">View All</Link>
                        </div>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-3 text-left font-semibold">Alert</th>
                                    <th className="px-6 py-3 text-left font-semibold">Details</th>
                                    <th className="px-6 py-3 text-left font-semibold">Type</th>
                                    <th className="px-6 py-3 text-right font-semibold">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentAlerts.map((alert, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-3 font-medium text-gray-800">{alert.title}</td>
                                        <td className="px-6 py-3 text-gray-600">{alert.desc}</td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                alert.type === 'warning' ? 'bg-amber-100 text-amber-800' :
                                                alert.type === 'maintenance' ? 'bg-gray-100 text-gray-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {alert.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right text-gray-500 text-xs">{alert.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-base font-bold text-gray-800 mb-4">Quick Links</h3>
                        <div className="flex flex-col gap-2">
                            {quickLinks.map((link) => (
                                <Link
                                    key={link.route}
                                    href={route(link.route)}
                                    className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition ${link.color}`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Staff1Layout>
    );
}
