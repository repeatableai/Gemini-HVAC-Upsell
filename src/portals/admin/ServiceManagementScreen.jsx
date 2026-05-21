import React, { useState, useEffect } from 'react';
import { api } from '../../api/mockApi';
import { Loader } from '../../components/Loader';
import { PlusIcon, TrashIcon } from '../../components/Icons';
import { ServiceFormModal } from './ServiceFormModal';

export const ServiceManagementScreen = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    const fetchServices = () => {
        api.getServices().then(({ data }) => { setServices(data); setLoading(false); });
    };
    useEffect(fetchServices, []);

    const handleSave = async (serviceData) => {
        await api.saveService(serviceData);
        fetchServices();
        setIsModalOpen(false);
        setSelectedService(null);
    };

    const handleDelete = async (service) => {
        if (!window.confirm(`Delete "${service.name}"? This cannot be undone.`)) return;
        await api.deleteService(service.id);
        fetchServices();
    };

    const handleToggleActive = async (service) => {
        await api.saveService({ ...service, is_active: !service.is_active });
        fetchServices();
    };

    const openModalForNew = () => { setSelectedService(null); setIsModalOpen(true); };
    const openModalForEdit = (service) => { setSelectedService(service); setIsModalOpen(true); };

    if (loading) return <div className="p-8 flex justify-center"><Loader /></div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Service Catalog</h1>
                    <p className="text-gray-500">Manage the services your technicians can offer across all departments.</p>
                </div>
                <button onClick={openModalForNew} className="flex items-center bg-[#004B87] text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors">
                    <PlusIcon /> <span className="ml-2">Add Service</span>
                </button>
            </div>
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Service Name</th>
                            <th className="p-4 font-semibold text-gray-600">Type</th>
                            <th className="p-4 font-semibold text-gray-600">Price Range</th>
                            <th className="p-4 font-semibold text-gray-600">Status</th>
                            <th className="p-4 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map(service => (
                            <tr key={service.id} className={`border-b border-gray-200 last:border-b-0 ${service.is_active === false ? 'opacity-50' : ''}`}>
                                <td className="p-4 font-medium">{service.name}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${service.type === 'HVAC' ? 'bg-blue-100 text-blue-800' : service.type === 'Plumbing' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {service.type}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-600">{service.price_range}</td>
                                <td className="p-4">
                                    <button onClick={() => handleToggleActive(service)}
                                        className={`px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${service.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                                        {service.is_active !== false ? 'Active' : 'Paused'}
                                    </button>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => openModalForEdit(service)} className="text-blue-600 font-semibold hover:underline text-sm">Edit</button>
                                        <button onClick={() => handleDelete(service)} className="text-red-500 hover:text-red-700"><TrashIcon /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <ServiceFormModal service={selectedService} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};
