import { MOCK_ADMIN_USER, MOCK_TECH_USER, MOCK_SUPER_ADMIN_USER, MOCK_CUSTOMERS_QB, SEASONAL_CONFIG, VISIT_CHECKLISTS, DECLINE_REASONS, VIDEO_PURPOSES, store } from './mockData.js';

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

    // Ask rate — share of visits where at least one offer was presented
    const askedVisits = visits.filter(v => events.some(e => e.visit_id === v.id)).length;
    const askRate = visits.length > 0 ? askedVisits / visits.length : 0;

    return {
        totalPresented,
        visitCount: visits.length,
        askedVisits,
        askRate,
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
// THE GATE — which offers a visit must present before it can close
// =========================================================================

export function requiredServiceIds(visitType, date = new Date()) {
    const month = date.getMonth() + 1;
    const fromChecklist = (VISIT_CHECKLISTS[visitType] || []).map(item => item.leads_to);
    const inSeason = Object.entries(SEASONAL_CONFIG)
        .filter(([, cfg]) => cfg.label && cfg.months.includes(month))
        .map(([id]) => id);
    const limit = store.config.required_offers_per_visit || 4;
    return [...new Set([...fromChecklist, ...inSeason])]
        .filter(id => store.services.some(s => s.id === id && s.is_active !== false))
        .slice(0, limit);
}

function visitProgress(visit) {
    const events = store.offerEvents.filter(e => e.visit_id === visit.id);
    const required = visit.required_service_ids.map(id => {
        const svc = store.services.find(s => s.id === id);
        const last = [...events].reverse().find(e => e.service_id === id);
        return { service_id: id, name: svc?.name || id, outcome: last?.outcome || null, decline_reason: last?.decline_reason || null };
    });
    const askedCount = required.filter(r => r.outcome).length;
    return { required, askedCount, requiredCount: required.length, canClose: askedCount === required.length };
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
        if (email === 'superadmin@demo.com') return { user: MOCK_SUPER_ADMIN_USER, error: null };
        return { user: null, error: { message: 'Invalid credentials. Use tech@demo.com, admin@demo.com or superadmin@demo.com.' } };
    },
    signOut: async () => { await delay(200); },

    // --- Visits (the gate) ---
    startVisit: async ({ technician_id, customer_name, address, visit_type }) => {
        await delay(400);
        const visit = {
            id: `visit_${Date.now()}`,
            technician_id,
            customer_name,
            address,
            visit_type,
            required_service_ids: requiredServiceIds(visit_type),
            status: 'open',
            timestamp: new Date().toISOString(),
        };
        store.visits.push(visit);
        return { data: visit, error: null };
    },
    getVisitProgress: async (visitId) => {
        await delay(150);
        const visit = store.visits.find(v => v.id === visitId);
        if (!visit) return { data: null, error: { message: 'Visit not found.' } };
        return { data: visitProgress(visit), error: null };
    },
    closeVisit: async (visitId) => {
        await delay(400);
        const visit = store.visits.find(v => v.id === visitId);
        if (!visit) return { data: null, error: { message: 'Visit not found.' } };
        const progress = visitProgress(visit);
        if (!progress.canClose) {
            return { data: progress, error: { message: `Present ${progress.requiredCount - progress.askedCount} more required offer(s) before closing this visit.` } };
        }
        visit.status = 'closed';
        visit.closed_at = new Date().toISOString();
        return { data: progress, error: null };
    },

    // --- Video requests (3D movie pipeline) ---
    getVideoPurposes: async () => ({ data: VIDEO_PURPOSES, error: null }),
    getVideoRequests: async (companyId) => {
        await delay(300);
        const list = companyId ? store.videoRequests.filter(v => v.company_id === companyId) : store.videoRequests;
        return { data: [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)), error: null };
    },
    createVideoRequest: async (request) => {
        await delay(400);
        const record = { ...request, id: `vid_${Date.now()}`, status: 'requested', video_url: '', production_folder: '', created_at: new Date().toISOString() };
        store.videoRequests.push(record);
        return { data: record, error: null };
    },
    updateVideoRequest: async (id, patch) => {
        await delay(300);
        store.videoRequests = store.videoRequests.map(v => v.id === id ? { ...v, ...patch } : v);
        return { data: store.videoRequests.find(v => v.id === id), error: null };
    },
    getReadyVideosForService: async (serviceId) => {
        await delay(150);
        return { data: store.videoRequests.filter(v => v.service_id === serviceId && v.status === 'ready' && v.video_url), error: null };
    },

    // --- Companies (super admin) ---
    getCompanies: async () => {
        await delay(400);
        return { data: [...store.companies], error: null };
    },
    createCompany: async (companyData) => {
        await delay(600);
        const company = {
            ...companyData,
            id: `comp_${Date.now()}`,
            technicians: 0,
            status: 'onboarding',
            created_at: new Date().toISOString(),
        };
        store.companies.push(company);
        return { data: company, error: null };
    },
    updateCompanyStatus: async (companyId, status) => {
        await delay(300);
        store.companies = store.companies.map(c => c.id === companyId ? { ...c, status } : c);
        return { data: null, error: null };
    },
    getPlatformStats: async () => {
        await delay(300);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        const events = store.offerEvents.filter(e => new Date(e.timestamp) >= cutoff);
        return {
            data: {
                companies: store.companies.length,
                activeCompanies: store.companies.filter(c => c.status === 'active').length,
                technicians: store.companies.reduce((sum, c) => sum + (c.technicians || 0), 0),
                offers30d: events.length,
                revenue30d: events.filter(e => e.outcome === 'approved').reduce((sum, e) => sum + e.revenue, 0),
            },
            error: null,
        };
    },

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
    logOfferDecision: async ({ technician_id, service_id, visit_id, outcome, revenue, decline_reason, address, customer_initials }) => {
        await delay(500);
        const event = {
            id: `evt_${Date.now()}`,
            technician_id: technician_id || 'tech_user_sp',
            service_id,
            visit_id: visit_id || `visit_${Date.now()}`,
            outcome,
            revenue: outcome === 'approved' ? (revenue || 0) : 0,
            decline_reason: outcome === 'declined' ? (decline_reason || null) : null,
            customer_initials: customer_initials || null,
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
    // Approved offers carry $0 until the signed order sets the price; this books it.
    recordOrderRevenue: async ({ technician_id, visit_id, items }) => {
        (items || []).forEach(item => {
            const evt = [...store.offerEvents].reverse().find(e =>
                e.outcome === 'approved' && e.service_id === item.service_id &&
                (visit_id ? e.visit_id === visit_id : e.technician_id === technician_id));
            if (evt) evt.revenue = Number(item.price) || 0;
        });
        return { data: null, error: null };
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
