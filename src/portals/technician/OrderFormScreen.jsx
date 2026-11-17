import React, { useState, useEffect } from 'react';
import { api } from '../../api/mockApi';
import { Loader } from '../../components/Loader';
import { XIcon, SearchIcon, TrashIcon } from '../../components/Icons';
import { SignaturePad } from '../../components/SignaturePad';

export const OrderFormScreen = ({ approvedItems, onUpdateItemPrice, onRemoveItem, onSubmit, onBack }) => {
    const [loading, setLoading] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [hasSigned, setHasSigned] = useState(false);
    const [addressHistory, setAddressHistory] = useState([]);
    const [config, setConfig] = useState(null);
    const [customerQuery, setCustomerQuery] = useState('');
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupResult, setLookupResult] = useState(null);

    const [formData, setFormData] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        service_address: '',
        job_id: '',
        payment_method: 'Credit Card on File',
        notes: ''
    });

    useEffect(() => {
        api.getCompanyConfig().then(({ data }) => setConfig(data));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Lookup address history when address field changes
        if (name === 'service_address' && value.length > 5) {
            api.getAddressHistory(value).then(({ data }) => setAddressHistory(data || []));
        } else if (name === 'service_address') {
            setAddressHistory([]);
        }
    };

    const handleCustomerLookup = async () => {
        if (!customerQuery.trim()) return;
        setLookupLoading(true);
        const { data } = await api.lookupCustomer(customerQuery);
        if (data) {
            setFormData(prev => ({
                ...prev,
                customer_name: data.name,
                customer_email: data.email,
                customer_phone: data.phone,
                service_address: data.address,
            }));
            setLookupResult('found');
            // Also check address history
            if (data.address) {
                api.getAddressHistory(data.address).then(({ data: history }) => setAddressHistory(history || []));
            }
        } else {
            setLookupResult('not_found');
        }
        setLookupLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!agreed || !hasSigned) {
            alert("Please ensure the customer has agreed to the terms and provided a signature.");
            return;
        }
        setLoading(true);
        await onSubmit({
            ...formData,
            items: approvedItems.map(item => ({
                service_id: item.service_id,
                service_name: item.service_name,
                price: item.price,
            })),
            total: orderTotal,
        });
    };

    const orderTotal = approvedItems.reduce((sum, item) => sum + item.price, 0);
    const canSubmit = agreed && hasSigned && !loading && approvedItems.length > 0;
    const hasAccounting = config && config.accounting_system && config.accounting_system !== 'none';
    const accountingLabel = config?.accounting_system === 'quickbooks' ? 'QuickBooks'
        : config?.accounting_system === 'servicetitan' ? 'ServiceTitan'
        : config?.accounting_system === 'housecallpro' ? 'Housecall Pro' : '';

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-800">Create Binding Order</h1>
                    <button onClick={onBack} className="text-gray-500 hover:text-gray-700" aria-label="Close the order form" data-help="Closes the order form and goes back to the visit. Nothing is submitted."><XIcon /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">

                    {/* Line Items */}
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-700 text-sm">Approved Services</h3>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {approvedItems.map((item, idx) => (
                                <div key={idx} className="px-4 py-3 flex items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-800 text-sm truncate">{item.service_name}</p>
                                        <p className="text-xs text-gray-500">{item.service_type}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {item.is_fixed ? (
                                            <span className="text-sm font-semibold text-gray-700 bg-gray-200 px-3 py-1.5 rounded-lg">
                                                ${item.price}
                                            </span>
                                        ) : (
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs text-gray-500">${item.min_price}-{item.max_price}</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.price}
                                                    onChange={(e) => onUpdateItemPrice(idx, e.target.value)}
                                                    min={item.min_price}
                                                    max={item.max_price}
                                                    className="w-24 text-sm font-semibold text-gray-700 bg-white border border-gray-300 px-2 py-1.5 rounded-lg text-right"
                                                    data-help={`Sets the final price for ${item.service_name}, between $${item.min_price} and $${item.max_price}.`}
                                                />
                                            </div>
                                        )}
                                        <button type="button" onClick={() => onRemoveItem(idx)} className="text-gray-400 hover:text-red-500 ml-1" aria-label={`Remove ${item.service_name}`} data-help={`Takes ${item.service_name} out of this order.`}>
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-gray-100 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
                            <span className="font-bold text-gray-700">Order Total</span>
                            <span className="text-xl font-bold text-gray-900">${orderTotal.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <button type="button" onClick={onBack} className="text-blue-600 text-sm font-semibold hover:underline" data-help="Goes back to the visit to present more services. The order stays as it is.">
                            &larr; Add more services to this order
                        </button>
                    </div>

                    <div className="border-t border-gray-200 pt-4"></div>

                    {/* Customer lookup — only when accounting is connected */}
                    {hasAccounting && (
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <label className="block text-blue-800 text-sm font-medium mb-2">Lookup Customer in {accountingLabel}</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customerQuery}
                                    onChange={(e) => setCustomerQuery(e.target.value)}
                                    className="flex-1 px-4 py-2 rounded-lg bg-white border border-blue-300"
                                    placeholder="Search by name or phone..."
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCustomerLookup())}
                                    data-help={`Type a customer's name or phone to find them in ${accountingLabel}.`}
                                />
                                <button type="button" onClick={handleCustomerLookup} disabled={lookupLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1" data-help={`Looks the customer up in ${accountingLabel} and fills in their details.`}>
                                    {lookupLoading ? <Loader small={true} /> : <><SearchIcon /> Search</>}
                                </button>
                            </div>
                            {lookupResult === 'found' && (
                                <p className="text-green-700 text-sm mt-2 font-medium">Customer loaded from {accountingLabel}</p>
                            )}
                            {lookupResult === 'not_found' && (
                                <p className="text-amber-700 text-sm mt-2">Customer not found — enter details manually below.</p>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-600 text-sm font-medium mb-2" htmlFor="customerName">Customer Name</label>
                            <input id="customerName" name="customer_name" type="text" value={formData.customer_name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg bg-gray-100" required data-help="The customer's full name for the order. Required." />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm font-medium mb-2" htmlFor="customerEmail">Customer Email</label>
                            <input id="customerEmail" name="customer_email" type="email" value={formData.customer_email} onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg bg-gray-100" required data-help="The customer's email; the receipt names it. Required." />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-600 text-sm font-medium mb-2" htmlFor="customerPhone">Customer Phone</label>
                            <input id="customerPhone" name="customer_phone" type="tel" value={formData.customer_phone} onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg bg-gray-100" required data-help="The customer's phone number. Required." />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm font-medium mb-2" htmlFor="job_id">Original Job ID / WO#</label>
                            <input id="job_id" name="job_id" type="text" value={formData.job_id} onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg bg-gray-100" data-help="The original job or work-order number, if there is one." />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-600 text-sm font-medium mb-2" htmlFor="service_address">Service Address</label>
                        <input id="service_address" name="service_address" type="text" value={formData.service_address} onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg bg-gray-100" placeholder="Street, City, State, Zip" required data-help="Where the work happens. Typing it shows earlier offers at this address. Required." />
                        {/* Address History */}
                        {addressHistory.length > 0 && (
                            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <p className="text-xs font-semibold text-amber-800 mb-2">Previous offers at this address:</p>
                                <div className="space-y-1">
                                    {addressHistory.map((h, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-xs">
                                            <span className="text-gray-700">{h.service_name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-1.5 py-0.5 rounded font-semibold ${h.outcome === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {h.outcome}
                                                </span>
                                                <span className="text-gray-400">{new Date(h.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-600 text-sm font-medium mb-2" htmlFor="payment_method">Payment Method</label>
                            <select id="payment_method" name="payment_method" value={formData.payment_method} onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg bg-gray-100 appearance-none" data-help="How the customer will pay for this work.">
                                <option>Credit Card on File</option>
                                <option>Financing</option>
                                <option>Pay at Time of Service</option>
                                <option>Bill to Account</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm font-medium mb-2" htmlFor="notes">Technician Notes</label>
                            <textarea id="notes" name="notes" rows="2" value={formData.notes} onChange={handleInputChange} className="w-full px-4 py-3 rounded-lg bg-gray-100" placeholder="e.g., Customer requested afternoon install..." data-help="Notes for the office, such as a preferred install time."></textarea>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <label className="block text-gray-600 text-sm font-medium mb-2">Customer Authorization</label>
                        <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border">
                            I, the undersigned, authorize the company to perform the work listed above for the total quoted price of <strong>${orderTotal.toLocaleString()}</strong>. I understand this charge is in addition to today's service call fee, if applicable.
                        </p>
                        <div className="mt-4">
                            <label className="block text-gray-600 text-sm font-medium mb-2">Customer Signature:</label>
                            <SignaturePad onSignature={setHasSigned} />
                        </div>
                        <div className="flex items-center mt-4">
                            <input id="agree" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="h-4 w-4 text-blue-600 rounded" data-help="The customer ticks this to agree to the terms. Needed before the order can be submitted." />
                            <label htmlFor="agree" className="ml-2 block text-sm text-gray-700">I agree to the terms and authorize this work.</label>
                        </div>
                    </div>

                    <button type="submit" disabled={!canSubmit} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-lg disabled:bg-gray-300 flex items-center justify-center h-12 transition-colors" data-help="Submits the signed order and shows the receipt. Needs a signature and the ticked agreement.">
                        {loading ? <Loader small={true} /> : `Submit Binding Order — $${orderTotal.toLocaleString()}`}
                    </button>
                </form>
            </div>
        </div>
    );
};
