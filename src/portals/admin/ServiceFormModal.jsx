import React, { useState } from 'react';
import { TrashIcon } from '../../components/Icons';

export const ServiceFormModal = ({ service, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        id: service?.id || null,
        type: service?.type || 'HVAC',
        name: service?.name || '',
        price_range: service?.price_range || '',
        offer_context: service?.offer_context || '',
        is_active: service?.is_active !== false,
        sort_order: service?.sort_order || 99,
        benefits: service ? JSON.parse(service.benefits) : [''],
        script: service?.script || '',
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    const handleBenefitChange = (index, value) => {
        const newBenefits = [...formData.benefits];
        newBenefits[index] = value;
        setFormData(prev => ({ ...prev, benefits: newBenefits }));
    };
    const addBenefit = () => setFormData(prev => ({ ...prev, benefits: [...prev.benefits, ''] }));
    const removeBenefit = (index) => setFormData(prev => ({ ...prev, benefits: formData.benefits.filter((_, i) => i !== index) }));
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, benefits: JSON.stringify(formData.benefits), sort_order: Number(formData.sort_order) });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl max-h-full overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">{service ? 'Edit Service' : 'Add New Service'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type of Service</label>
                            <select name="type" value={formData.type} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required>
                                <option value="HVAC">HVAC</option>
                                <option value="Plumbing">Plumbing</option>
                                <option value="Energy">Energy</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                            <input name="sort_order" type="number" value={formData.sort_order} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" min="1" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Service Name</label>
                        <input name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price Range</label>
                            <input name="price_range" value={formData.price_range} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Offer Context</label>
                            <input name="offer_context" value={formData.offer_context} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Customer Benefits</label>
                        {formData.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center mb-2">
                                <input value={benefit} onChange={(e) => handleBenefitChange(index, e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm" />
                                <button type="button" onClick={() => removeBenefit(index)} className="ml-2 text-red-500 hover:text-red-700"><TrashIcon /></button>
                            </div>
                        ))}
                        <button type="button" onClick={addBenefit} className="text-sm text-blue-600 font-semibold hover:underline">+ Add Benefit</button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Technician Script</label>
                        <textarea name="script" value={formData.script} onChange={handleInputChange} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                    </div>
                    <div className="flex items-center">
                        <input name="is_active" type="checkbox" checked={formData.is_active} onChange={handleInputChange} className="h-4 w-4 text-blue-600 rounded" />
                        <label className="ml-2 block text-sm text-gray-700">Active (visible to technicians)</label>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="bg-[#004B87] text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-800">Save Service</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
