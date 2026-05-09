import ApplicationLogo from '@/Components/ApplicationLogo';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const { post } = useForm({});

    const handleLogout = (e) => {
        e.preventDefault();
        post(route('logout'));
    };

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', active: route().current('admin.dashboard') },
        { name: 'Manage User Account', href: '/admin/users', active: route().current('admin.users') },
        { name: 'Reports & Analytics', href: '/admin/reports', active: route().current('admin.reports') },
        { name: 'System Oversight', href: '/admin/oversight', active: route().current('admin.oversight') },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex">
                {/* Sidebar */}
                <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-gray-900 min-h-screen overflow-hidden`}>
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
                            <Link href="/" className="flex items-center">
                                <ApplicationLogo className="block h-8 w-auto fill-current text-white" />
                            </Link>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="text-gray-400 hover:text-white lg:hidden"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <nav className="flex-1 px-2 py-4 space-y-1">
                            {navigation.map((item) => (
                                <NavLink
                                    key={item.name}
                                    href={item.href}
                                    active={item.active}
                                    className="block px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
                                    activeClass="bg-gray-800 text-white"
                                >
                                    {item.name}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main content */}
                <div className="flex-1 flex flex-col">
                    {/* Top navbar */}
                    <nav className="bg-white border-b border-gray-200">
                        <div className="px-4 sm:px-6 lg:px-8">
                            <div className="flex h-16 justify-between">
                                <div className="flex items-center">
                                    <button
                                        onClick={() => setSidebarOpen(!sidebarOpen)}
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                    >
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-500 mr-4">Administrator</span>
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
                        </div>
                    </nav>

                    {header && (
                        <header className="bg-white shadow">
                            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                                {header}
                            </div>
                        </header>
                    )}

                    <main className="flex-1">{children}</main>
                </div>
            </div>
        </div>
    );
}
