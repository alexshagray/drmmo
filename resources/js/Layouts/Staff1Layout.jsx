import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const navItems = [
    { name: 'Dashboard', route: 'staff1.dashboard', href: '/staff-1/dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
    { name: 'Manage Inventory', route: 'staff1.inventory', href: '/staff-1/inventory', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
    { name: 'Trained Personnel', route: 'staff1.personnel', href: '/staff-1/personnel', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
    { name: 'Barangay Issuance', route: 'staff1.barangay-issuance', href: '/staff-1/barangay-issuance', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg> },
    { name: 'Consumption Reports', route: 'staff1.consumption-reports', href: '/staff-1/consumption-reports', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg> },
    { name: 'Manage Post-Event', route: 'staff1.post-event', href: '/staff-1/post-event', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
];

export default function Staff1Layout({ header, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const page = usePage();

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

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('/api/notifications');
            const notifs = response.data.data;
            setNotifications(notifs);
            const unread = notifs.filter(n => !n.is_read).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleAddToInventory = async (notification) => {
        try {
            const itemData = notification.data;
            if (!itemData) return;

            // Check condition to determine routing
            const condition = itemData.condition?.toLowerCase();

            if (condition === 'good') {
                // Add directly to inventory if condition is good
                const quantity = parseInt(itemData.quantityReturned) || 1;

                // Fetch all inventory items to find matching item with same name and condition
                const inventoryResponse = await axios.get('/api/inventory');
                const existingItem = inventoryResponse.data.data.find(
                    item => item.name.toLowerCase() === itemData.itemName.toLowerCase() && item.condition.toLowerCase() === 'good'
                );

                if (existingItem) {
                    // Update existing item quantity
                    await axios.put(`/api/inventory/${existingItem.id}`, {
                        stock_quantity: existingItem.quantity + quantity,
                    });
                    alert(`Item quantity updated! ${itemData.itemName} now has ${existingItem.quantity + quantity} units.`);
                } else {
                    // Create new item if not found
                    const payload = {
                        item_name: itemData.itemName,
                        category: itemData.category || 'equipment',
                        stock_quantity: quantity,
                        reorder_level: 1,
                        location_bin: 'A1',
                        condition: 'good',
                    };

                    await axios.post('/api/inventory', payload);
                    alert('New item added to inventory!');
                }
            } else {
                // Add to equipment returns list if condition is damaged or under maintenance
                await axios.post('/api/equipment-returns', {
                    item_name: itemData.itemName,
                    quantity: itemData.quantityReturned,
                    condition: itemData.condition,
                    remarks: itemData.remarks,
                    notification_id: notification.id,
                });
                alert('Equipment return added to return list.');
            }

            // Delete the notification after processing
            await axios.delete(`/api/notifications/${notification.id}`);
            
            // Refresh notifications
            fetchNotifications();
            
            // Close notification modal
            setShowNotificationModal(false);
            
            // Navigate based on condition
            if (condition === 'good') {
                router.visit('/staff-1/inventory');
            } else {
                router.visit('/staff-1/inventory?tab=return&showList=true');
            }
            
        } catch (error) {
            console.error('Error processing return:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                alert(`Failed to process return: ${JSON.stringify(error.response.data.errors || error.response.data.message)}`);
            } else {
                alert('Failed to process return');
            }
        }
    };

    useEffect(() => {
        fetchNotifications();
        
        // Auto-refresh notifications every 30 seconds
        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000);
        
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside
                className={`bg-[#1e2a3a] w-64 flex-shrink-0 fixed inset-y-0 left-0 z-30 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* User Profile */}
                <div className="px-6 py-6 flex items-center gap-4 border-b border-white/10">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        S1
                    </div>
                    <div>
                        <p className="text-white font-semibold text-sm">Staff 1</p>
                        <p className="text-blue-300 text-xs">Operations Manager</p>
                    </div>
                </div>

                {/* Navigation */}
                <div className="p-4">
                    <p className="text-xs font-semibold text-blue-300/60 uppercase tracking-wider mb-3 px-3">Menu</p>
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const active = isActive(item.route);

                            return (
                                <div key={item.route} className="flex items-center group">
                                    <Link
                                        href={item.href}
                                        className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                            active
                                                ? 'bg-white/10 text-white shadow-sm'
                                                : 'text-blue-100/80 hover:bg-white/5 hover:text-white'
                                        }`}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <span className={active ? 'text-blue-300' : 'text-blue-300/60'}>{item.icon}</span>
                                        {item.name}
                                    </Link>
                                </div>
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
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f4f6f9]">
                {/* Top navbar */}
                <nav className="bg-white border-b border-gray-200 shadow-sm lg:hidden">
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
                            <span className="font-semibold text-gray-800">Staff 1 Dashboard</span>
                            <div className="w-6" />
                        </div>
                    </div>
                </nav>

                {header && (
                    <header className="bg-white border-b border-gray-200 shadow-sm">
                        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
                            <div>{header}</div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        setShowNotificationModal(true);
                                        fetchNotifications();
                                    }}
                                    className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Notifications"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white ring-2 ring-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowAlertModal(true)}
                                    className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Low Stock Alerts"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    {(() => {
                                        const lowItems = page.props.lowStockItems || (page.props.items?.filter(i => i.quantity <= i.min_stock_level)) || [];
                                        return lowItems.length > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                                                {lowItems.length}
                                            </span>
                                        );
                                    })()}
                                </button>
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
                    </header>
                )}

                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-7xl px-6 py-6">
                        {children}
                    </div>
                </main>
            </div>

            {/* Low Stock Alert Modal */}
            {showAlertModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAlertModal(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                            <div className="bg-white px-6 pt-6 pb-4">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert Report</h3>
                                            <p className="text-sm text-gray-500">
                                                {(() => {
                                                    const items = page.props.lowStockItems || (page.props.items?.filter(i => i.quantity <= i.min_stock_level)) || [];
                                                    return `${items.length} item${items.length !== 1 ? 's' : ''} below minimum stock level`;
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowAlertModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                                <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-lg border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Current</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Min Level</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Deficit</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {(() => {
                                                const lowItems = page.props.lowStockItems || (page.props.items?.filter(i => i.quantity <= i.min_stock_level)) || [];
                                                return lowItems.length > 0 ? lowItems.map(item => (
                                                    <tr key={item.id} className="bg-red-50/30">
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-500 capitalize">{item.category}</td>
                                                        <td className="px-4 py-3 text-sm text-red-600 font-bold">{item.quantity}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-500">{item.min_stock_level}</td>
                                                        <td className="px-4 py-3 text-sm text-red-600 font-bold">{item.min_stock_level - item.quantity}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-500">{item.location || 'N/A'}</td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="6" className="px-4 py-12 text-center text-sm text-gray-400">All items are above minimum stock levels.</td></tr>
                                                );
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                                <button onClick={() => setShowAlertModal(false)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications Modal */}
            {showNotificationModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowNotificationModal(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                            <div className="bg-white px-6 pt-6 pb-4">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                                            <p className="text-sm text-gray-500">
                                                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowNotificationModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                                <div className="max-h-96 overflow-y-auto space-y-3">
                                    {notifications.length === 0 ? (
                                        <div className="text-center py-12">
                                            <p className="text-sm text-gray-400">No notifications</p>
                                        </div>
                                    ) : (
                                        notifications.map(notification => (
                                            <div key={notification.id} className={`p-4 rounded-lg border ${!notification.is_read ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                                <div className="flex items-start justify-between mb-3">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${notification.type === 'stock_alert' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                        {notification.type === 'stock_alert' ? '⚠️ Stock Alert' : '↩️ Return Item'}
                                                    </span>
                                                    {!notification.is_read && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
                                                </div>
                                                
                                                {notification.type === 'return_item' && notification.data ? (
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-xs font-medium text-gray-500">Name of Person:</span>
                                                            <span className="text-xs font-medium text-gray-900">Mobile User</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-xs font-medium text-gray-500">Item Name:</span>
                                                            <span className="text-xs font-medium text-gray-900">{notification.data.itemName || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-xs font-medium text-gray-500">Quantity:</span>
                                                            <span className="text-xs font-medium text-gray-900">{notification.data.quantityReturned || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-xs font-medium text-gray-500">Condition:</span>
                                                            <span className="text-xs font-medium text-gray-900">{notification.data.condition || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-xs font-medium text-gray-500">Remark:</span>
                                                            <span className="text-xs font-medium text-gray-900">{notification.data.remarks || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-xs font-medium text-gray-500">Date/Time:</span>
                                                            <span className="text-xs font-medium text-gray-900">{new Date(notification.created_at).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <h4 className="text-sm font-semibold text-gray-900">{notification.title}</h4>
                                                        <p className="text-sm text-gray-600">{notification.message}</p>
                                                        <p className="text-xs text-gray-400">{new Date(notification.created_at).toLocaleString()}</p>
                                                    </div>
                                                )}
                                                
                                                {notification.type === 'return_item' && notification.data && (
                                                    <button
                                                        onClick={() => handleAddToInventory(notification)}
                                                        className="w-full mt-3 px-3 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                                                    >
                                                        Add Equipment Return
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                                <button onClick={() => setShowNotificationModal(false)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
