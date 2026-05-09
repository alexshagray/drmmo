import Staff1Layout from '@/Layouts/Staff1Layout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Inventory({ items, dispatches, dispatchRequests, lowStockItems, recentLogs, summary }) {
    const { url } = usePage();
    const [editingItem, setEditingItem] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState('inventory');
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [showDispatchModal, setShowDispatchModal] = useState(false);
    const [showReturnList, setShowReturnList] = useState(false);
    const [equipmentReturns, setEquipmentReturns] = useState([]);
    
    // Check URL parameters for tab and showList
    useEffect(() => {
        const params = new URLSearchParams(url.split('?')[1]);
        const tab = params.get('tab');
        const showList = params.get('showList');
        
        if (tab === 'return') {
            setActiveTab('return');
        }
        if (showList === 'true') {
            setShowReturnList(true);
        }
    }, [url]);
    
    // Fetch equipment returns when return tab is active
    useEffect(() => {
        if (activeTab === 'return' && showReturnList) {
            fetchEquipmentReturns();
        }
    }, [activeTab, showReturnList]);
    
    const fetchEquipmentReturns = async () => {
        try {
            const response = await axios.get('/api/equipment-returns');
            setEquipmentReturns(response.data.data || []);
        } catch (error) {
            console.error('Error fetching equipment returns:', error);
        }
    };
    
    const handleDeleteEquipmentReturn = async (id) => {
        if (confirm('Are you sure you want to delete this equipment return?')) {
            try {
                await axios.delete(`/api/equipment-returns/${id}`);
                fetchEquipmentReturns();
            } catch (error) {
                console.error('Error deleting equipment return:', error);
                alert('Failed to delete equipment return');
            }
        }
    };
    const [selectedDispatch, setSelectedDispatch] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const { data, setData, post, patch, delete: destroy, reset, processing, errors } = useForm({
        name: '', quantity: 0, stock: 0, type_of_emergency: 'Medical',
        type_of_supply: 'Medical', condition: 'good',
    });

    const submit = (e) => {
        e.preventDefault();
        if (editingItem) {
            patch(route('staff1.inventory.update', editingItem.id), {
                onSuccess: () => { reset(); setEditingItem(null); setShowForm(false); },
            });
        } else {
            post(route('staff1.inventory.store'), {
                onSuccess: () => { reset(); setShowForm(false); },
            });
        }
    };

    const openAddForm = () => {
        setEditingItem(null);
        reset();
        setShowForm(true);
    };

    const editItem = (item) => {
        setEditingItem(item);
        setData({
            name: item.name,
            quantity: item.quantity,
            stock: item.min_stock_level,
            type_of_emergency: item.type_of_emergency || 'Medical',
            type_of_supply: item.category,
            condition: item.condition || 'good',
        });
        setShowForm(true);
    };

    const deleteItem = (id) => { if (confirm('Delete this item?')) destroy(route('staff1.inventory.destroy', id)); };

    const openDispatchModal = (dispatch) => {
        setSelectedDispatch(dispatch);
        setShowDispatchModal(true);
    };

    const closeDispatchModal = () => {
        setSelectedDispatch(null);
        setShowDispatchModal(false);
    };

    const updateDispatchStatus = async (status) => {
        if (!selectedDispatch) return;
        
        try {
            console.log('Updating dispatch status:', selectedDispatch.id, status);
            const response = await axios.patch(`/api/dispatch-request/${selectedDispatch.id}`, { status });
            console.log('Update response:', response.data);
            closeDispatchModal();
            router.reload();
        } catch (error) {
            console.error('Error updating dispatch status:', error.response?.data || error.message);
            console.error('Full error:', error);
            alert('Failed to update dispatch status: ' + (error.response?.data?.message || error.message));
        }
    };

    const refreshDispatchRequests = async () => {
        setRefreshing(true);
        try {
            router.reload();
        } catch (error) {
            console.error('Error refreshing:', error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        let interval;
        if (activeTab === 'dispatch') {
            interval = setInterval(() => {
                refreshDispatchRequests();
            }, 10000); // Refresh every 10 seconds
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeTab]);

    const lowStockCount = items?.filter(i => i.quantity <= i.min_stock_level).length || 0;
    const goodConditionCount = items?.filter(i => ['brand new', 'good'].includes(i.condition)).length || 0;

    const handlePrintSummary = () => {
        const printWindow = window.open('', '_blank');
        const now = new Date().toLocaleString();
        const filteredItems = getFilteredItems();
        const normalItems = filteredItems.filter(item => item.quantity > item.min_stock_level);
        const categoryLabel = categoryFilter === 'all' ? 'All Types' : formatCategory(categoryFilter);

        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Inventory Summary Report</title>
    <style>
        @media print {
            body { margin: 0; }
        }
        body { font-family: Arial, sans-serif; font-size: 12px; color: #333; margin: 20px; }
        h1 { font-size: 18px; margin-bottom: 4px; text-align: center; }
        .subtitle { text-align: center; color: #666; margin-bottom: 16px; font-size: 11px; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 13px; font-weight: bold; margin-bottom: 6px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        th, td { border: 1px solid #ccc; padding: 5px 8px; text-align: left; font-size: 11px; }
        th { background-color: #f3f4f6; font-weight: bold; }
        .stats { display: flex; gap: 16px; margin-bottom: 16px; }
        .stat-box { flex: 1; border: 1px solid #ddd; padding: 10px; text-align: center; border-radius: 4px; }
        .stat-value { font-size: 16px; font-weight: bold; color: #2563eb; }
        .stat-label { font-size: 10px; color: #666; margin-top: 4px; text-transform: uppercase; }
        .low { background-color: #fef2f2; color: #dc2626; }
        .good { background-color: #f0fdf4; color: #16a34a; }
        .badge { display: inline-block; padding: 1px 6px; border-radius: 10px; font-size: 10px; font-weight: bold; border: 1px solid; }
        .footer { margin-top: 24px; font-size: 10px; color: #999; text-align: center; }
    </style>
</head>
<body>
    <h1>Inventory Summary Report</h1>
    <p class="subtitle">Generated on ${now} &bull; Category: ${categoryLabel}</p>

    <div class="section">
        <div class="stats">
            <div class="stat-box">
                <div class="stat-value">${items?.length || 0}</div>
                <div class="stat-label">Total Items</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${goodConditionCount}</div>
                <div class="stat-label">Good Condition</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${lowStockCount}</div>
                <div class="stat-label">Low Stock</div>
            </div>
            <div class="stat-box">
                <div class="stat-value">${summary?.total_dispatches || 0}</div>
                <div class="stat-label">Dispatches</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Inventory Items (${normalItems.length})</div>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Qty / Min</th>
                    <th>Emergency</th>
                    <th>Supply</th>
                    <th>Condition</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${normalItems.length > 0 ? normalItems.map((item, idx) =>
                    `<tr class="good">
                        <td>${idx + 1}</td>
                        <td>${item.name}</td>
                        <td>${item.quantity} / ${item.min_stock_level}</td>
                        <td>${item.type_of_emergency || 'Medical'}</td>
                        <td>${formatCategory(item.category)}</td>
                        <td>${item.condition}</td>
                        <td><span class="badge good">OK</span></td>
                    </tr>`
                ).join('') : '<tr><td colspan="7" style="text-align:center;">No items found.</td></tr>'}
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Low Stock Alerts (${lowStockCount})</div>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Current</th>
                    <th>Min Level</th>
                    <th>Deficit</th>
                </tr>
            </thead>
            <tbody>
                ${(lowStockItems?.length > 0 ? lowStockItems : items?.filter(i => i.quantity <= i.min_stock_level))?.map((item, idx) =>
                    `<tr class="low">
                        <td>${idx + 1}</td>
                        <td>${item.name}</td>
                        <td>${formatCategory(item.category)}</td>
                        <td>${item.quantity}</td>
                        <td>${item.min_stock_level}</td>
                        <td>${item.min_stock_level - item.quantity}</td>
                    </tr>`
                ).join('') || '<tr><td colspan="6" style="text-align:center;">No low stock alerts.</td></tr>'}
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Return Equipment (${equipmentReturns?.length || 0})</div>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Condition</th>
                    <th>Remarks</th>
                    <th>Date/Time</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${equipmentReturns?.filter(r => r.status === 'approved' || r.status === 'rejected').length > 0 ? equipmentReturns.filter(r => r.status === 'approved' || r.status === 'rejected').map((r, idx) =>
                    `<tr>
                        <td>${idx + 1}</td>
                        <td>${r.item_name}</td>
                        <td>${r.quantity}</td>
                        <td>${r.condition}</td>
                        <td>${r.remarks || '-'}</td>
                        <td>${new Date(r.created_at).toLocaleString()}</td>
                        <td><span class="badge ${r.status === 'approved' ? 'good' : 'low'}">${r.status}</span></td>
                    </tr>`
                ).join('') : '<tr><td colspan="7" style="text-align:center;">No equipment returns found.</td></tr>'}
            </tbody>
        </table>
    </div>

    <div class="footer">End of Report &bull; Printed from Balansag Inventory System</div>
    <script>window.onload = function() { setTimeout(() => { window.print(); }, 200); };</script>
</body>
</html>`;
        printWindow.document.write(html);
        printWindow.document.close();
    };

    const formatCategory = (cat) => {
        if (!cat) return '-';
        return cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getCategoryColor = (cat) => {
        if (!cat) return 'gray';
        const category = cat.toLowerCase();
        switch (category) {
            case 'medical': return 'blue';
            case 'equipment': return 'orange';
            case 'relief good': return 'green';
            default: return 'gray';
        }
    };

    const getFilteredItems = () => {
        if (categoryFilter === 'all') return items;
        return items?.filter(item => {
            const category = item.category?.toLowerCase() || '';
            if (categoryFilter === 'medical supply') return category === 'medical';
            if (categoryFilter === 'equipment supply') return category === 'equipment';
            if (categoryFilter === 'relief good supply') return category === 'relief good';
            if (categoryFilter === 'office supply') return category === 'office';
            return true;
        }) || [];
    };

    const tabs = [
        { id: 'dispatch', label: 'Dispatch', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
        { id: 'return', label: 'Equipment Return', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
        { id: 'logs', label: 'Activity', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    ];

    return (
        <Staff1Layout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Manage Inventory</h2>}>
            <Head title="Manage Inventory" />
            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { title: 'Total Items', value: items?.length || 0, color: 'blue' },
                            { title: 'Good Condition', value: goodConditionCount, color: 'emerald' },
                            { title: 'Low Stock', value: lowStockCount, color: 'red' },
                            { title: 'Dispatches', value: summary?.total_dispatches || 0, color: 'indigo' },
                        ].map((stat) => (
                            <div key={stat.title} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                <p className={`text-2xl font-bold mt-1 text-${stat.color}-600`}>{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-start gap-3">
                        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                            {showForm ? '- Hide' : '+ Add Inventory'}
                        </button>
                        <button onClick={handlePrintSummary} className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Print Summary
                        </button>
                    </div>

                    {/* Add/Edit Form */}
                    {showForm && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">{editingItem ? 'Edit Inventory' : 'Add Inventory'}</h3>
                                <button onClick={() => { setShowForm(false); setEditingItem(null); reset(); }}
                                    className="text-sm font-medium text-gray-600 hover:text-gray-900">
                                    Cancel
                                </button>
                            </div>
                            <form onSubmit={submit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                    <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-2.5" required />
                                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                                    <input type="number" value={data.quantity} onChange={e => setData('quantity', parseInt(e.target.value) || 0)} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-2.5" min="0" />
                                    {errors.quantity && <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum *</label>
                                    <input type="number" value={data.stock} onChange={e => setData('stock', parseInt(e.target.value) || 0)} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-2.5" min="0" />
                                    {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type of Emergency *</label>
                                    <select value={data.type_of_emergency} onChange={e => setData('type_of_emergency', e.target.value)} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-2.5">
                                        <option value="">Select Type</option>
                                        <option value="Fire">Fire</option>
                                        <option value="Medical">Medical</option>
                                        <option value="Flood">Flood</option>
                                        <option value="Earthquake">Earthquake</option>
                                        <option value="Typhoon">Typhoon</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.type_of_emergency && <p className="mt-1 text-xs text-red-600">{errors.type_of_emergency}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type of Supply *</label>
                                    <select value={data.type_of_supply} onChange={e => setData('type_of_supply', e.target.value)} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-2.5">
                                        <option value="">Select Type</option>
                                        <option value="Medical">Medical</option>
                                        <option value="Equipment">Equipment</option>
                                        <option value="Relief Good">Relief Good</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.type_of_supply && <p className="mt-1 text-xs text-red-600">{errors.type_of_supply}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
                                    <select value={data.condition} onChange={e => setData('condition', e.target.value)} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-2.5">
                                        <option value="brand new">Brand New</option>
                                        <option value="good">Good</option>
                                        <option value="damaged">Damaged</option>
                                        <option value="under maintenance">Under Maintenance</option>
                                    </select>
                                    {errors.condition && <p className="mt-1 text-xs text-red-600">{errors.condition}</p>}
                                </div>

                                <div className="md:col-span-2 flex gap-3 justify-end">
                                    <button type="button" onClick={() => { setShowForm(false); setEditingItem(null); reset(); }} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                                    <button type="submit" disabled={processing} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">{editingItem ? 'Update Inventory' : 'Add Inventory'}</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="flex border-b border-gray-100 overflow-x-auto items-start justify-between flex-col">
                            <div className="flex w-full">
                                <button onClick={() => { setShowFilterDropdown(!showFilterDropdown); setActiveTab('inventory'); }}
                                        className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap mr-4 transition-all duration-200 ${
                                            activeTab === 'inventory' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                        <span className="flex items-center gap-2 uppercase">
                                            All Types
                                        </span>
                                        <svg className={`w-3 h-3 ml-1 transition-transform duration-200 ${showFilterDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </button>
                                {tabs.map(tab => (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap ${
                                            activeTab === tab.id ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} /></svg>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            {showFilterDropdown && activeTab === 'inventory' && (
                                <div className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => setCategoryFilter('all')}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                                                categoryFilter === 'all'
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-300'
                                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-400 hover:text-blue-600'
                                            }`}
                                        >
                                            All Types
                                        </button>
                                        <button
                                            onClick={() => setCategoryFilter('medical supply')}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                                                categoryFilter === 'medical supply'
                                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-300'
                                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-emerald-400 hover:text-emerald-600'
                                            }`}
                                        >
                                            Medical Supply
                                        </button>
                                        <button
                                            onClick={() => setCategoryFilter('equipment supply')}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                                                categoryFilter === 'equipment supply'
                                                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-300'
                                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-400 hover:text-orange-600'
                                            }`}
                                        >
                                            Equipment Supply
                                        </button>
                                        <button
                                            onClick={() => setCategoryFilter('relief good supply')}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                                                categoryFilter === 'relief good supply'
                                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-300'
                                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-400 hover:text-purple-600'
                                            }`}
                                        >
                                            Relief Good Supply
                                        </button>
                                        <button
                                            onClick={() => setCategoryFilter('office supply')}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                                                categoryFilter === 'office supply'
                                                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-300'
                                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-cyan-400 hover:text-cyan-600'
                                            }`}
                                        >
                                            Office Supply
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-6">
                            {activeTab === 'inventory' && (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50"><tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Qty/Min</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type of Emergency</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type of Supply</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Condition</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                        </tr></thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {getFilteredItems()?.length > 0 ? getFilteredItems().map(item => (
                                                <tr key={item.id} className={item.quantity <= item.min_stock_level ? 'bg-red-50/50' : ''}>
                                                    <td className="px-4 py-3"><div className="text-sm font-medium text-gray-900">{item.name}</div></td>
                                                    <td className="px-4 py-3 text-sm font-semibold">{item.quantity}/{item.min_stock_level}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{item.type_of_emergency || 'Medical'}</td>
                                                    <td className="px-4 py-3"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border bg-${getCategoryColor(item.category)}-50 text-${getCategoryColor(item.category)}-700 border-${getCategoryColor(item.category)}-200`}>{formatCategory(item.category)}</span></td>
                                                    <td className="px-4 py-3"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                        item.condition === 'brand new' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        item.condition === 'good' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        item.condition === 'damaged' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                        'bg-red-50 text-red-700 border-red-200'
                                                    }`}>{item.condition}</span></td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <button onClick={() => editItem(item)} className="text-blue-600 hover:text-blue-900 font-medium mr-4">Edit</button>
                                                        <button onClick={() => deleteItem(item.id)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                                                    </td>
                                                </tr>
                                            )) : <tr><td colSpan="6" className="px-4 py-12 text-center text-sm text-gray-400">No items found.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'dispatch' && (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50"><tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Requester</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date/Time</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Items</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                        </tr></thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {dispatchRequests?.length > 0 ? dispatchRequests.map(d => (
                                                <tr key={d.id}>
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{d.requester_name}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(d.date_time).toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{d.items?.length || 0} item(s)</td>
                                                    <td className="px-4 py-3"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                        d.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        d.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}>{d.status}</span></td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <button onClick={() => openDispatchModal(d)} className="text-blue-600 hover:text-blue-900 font-medium">View Details</button>
                                                    </td>
                                                </tr>
                                            )) : <tr><td colSpan="5" className="px-4 py-12 text-center text-sm text-gray-400">No dispatch requests found.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'return' && (
                                <div className="overflow-x-auto">
                                    {!showReturnList ? (
                                        <div className="text-center py-8">
                                            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Equipment Return</h3>
                                            <p className="text-gray-500 mb-4">View equipment returns from mobile users</p>
                                            <button 
                                                onClick={() => setShowReturnList(true)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                                            >
                                                View Returns
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900">Equipment Returns</h3>
                                                <button 
                                                    onClick={() => setShowReturnList(false)}
                                                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                                                >
                                                    ← Back
                                                </button>
                                            </div>
                                            <div className="overflow-auto max-h-96">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Item Name</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Quantity</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Condition</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Remark</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date/Time</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {equipmentReturns.length > 0 ? equipmentReturns.map((returnItem) => (
                                                        <tr key={returnItem.id}>
                                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{returnItem.item_name}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-900">{returnItem.quantity}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-900">{returnItem.condition}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-500">{returnItem.remarks || '-'}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-500">{new Date(returnItem.created_at).toLocaleString()}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                                    returnItem.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                                    returnItem.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                    'bg-amber-50 text-amber-700 border-amber-200'
                                                                }`}>
                                                                    {returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm">
                                                                {returnItem.status === 'pending' && (
                                                                    <>
                                                                        <button 
                                                                            onClick={async () => {
                                                                                await axios.patch(`/api/equipment-returns/${returnItem.id}`, { status: 'approved' });
                                                                                fetchEquipmentReturns();
                                                                            }}
                                                                            className="text-green-600 hover:text-green-900 font-medium mr-2"
                                                                        >
                                                                            Approve
                                                                        </button>
                                                                        <button 
                                                                            onClick={async () => {
                                                                                await axios.patch(`/api/equipment-returns/${returnItem.id}`, { status: 'rejected' });
                                                                                fetchEquipmentReturns();
                                                                            }}
                                                                            className="text-red-600 hover:text-red-900 font-medium mr-2"
                                                                        >
                                                                            Reject
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => handleDeleteEquipmentReturn(returnItem.id)}
                                                                            className="text-gray-600 hover:text-gray-900 font-medium"
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    </>
                                                                )}
                                                                {returnItem.status !== 'pending' && (
                                                                    <button 
                                                                        onClick={() => handleDeleteEquipmentReturn(returnItem.id)}
                                                                        className="text-gray-600 hover:text-gray-900 font-medium"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )) : (
                                                        <tr>
                                                            <td colSpan="7" className="px-4 py-12 text-center text-sm text-gray-400">
                                                                No equipment returns found. Returns from mobile will appear here.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'logs' && (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50"><tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Item</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Message</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
                                        </tr></thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {recentLogs?.length > 0 ? recentLogs.map(log => (
                                                <tr key={log.id}>
                                                    <td className="px-4 py-3"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                        log.type === 'low_stock' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        log.type === 'stock_update' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        'bg-amber-50 text-amber-700 border-amber-200'
                                                    }`}>{log.type}</span></td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{log.item?.name || 'N/A'}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{log.message}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                                                </tr>
                                            )) : <tr><td colSpan="4" className="px-4 py-12 text-center text-sm text-gray-400">No activity logs.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
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
                                            <p className="text-sm text-gray-500">{lowStockCount} items below minimum stock level</p>
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
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Current</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Min Level</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Deficit</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {(lowStockItems?.length > 0 ? lowStockItems : items?.filter(i => i.quantity <= i.min_stock_level))?.map(item => (
                                                <tr key={item.id} className="bg-red-50/30">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{formatCategory(item.category)}</td>
                                                    <td className="px-4 py-3 text-sm text-red-600 font-bold">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{item.min_stock_level}</td>
                                                    <td className="px-4 py-3 text-sm text-red-600 font-bold">{item.min_stock_level - item.quantity}</td>
                                                </tr>
                                            )) || (
                                                <tr><td colSpan="5" className="px-4 py-12 text-center text-sm text-gray-400">No low stock alerts. All items are above minimum levels.</td></tr>
                                            )}
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

            {/* Dispatch Request Details Modal */}
            {showDispatchModal && selectedDispatch && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeDispatchModal}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                            <div className="bg-white px-6 pt-6 pb-4">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Dispatch Request Details</h3>
                                            <p className="text-sm text-gray-500">Request ID: #{selectedDispatch.id}</p>
                                        </div>
                                    </div>
                                    <button onClick={closeDispatchModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Requester Name</p>
                                        <p className="text-base font-semibold text-gray-900">{selectedDispatch.requester_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Date/Time</p>
                                        <p className="text-base font-semibold text-gray-900">{new Date(selectedDispatch.date_time).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                                            selectedDispatch.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            selectedDispatch.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                            'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}>{selectedDispatch.status}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Submitted At</p>
                                        <p className="text-base font-semibold text-gray-900">{new Date(selectedDispatch.created_at).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-6">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Items Requested</h4>
                                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">No</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Remarks</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {selectedDispatch.items?.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{item.number || index + 1}</td>
                                                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{item.qty}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{item.item}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-500">{item.remarks || '-'}</td>
                                                    </tr>
                                                )) || (
                                                    <tr><td colSpan="4" className="px-4 py-8 text-center text-sm text-gray-400">No items found.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-4 flex justify-between gap-3">
                                <div className="flex gap-3">
                                    {selectedDispatch.status === 'pending' && (
                                        <>
                                            <button 
                                                onClick={() => updateDispatchStatus('approved')} 
                                                disabled={processing}
                                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => updateDispatchStatus('rejected')} 
                                                disabled={processing}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {selectedDispatch.status !== 'pending' && (
                                        <button 
                                            onClick={() => updateDispatchStatus('pending')} 
                                            disabled={processing}
                                            className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
                                        >
                                            Set to Pending
                                        </button>
                                    )}
                                </div>
                                <button onClick={closeDispatchModal} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Staff1Layout>
    );
}
