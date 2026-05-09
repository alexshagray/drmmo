import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function AdminDashboard() {
    const cards = [
        { title: 'Reports & Analytics', desc: 'View inventory and incident summaries', route: 'admin.reports' },
        { title: 'User Access Management', desc: 'Manage users and role assignments', route: 'admin.users' },
        { title: 'System Oversight', desc: 'System logs and activity monitoring', route: 'admin.oversight' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Admin Dashboard
                </h2>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            Welcome, Administrator. You have full system access.
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {cards.map((card) => (
                            <Link key={card.route} href={route(card.route)} className="block bg-white rounded-lg shadow hover:shadow-md transition p-6">
                                <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                                <p className="mt-2 text-sm text-gray-500">{card.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
