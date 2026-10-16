import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/mockApi';
import { LogOutIcon, CheckIcon } from '../../components/Icons';
import { ServiceListScreen } from './ServiceListScreen';
import { ServiceDetailContainer } from './ServiceDetailContainer';
import { OrderFormScreen } from './OrderFormScreen';
import { StartVisitScreen } from './StartVisitScreen';
import { SuccessScreen } from '../../components/SuccessScreen';

// =========================================================================
// ORDER RECEIPT SCREEN — shown after submission, simulates email to customer
// =========================================================================
const OrderReceiptScreen = ({ order, onDone }) => {
    const orderDate = new Date(order.date);

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
            {/* Email sent confirmation */}
            <div className="w-full max-w-2xl mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <div className="bg-green-100 rounded-full p-2">
                    <CheckIcon />
                </div>
                <div>
                    <p className="font-semibold text-green-800">Order Submitted & Receipt Emailed</p>
                    <p className="text-sm text-green-700">A copy of this receipt has been sent to <strong>{order.customer_email}</strong></p>
                </div>
            </div>

            {/* Receipt */}
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Receipt Header */}
                <div className="bg-[#004B87] text-white p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold">{order.company_name}</h1>
                            <p className="text-blue-200 text-sm mt-1">Service Authorization Receipt</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-blue-200">Order #{order.order_id}</p>
                            <p className="text-sm text-blue-200">{orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Customer & Job Info */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Customer</h3>
                            <p className="font-medium text-gray-800">{order.customer_name}</p>
                            <p className="text-sm text-gray-600">{order.customer_email}</p>
                            <p className="text-sm text-gray-600">{order.customer_phone}</p>
                        </div>
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Service Location</h3>
                            <p className="text-sm text-gray-800">{order.service_address}</p>
                            {order.job_id && <p className="text-sm text-gray-600 mt-1">Job ID: {order.job_id}</p>}
                            <p className="text-sm text-gray-600 mt-1">Technician: {order.technician_name}</p>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Services Authorized</h3>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left p-3 font-semibold text-gray-600">Service</th>
                                        <th className="text-right p-3 font-semibold text-gray-600">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item, idx) => (
                                        <tr key={idx} className="border-t border-gray-200">
                                            <td className="p-3 text-gray-800">{item.service_name}</td>
                                            <td className="p-3 text-right text-gray-800">${Number(item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-gray-300 bg-gray-50">
                                        <td className="p-3 font-bold text-gray-800">Total</td>
                                        <td className="p-3 text-right font-bold text-gray-800 text-lg">${Number(order.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Payment & Notes */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment Method</h3>
                            <p className="text-sm text-gray-800">{order.payment_method}</p>
                        </div>
                        {order.notes && (
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</h3>
                                <p className="text-sm text-gray-600">{order.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Authorization Notice */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-xs text-gray-500">
                            This receipt confirms that the customer has authorized the above services at the stated price.
                            A signed authorization was captured at the time of service. This charge is in addition to the original service call fee, if applicable.
                        </p>
                    </div>

                    {/* Done Button */}
                    <button
                        onClick={onDone}
                        className="w-full bg-[#004B87] hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors"
                    >
                        Done — Return to Services
                    </button>
                </div>
            </div>
        </div>
    );
};

export const TechnicianPortal = () => {
    const [currentService, setCurrentService] = useState(null);
    const [approvedItems, setApprovedItems] = useState([]);
    const [view, setView] = useState('list');
    const [completedOrder, setCompletedOrder] = useState(null);
    const [visit, setVisit] = useState(null);
    const [progress, setProgress] = useState(null);
    const [closing, setClosing] = useState(false);
    const [closedSummary, setClosedSummary] = useState(null);
    const { user, logout } = useAuth();

    const refreshProgress = useCallback(async (visitId) => {
        const { data } = await api.getVisitProgress(visitId);
        setProgress(data);
    }, []);

    useEffect(() => {
        if (visit && view === 'list') refreshProgress(visit.id);
    }, [visit, view, refreshProgress]);

    const finishVisit = async () => {
        setClosing(true);
        const { data, error } = await api.closeVisit(visit.id);
        setClosing(false);
        if (error) { setProgress(data); return false; }
        setClosedSummary({ customer: visit.customer_name, asked: data.askedCount, required: data.requiredCount });
        setVisit(null);
        setProgress(null);
        setApprovedItems([]);
        setView('closed');
        setTimeout(() => setView('list'), 2200);
        return true;
    };

    const handleSelectService = (service) => {
        setCurrentService(service);
        setView('detail');
    };

    const handleServiceApproved = (service) => {
        // Parse the price to get a default value for the line item
        const raw = service.price_range || '';
        const nums = raw.match(/[\d,]+(?:\.\d+)?/g)?.map(s => parseFloat(s.replace(',', ''))) || [];
        const defaultPrice = nums[0] || 0;
        const minPrice = nums[0] || 0;
        const maxPrice = nums.length >= 2 ? nums[1] : nums[0] || 0;

        setApprovedItems(prev => [...prev, {
            service_id: service.id,
            service_name: service.name,
            service_type: service.type,
            price_range: service.price_range,
            price: defaultPrice,
            min_price: minPrice,
            max_price: maxPrice,
            is_fixed: nums.length <= 1,
        }]);
        setCurrentService(null);
        setView('list');
    };

    const handleServiceDeclined = () => {
        setCurrentService(null);
        setView('list');
    };

    const handleRemoveItem = (index) => {
        setApprovedItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpdateItemPrice = (index, newPrice) => {
        setApprovedItems(prev => prev.map((item, i) => i === index ? { ...item, price: Number(newPrice) } : item));
    };

    const handleOpenOrder = () => {
        setView('order');
    };

    const handleOrderSubmit = async (orderDetails) => {
        const result = await api.submitOrder(orderDetails);
        await api.recordOrderRevenue({ technician_id: user.id, visit_id: visit?.id, items: orderDetails.items });
        setCompletedOrder({
            ...orderDetails,
            order_id: result.data?.[0]?.id || `ORD-${Date.now()}`,
            date: new Date().toISOString(),
            technician_name: user.full_name,
            company_name: user.company?.name || 'ServicePro HVAC',
        });
        setView('receipt');
    };

    const AppHeader = () => (
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10" style={{ backgroundColor: user.company?.brand_color, color: 'white' }}>
            {user.company.logo_url
                ? <img src={user.company.logo_url} alt="Company Logo" className="h-8 object-contain" />
                : <span className="font-bold text-lg">{user.company.name}</span>
            }
            <div className="flex items-center">
                <span className="mr-4 hidden sm:inline">{user.full_name}</span>
                <button onClick={logout} className="p-2 hover:bg-white/20 rounded-full transition-colors"><LogOutIcon /></button>
            </div>
        </header>
    );

    if (view === 'detail' && currentService) {
        return (
            <ServiceDetailContainer
                service={currentService}
                visit={visit}
                onBack={() => { setCurrentService(null); setView('list'); }}
                onApproved={handleServiceApproved}
                onDeclined={handleServiceDeclined}
            />
        );
    }

    if (view === 'order') {
        return (
            <OrderFormScreen
                approvedItems={approvedItems}
                onUpdateItemPrice={handleUpdateItemPrice}
                onRemoveItem={handleRemoveItem}
                onSubmit={handleOrderSubmit}
                onBack={() => setView('list')}
            />
        );
    }

    if (view === 'receipt' && completedOrder) {
        return (
            <OrderReceiptScreen
                order={completedOrder}
                onDone={async () => {
                    setApprovedItems([]);
                    setCompletedOrder(null);
                    if (visit) { await finishVisit(); } else { setView('list'); }
                }}
            />
        );
    }

    if (view === 'closed' && closedSummary) {
        return <SuccessScreen title="Visit closed" message={`${closedSummary.customer}: ${closedSummary.asked} of ${closedSummary.required} required offers asked.`} />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AppHeader />
            <main>
                {!visit ? (
                    <StartVisitScreen user={user} onStarted={(v) => { setVisit(v); setView('list'); }} />
                ) : (
                    <ServiceListScreen
                        onSelectService={handleSelectService}
                        approvedItems={approvedItems}
                        onOpenOrder={handleOpenOrder}
                        onRemoveItem={handleRemoveItem}
                        visit={visit}
                        progress={progress}
                        onCloseVisit={finishVisit}
                        closing={closing}
                    />
                )}
            </main>
        </div>
    );
};
