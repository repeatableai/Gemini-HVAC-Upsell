import { MOCK_ADMIN_USER, MOCK_TECH_USER, MOCK_CUSTOMERS_QB, SEASONAL_CONFIG, VISIT_CHECKLISTS, DECLINE_REASONS, store } from './mockData.js';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

// =========================================================================
// COMPUTED DASHBOARD STATS — derived from event-level data
// =========================================================================

function computeDashboardStats(periodDays = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - periodDays);

    const events = store.offerEvents.filter(e => new Date(e.timestamp) >= cutoff);
    const visits = store.visits.filter(v => new Date(v.timestamp) >= cutoff);

    const totalPresented = events.length;
    const approved = events.filter(e => e.outcome === 'approved');
    const declined = events.filter(e => e.outcome === 'declined');
    const totalRevenue = approved.reduce((sum, e) => sum + e.revenue, 0);
    const approvalRate = totalPresented > 0 ? approved.length / totalPresented : 0;

    // Per-service breakdown
    const serviceMap = {};
    events.forEach(e => {
        if (!serviceMap[e.service_id]) {
            const svc = store.services.find(s => s.id === e.service_id);
            serviceMap[e.service_id] = {
                service_id: e.service_id,
                name: svc?.name || e.service_id,
                type: svc?.type || 'Unknown',
                presented: 0, approved: 0, declined: 0, revenue: 0,
            };
        }
        serviceMap[e.service_id].presented++;
        if (e.outcome === 'approved') {
            serviceMap[e.service_id].approved++;
            serviceMap[e.service_id].revenue += e.revenue;
        } else {
            serviceMap[e.service_id].declined++;
        }
    });

    // Per-technician breakdown
    const techMap = {};
    visits.forEach(v => {
        if (!techMap[v.technician_id]) {
            const tech = store.technicians.find(t => t.id === v.technician_id);
            techMap[v.technician_id] = {
                technician_id: v.technician_id,
                name: tech?.full_name || v.technician_id,
                visits: 0, presented: 0, approved: 0, declined: 0, revenue: 0,
            };
        }
        techMap[v.technician_id].visits++;
    });
    events.forEach(e => {
        if (!techMap[e.technician_id]) {
            const tech = store.technicians.find(t => t.id === e.technician_id);
            techMap[e.technician_id] = {
                technician_id: e.technician_id,
                name: tech?.full_name || e.technician_id,
                visits: 0, presented: 0, approved: 0, declined: 0, revenue: 0,
            };
        }
        techMap[e.technician_id].presented++;
        if (e.outcome === 'approved') {
            techMap[e.technician_id].approved++;
            techMap[e.technician_id].revenue += e.revenue;
        } else {
            techMap[e.technician_id].declined++;
        }
    });

    // Revenue by service type
    const revenueByType = {};
    events.filter(e => e.outcome === 'approved').forEach(e => {
        const svc = store.services.find(s => s.id === e.service_id);
        const type = svc?.type || 'Unknown';
        revenueByType[type] = (revenueByType[type] || 0) + e.revenue;
    });

    // Lost revenue — estimate from declined services using their avg approved price
    let lostRevenue = 0;
    declined.forEach(e => {
        const svcStats = serviceMap[e.service_id];
        if (svcStats && svcStats.approved > 0) {
            lostRevenue += svcStats.revenue / svcStats.approved; // avg price of that service
        } else {
            // Fallback: parse price_range from service
            const svc = store.services.find(s => s.id === e.service_id);
            const nums = (svc?.price_range || '').match(/[\d,]+/g)?.map(Number) || [0];
            lostRevenue += nums[0];
        }
    });

    // Decline reason breakdown
    const declineReasons = {};
    declined.forEach(e => {
        const reason = e.decline_reason || 'unknown';
        declineReasons[reason] = (declineReasons[reason] || 0) + 1;
    });

    return {
        totalPresented,
        approvedCount: approved.length,
        declinedCount: declined.length,
        approvalRate,
        totalRevenue,
        lostRevenue: Math.round(lostRevenue),
        revenueByType,
        declineReasons,
        byService: Object.values(serviceMap),
        byTechnician: Object.values(techMap).sort((a, b) => b.revenue - a.revenue),
        config: { ...store.config },
    };
}

// =========================================================================
// API SIMULATION
// =========================================================================

export const api = {
    // --- Auth ---
    signIn: async (email, _password) => {
        await delay(500);
        if (email === 'admin@demo.com') return { user: MOCK_ADMIN_USER, error: null };
        if (email === 'tech@demo.com') return { user: MOCK_TECH_USER, error: null };
        return { user: null, error: { message: 'Invalid credentials. Use admin@demo.com or tech@demo.com.' } };
    },
    signOut: async () => { await delay(200); },

    // --- Services ---
    getServices: async () => {
        await delay(500);
        return { data: [...store.services], error: null };
    },
    saveService: async (serviceData) => {
        await delay(600);
        if (serviceData.id) {
            store.services = store.services.map(s => s.id === serviceData.id ? { ...s, ...serviceData } : s);
        } else {
            store.services.push({ ...serviceData, id: `svc_${Date.now()}`, company_id: 'comp_sp_123', is_active: true, sort_order: 99 });
        }
        return { data: serviceData, error: null };
    },
    deleteService: async (serviceId) => {
        await delay(400);
        store.services = store.services.filter(s => s.id !== serviceId);
        return { data: null, error: null };
    },

    // --- Technicians ---
    getTechnicians: async () => {
        await delay(500);
        return { data: [...store.technicians], error: null };
    },
    inviteTechnician: async (email, name) => {
        await delay(700);
        store.technicians.push({ id: `tech_${Date.now()}`, full_name: name, email, status: 'invited' });
        return { data: {}, error: null };
    },
    updateTechnician: async (techData) => {
        await delay(500);
        store.technicians = store.technicians.map(t => t.id === techData.id ? { ...t, ...techData } : t);
        return { data: techData, error: null };
    },
    deleteTechnician: async (techId) => {
        await delay(400);
        store.technicians = store.technicians.filter(t => t.id !== techId);
        return { data: null, error: null };
    },

    // --- Dashboard ---
    getDashboardStats: async (periodDays = 30) => {
        await delay(800);
        return { data: computeDashboardStats(periodDays), error: null };
    },
    getTechnicianStats: async (techId, periodDays = 30) => {
        await delay(500);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - periodDays);
        const events = store.offerEvents.filter(e => e.technician_id === techId && new Date(e.timestamp) >= cutoff);
        const visits = store.visits.filter(v => v.technician_id === techId && new Date(v.timestamp) >= cutoff);
        const approved = events.filter(e => e.outcome === 'approved');

        const enrichedEvents = events.map(e => {
            const svc = store.services.find(s => s.id === e.service_id);
            return { ...e, service_name: svc?.name || e.service_id };
        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return {
            data: {
                visits: visits.length,
                presented: events.length,
                approved: approved.length,
                declined: events.length - approved.length,
                revenue: approved.reduce((sum, e) => sum + e.revenue, 0),
                presentationRate: visits.length > 0 ? events.length / visits.length : 0,
                closeRate: events.length > 0 ? approved.length / events.length : 0,
                recentEvents: enrichedEvents.slice(0, 10),
            },
            error: null,
        };
    },

    // --- Offer tracking ---
    logOfferDecision: async ({ technician_id, service_id, visit_id, outcome, revenue, decline_reason, address }) => {
        await delay(500);
        const event = {
            id: `evt_${Date.now()}`,
            technician_id: technician_id || 'tech_user_sp',
            service_id,
            visit_id: visit_id || `visit_${Date.now()}`,
            outcome,
            revenue: outcome === 'approved' ? (revenue || 0) : 0,
            decline_reason: outcome === 'declined' ? (decline_reason || null) : null,
            timestamp: new Date().toISOString(),
        };
        store.offerEvents.push(event);

        // Track address history
        if (address) {
            const svc = store.services.find(s => s.id === service_id);
            const tech = store.technicians.find(t => t.id === (technician_id || 'tech_user_sp'));
            store.addressHistory.push({
                address,
                service_id,
                service_name: svc?.name || service_id,
                outcome,
                date: new Date().toISOString(),
                technician: tech?.full_name || 'Unknown',
            });
        }

        return { data: [event], error: null };
    },
    submitOrder: async (orderDetails) => {
        console.log("Submitting Order:", orderDetails);
        console.log(`[MOCK] Receipt email sent to: ${orderDetails.customer_email}`);
        await delay(800);
        return { data: [{ id: `ORD-${Date.now().toString(36).toUpperCase()}` }], error: null };
    },

    // --- Config ---
    getCompanyConfig: async () => {
        await delay(400);
        return { data: { ...store.config }, error: null };
    },
    saveCompanyConfig: async (configData) => {
        await delay(500);
        store.config = { ...store.config, ...configData };
        return { data: { ...store.config }, error: null };
    },

    // --- Customer lookup (for accounting integration) ---
    lookupCustomer: async (query) => {
        await delay(500);
        const q = query.toLowerCase();
        const match = MOCK_CUSTOMERS_QB.find(c =>
            c.name.toLowerCase().includes(q) || c.phone.includes(q)
        );
        return {
            data: match || null,
            error: match ? null : { message: 'Customer not found in accounting system.' },
        };
    },

    // --- Seasonal config ---
    getSeasonalConfig: async () => {
        return { data: SEASONAL_CONFIG, error: null };
    },

    // --- Visit checklists ---
    getVisitChecklists: async () => {
        return { data: VISIT_CHECKLISTS, error: null };
    },

    // --- Decline reasons ---
    getDeclineReasons: async () => {
        return { data: DECLINE_REASONS, error: null };
    },

    // --- Address history ---
    getAddressHistory: async (address) => {
        await delay(400);
        const q = address.toLowerCase().trim();
        const history = store.addressHistory.filter(h => h.address.toLowerCase().includes(q));
        return { data: history, error: null };
    },

    // --- Follow-up queue ---
    getFollowUps: async () => {
        await delay(400);
        return { data: [...store.followUps.filter(f => f.status === 'pending')], error: null };
    },
    createFollowUp: async ({ address, service_id, service_name, technician_id, decline_reason }) => {
        await delay(300);
        const followUpDate = new Date();
        followUpDate.setDate(followUpDate.getDate() + 30);
        const fu = {
            id: `fu_${Date.now()}`,
            address,
            service_id,
            service_name,
            declined_date: new Date().toISOString(),
            follow_up_date: followUpDate.toISOString(),
            technician_id,
            status: 'pending',
            decline_reason,
        };
        store.followUps.push(fu);
        return { data: fu, error: null };
    },
    dismissFollowUp: async (followUpId) => {
        await delay(200);
        store.followUps = store.followUps.map(f => f.id === followUpId ? { ...f, status: 'dismissed' } : f);
        return { data: null, error: null };
    },

    // --- Technician streak ---
    getTechnicianStreak: async (techId, periodDays = 30) => {
        await delay(300);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - periodDays);
        const visits = store.visits
            .filter(v => v.technician_id === techId && new Date(v.timestamp) >= cutoff)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        let streak = 0;
        for (const visit of visits) {
            const hasPresentation = store.offerEvents.some(e => e.visit_id === visit.id);
            if (hasPresentation) streak++;
            else break;
        }
        return { data: { streak, totalVisits: visits.length }, error: null };
    },

    // --- Service pairing insights ---
    getServicePairings: async (periodDays = 30) => {
        await delay(600);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - periodDays);
        const events = store.offerEvents.filter(e => e.outcome === 'approved' && new Date(e.timestamp) >= cutoff);

        // Group by visit_id to find co-approvals
        const visitGroups = {};
        events.forEach(e => {
            if (!visitGroups[e.visit_id]) visitGroups[e.visit_id] = [];
            visitGroups[e.visit_id].push(e.service_id);
        });

        // Count pairs
        const pairCounts = {};
        Object.values(visitGroups).forEach(serviceIds => {
            if (serviceIds.length < 2) return;
            for (let i = 0; i < serviceIds.length; i++) {
                for (let j = i + 1; j < serviceIds.length; j++) {
                    const key = [serviceIds[i], serviceIds[j]].sort().join('|');
                    pairCounts[key] = (pairCounts[key] || 0) + 1;
                }
            }
        });

        // Also count how often each service is approved near another (within same tech, same day)
        // Group by tech + date
        const dayGroups = {};
        events.forEach(e => {
            const day = new Date(e.timestamp).toDateString();
            const key = `${e.technician_id}_${day}`;
            if (!dayGroups[key]) dayGroups[key] = [];
            dayGroups[key].push(e.service_id);
        });

        Object.values(dayGroups).forEach(serviceIds => {
            if (serviceIds.length < 2) return;
            const unique = [...new Set(serviceIds)];
            for (let i = 0; i < unique.length; i++) {
                for (let j = i + 1; j < unique.length; j++) {
                    const key = [unique[i], unique[j]].sort().join('|');
                    pairCounts[key] = (pairCounts[key] || 0) + 1;
                }
            }
        });

        const pairs = Object.entries(pairCounts)
            .map(([key, count]) => {
                const [id1, id2] = key.split('|');
                const svc1 = store.services.find(s => s.id === id1);
                const svc2 = store.services.find(s => s.id === id2);
                return { service1: svc1?.name || id1, service2: svc2?.name || id2, count };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return { data: pairs, error: null };
    },
};
