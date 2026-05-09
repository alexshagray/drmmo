import Staff2Layout from '@/Layouts/Staff2Layout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function HazardMap({ historicalIncidents, barangays }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBarangayModalOpen, setIsBarangayModalOpen] = useState(false);
    const [selectedBarangay, setSelectedBarangay] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [editingImage, setEditingImage] = useState(null);
    const [editingBarangay, setEditingBarangay] = useState(null);
    const barangayForm = useForm({
        name: '',
        description: '',
        population: '',
        latitude: '',
        longitude: '',
        hazard_type: '',
        image: null,
    });
    const { data, setData, post, processing, reset } = useForm({
        title: '',
        image: null,
        description: '',
        latitude: '',
        longitude: '',
        barangay_id: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (data.barangay_id) {
            sessionStorage.setItem('lastUploadedBarangayId', data.barangay_id);
        }
        if (editingImage) {
            post(route('staff2.hazard-map.update', editingImage.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditingImage(null);
                    reset();
                },
            });
        } else {
            post(route('staff2.hazard-map.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const openEditModal = (image) => {
        setEditingImage(image);
        setData('title', image.title || '');
        setData('description', image.description || '');
        setData('latitude', image.latitude || '');
        setData('longitude', image.longitude || '');
        setData('barangay_id', String(image.barangay_id || ''));
        setData('image', null);
        setIsModalOpen(true);
    };

    useEffect(() => {
        const lastId = sessionStorage.getItem('lastUploadedBarangayId');
        if (lastId) {
            const barangay = barangays.find(b => String(b.id) === String(lastId));
            if (barangay) {
                setSelectedBarangay(barangay);
                if (barangay.hazardImages && barangay.hazardImages.length > 0) {
                    setSelectedImage(barangay.hazardImages[barangay.hazardImages.length - 1].image_path);
                } else if (barangay.image_path) {
                    setSelectedImage(barangay.image_path);
                }
            }
            sessionStorage.removeItem('lastUploadedBarangayId');
        }
    }, [barangays]);

    const handleBarangayClick = (barangay) => {
        setSelectedBarangay(barangay);
        if (barangay.image_path) {
            setSelectedImage(barangay.image_path);
        } else if (barangay.hazardImages && barangay.hazardImages.length > 0) {
            setSelectedImage(barangay.hazardImages[0].image_path);
        } else {
            setSelectedImage(null);
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this hazard map image?')) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = route('staff2.hazard-map.destroy', id);
            
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
            
            const methodInput = document.createElement('input');
            methodInput.type = 'hidden';
            methodInput.name = '_method';
            methodInput.value = 'DELETE';
            form.appendChild(methodInput);
            
            document.body.appendChild(form);
            form.submit();
        }
    };

    return (
        <Staff2Layout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Hazard Mapping Service</h2>}
        >
            <Head title="Hazard Map" />
            <div className="h-screen flex flex-col">
                <div className="flex-1 flex overflow-hidden">
                    {/* Top half - Selected Image */}
                    <div className="w-1/2 bg-gray-900 flex items-center justify-center p-4">
                        {selectedImage ? (
                            <div className="w-full h-full flex flex-col">
                                <img
                                    src={`/storage/${selectedImage}`}
                                    alt={selectedBarangay?.name || 'Hazard Map'}
                                    className="w-full flex-1 object-contain rounded-lg"
                                />
                                <div className="mt-3 p-3 bg-gray-800 rounded-lg">
                                    <h4 className="text-white text-sm font-medium mb-2">Hazard Susceptibility Levels</h4>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded bg-yellow-500"></div>
                                            <span className="text-gray-300">Low Susceptibility</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded bg-green-400"></div>
                                            <span className="text-gray-300">Moderate Susceptibility</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded bg-red-500"></div>
                                            <span className="text-gray-300">High Susceptibility</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded bg-amber-800"></div>
                                            <span className="text-gray-300">Very High Susceptibility</span>
                                        </div>
                                        <div className="flex items-center gap-2 col-span-2">
                                            <div className="w-4 h-4 rounded border border-gray-500 bg-transparent"></div>
                                            <span className="text-gray-300">Debris Flow</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedImage(null);
                                        setSelectedBarangay(null);
                                    }}
                                    className="mt-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <p className="text-gray-400">Select a barangay to view hazard map</p>
                        )}
                    </div>

                    {/* Bottom half - Details */}
                    <div className="w-1/2 overflow-y-auto p-6 space-y-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Barangays</h3>
                                <div className="space-x-2">
                                    {barangays.length < 14 && (
                                        <button
                                            onClick={() => setIsBarangayModalOpen(true)}
                                            className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700"
                                        >
                                            Add Barangay
                                        </button>
                                    )}
                                    {selectedBarangay && (
                                        <button
                                            onClick={() => {
                                                setEditingBarangay(selectedBarangay);
                                                barangayForm.setData({
                                                    name: selectedBarangay.name || '',
                                                    description: selectedBarangay.description || '',
                                                    population: selectedBarangay.population || '',
                                                    latitude: selectedBarangay.latitude || '',
                                                    longitude: selectedBarangay.longitude || '',
                                                    hazard_type: selectedBarangay.hazard_type || '',
                                                    image: null,
                                                });
                                                setIsBarangayModalOpen(true);
                                            }}
                                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                            </div>
                            {barangays.length === 0 ? (
                                <p className="text-gray-500">No barangays available.</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {barangays.map((barangay) => (
                                        <div key={barangay.id} className={`border rounded-lg p-3 cursor-pointer hover:bg-gray-100 ${selectedBarangay?.id === barangay.id ? 'bg-blue-50 border-blue-400' : 'bg-gray-50'}`} onClick={() => handleBarangayClick(barangay)}>
                                            <h4 className="font-medium text-gray-900">{barangay.name}</h4>
                                            {barangay.population && <p className="text-xs text-gray-500">Population: {barangay.population}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedBarangay && (
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Barangay Details</h3>
                                <div className="space-y-2">
                                    <p><span className="font-medium">Name:</span> {selectedBarangay.name}</p>
                                    {selectedBarangay.description && <p><span className="font-medium">Description:</span> {selectedBarangay.description}</p>}
                                    {selectedBarangay.population && <p><span className="font-medium">Population:</span> {selectedBarangay.population}</p>}
                                    {selectedBarangay.hazard_type && <p><span className="font-medium">Hazard Type:</span> {selectedBarangay.hazard_type}</p>}
                                    {selectedBarangay.latitude && selectedBarangay.longitude && (
                                        <p><span className="font-medium">Location:</span> Lat: {selectedBarangay.latitude}, Lng: {selectedBarangay.longitude}</p>
                                    )}
                                    {selectedBarangay.hazardImages && selectedBarangay.hazardImages.length > 0 && (
                                        <div>
                                            <p className="font-medium mt-4">Hazard Images ({selectedBarangay.hazardImages.length}):</p>
                                            <div className="grid grid-cols-3 gap-2 mt-2">
                                                {selectedBarangay.hazardImages.map((image) => (
                                                    <div key={image.id} className="relative group">
                                                        <img
                                                            src={`/storage/${image.image_path}`}
                                                            alt={image.title}
                                                            className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"
                                                            onClick={() => setSelectedImage(image.image_path)}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); openEditModal(image); }}
                                                            className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Historical Hazard Events</h3>
                            <p className="text-sm text-gray-600 mb-4">This section shows the history of incidents that previously occurred due to this type of hazard. It provides information about past events, affected locations, and recorded incidents related to the selected hazard type to help users better understand the risks and impacts associated with it.</p>
                            {(() => {
                                const filteredIncidents = selectedBarangay?.hazard_type
                                    ? historicalIncidents.filter(inc => inc.type === selectedBarangay.hazard_type)
                                    : historicalIncidents;
                                return filteredIncidents.length === 0 ? (
                                    <p className="text-gray-500">
                                        {selectedBarangay?.hazard_type
                                            ? `No incidents found for hazard type: ${selectedBarangay.hazard_type}`
                                            : 'No incidents with location data available.'}
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {filteredIncidents.slice(0, 6).map((inc) => (
                                        <div key={inc.id} className={`border rounded p-2 text-sm ${
                                            inc.severity === 'critical' ? 'border-red-400 bg-red-50' :
                                            inc.severity === 'high' ? 'border-orange-400 bg-orange-50' :
                                            inc.severity === 'medium' ? 'border-yellow-400 bg-yellow-50' :
                                            'border-blue-400 bg-blue-50'
                                        }`}>
                                            <h4 className="font-medium text-gray-900">{inc.title}</h4>
                                            <p className="text-xs text-gray-500">{inc.location_name || 'Unknown location'}</p>
                                        </div>
                                    ))}
                                </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Image Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setIsModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">{editingImage ? 'Edit Hazard Map Image' : 'Upload Hazard Map Image'}</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Barangay</label>
                                            <select
                                                value={data.barangay_id || (selectedBarangay?.id || '')}
                                                onChange={(e) => setData('barangay_id', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            >
                                                <option value="">Select Barangay (Optional)</option>
                                                {barangays.map((barangay) => (
                                                    <option key={barangay.id} value={barangay.id}>{barangay.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Title</label>
                                            <input
                                                type="text"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Image {editingImage && '(leave empty to keep current)'}</label>
                                            <input
                                                type="file"
                                                onChange={(e) => setData('image', e.target.files[0])}
                                                accept="image/jpeg,image/png,image/jpg,image/gif"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                required={!editingImage}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Description</label>
                                            <textarea
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                rows="3"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Latitude</label>
                                                <input
                                                    type="text"
                                                    value={data.latitude}
                                                    onChange={(e) => setData('latitude', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Longitude</label>
                                                <input
                                                    type="text"
                                                    value={data.longitude}
                                                    onChange={(e) => setData('longitude', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                    >
                                        {processing ? (editingImage ? 'Saving...' : 'Uploading...') : (editingImage ? 'Save Changes' : 'Upload')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setIsModalOpen(false); setEditingImage(null); reset(); }}
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

            {/* Add Barangay Modal */}
            {isBarangayModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setIsBarangayModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                if (editingBarangay) {
                                    barangayForm.post(route('staff2.barangays.update', editingBarangay.id), {
                                        onSuccess: () => {
                                            setIsBarangayModalOpen(false);
                                            setEditingBarangay(null);
                                            barangayForm.reset();
                                        },
                                        onError: (errors) => {
                                            console.error('Errors:', errors);
                                            alert('Error updating barangay: ' + JSON.stringify(errors));
                                        },
                                    });
                                } else {
                                    barangayForm.post(route('staff2.barangays.store'), {
                                        onSuccess: () => {
                                            setIsBarangayModalOpen(false);
                                            barangayForm.reset();
                                        },
                                        onError: (errors) => {
                                            console.error('Errors:', errors);
                                            alert('Error creating barangay: ' + JSON.stringify(errors));
                                        },
                                    });
                                }
                            }}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">{editingBarangay ? 'Edit Barangay' : 'Add New Barangay'}</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Name</label>
                                            <input
                                                type="text"
                                                value={barangayForm.data.name}
                                                onChange={(e) => barangayForm.setData('name', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Description</label>
                                            <textarea
                                                value={barangayForm.data.description}
                                                onChange={(e) => barangayForm.setData('description', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                rows="3"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Population</label>
                                            <input
                                                type="number"
                                                value={barangayForm.data.population}
                                                onChange={(e) => barangayForm.setData('population', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Hazard Type</label>
                                            <input
                                                type="text"
                                                value={barangayForm.data.hazard_type}
                                                onChange={(e) => barangayForm.setData('hazard_type', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Barangay Image</label>
                                            <input
                                                type="file"
                                                onChange={(e) => barangayForm.setData('image', e.target.files[0])}
                                                accept="image/jpeg,image/png,image/jpg,image/gif"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Latitude</label>
                                                <input
                                                    type="text"
                                                    value={barangayForm.data.latitude}
                                                    onChange={(e) => barangayForm.setData('latitude', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Longitude</label>
                                                <input
                                                    type="text"
                                                    value={barangayForm.data.longitude}
                                                    onChange={(e) => barangayForm.setData('longitude', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                    >
                                        {processing ? 'Saving...' : (editingBarangay ? 'Save Changes' : 'Save Barangay')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setIsBarangayModalOpen(false); setEditingBarangay(null); barangayForm.reset(); }}
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
        </Staff2Layout>
    );
}
