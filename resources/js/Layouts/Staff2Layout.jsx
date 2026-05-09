import { Link, usePage, useForm } from '@inertiajs/react';
import { useState } from 'react';

const navItems = [
    { name: 'Dashboard', route: 'staff2.dashboard', href: '/staff-2/dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
    { name: 'Manage Incident Reports', route: 'staff2.incidents', href: '/staff-2/incidents', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> },
    { name: 'Acknowledge', route: 'staff2.acknowledge', href: '/staff-2/acknowledge', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { name: 'Response Status', route: 'staff2.response-status', href: '/staff-2/response-status', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg> },
    { name: 'Hazard Maps', route: 'staff2.hazard-map', href: '/staff-2/hazard-map', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m0 0l6 3m-6-3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.806-.984l-5.553-1.107-5.553 1.107a1 1 0 01-.806.984l-5.553 1.107" /></svg> },
    { name: 'Map Location', route: 'staff2.incident-map', href: '/staff-2/incident-map', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { name: 'Post-Event Reports', route: 'staff2.reports', href: '/staff-2/reports', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
];

export default function Staff2Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { post } = useForm({});

    const handleLogout = (e) => {
        e.preventDefault();
        post(route('logout'));
    };

    const isActive = (routeName) => {
        try {
            return route().current(routeName);
        } catch {
            return false;
        }
    };

    return (
        <div className="min-h-screen bg-[#f0f4f8] flex">
            {/* Sidebar */}
            <aside
                className={`bg-[#2d3a4f] w-64 flex-shrink-0 fixed inset-y-0 left-0 z-30 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Close button for mobile */}
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-4 right-4 text-white/60 hover:text-white lg:hidden"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* User Profile */}
                <div className="px-6 py-8 flex flex-col items-center border-b border-white/10">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-3">
                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </div>
                    <p className="text-white font-semibold text-sm">Staff 2</p>
                    <p className="text-gray-400 text-xs mt-1">Incident Responder</p>
                </div>

                {/* Navigation */}
                <div className="p-4 mt-2">
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const active = isActive(item.route);
                            return (
                                <Link
                                    key={item.route}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                                        active
                                            ? 'bg-[#4ecdc4] text-white shadow-md'
                                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                    }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <span className={active ? 'text-white' : 'text-gray-400'}>{item.icon}</span>
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top navbar */}
                <nav className="bg-white shadow-sm lg:hidden">
                    <div className="mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between items-center">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <span className="font-semibold text-gray-800">Staff 2 Dashboard</span>
                            <form onSubmit={handleLogout}>
                                <button
                                    type="submit"
                                    className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                                >
                                    Logout
                                </button>
                            </form>
                        </div>
                    </div>
                </nav>

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
