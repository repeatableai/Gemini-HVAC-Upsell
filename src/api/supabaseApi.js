// Supabase implementation of the app's data layer. Same function names and
// return shapes ({ data, error }) as mockApiImpl.js, so no screen changes.
import { createClient } from '@supabase/supabase-js';
import { DECLINE_REASONS, VIDEO_PURPOSES, MOCK_CUSTOMERS_QB } from './mockData.js';

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const IS_CONFIGURED = Boolean(URL && KEY);
export const supabase = IS_CONFIGURED ? createClient(URL, KEY) : null;

const ok = (data) => ({ data, error: null });
const fail = (error) => ({ data: null, error: { message: error?.message || String(error) } });

// ---------------------------------------------------------------------------
// Session and shapes
// ---------------------------------------------------------------------------
let me = null;               // the signed-in user, in the shape the screens expect
let companyCache = null;     // { settings, services } for the user's company

async function loadMe() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) { me = null; return null; }
    const { data: p, error } = await supabase.from('profiles').select('*, companies(*)').eq('id', auth.user.id).single();
    if (error || !p) { me = null; return null; }
    const c = p.companies;
    me = {
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        role: p.role,
        company_id: p.company_id,
        company: c
            ? { id: c.id, name: c.name, logo_url: c.logo_url || '', brand_color: c.primary_color || '#004B87' }
            : { id: 'platform', name: 'Upseller Platform', logo_url: '', brand_color: '#1F2937' },
    };
    companyCache = null;
    return me;
}

const toService = (s) => ({
    id: s.id,
    company_id: s.company_id,
    type: s.category || 'HVAC',
    name: s.name,
    price_range: s.price_range || (s.price != null ? `$${Number(s.price).toLocaleString()}` : ''),
    offer_context: s.offer_context || '',
    is_active: s.is_active !== false,
    sort_order: s.sort_order ?? 99,
    benefits: JSON.stringify(Array.isArray(s.benefits) ? s.benefits : []),
    script: s.sales_script || '',
    description: s.description || '',
});

const firstPrice = (range) => Number(((range || '').match(/[\d,]+(?:\.\d+)?/) || ['0'])[0].replace(/,/g, '')) || 0;

const toTech = (p) => ({ id: p.id, full_name: p.full_name, email: p.email, status: p.status || (p.is_active === false ? 'inactive' : 'active') });

const toEvent = (e) => ({
    id: e.id, technician_id: e.technician_id, service_id: e.service_id, visit_id: e.visit_id,
    outcome: e.outcome, revenue: Number(e.revenue) || 0, decline_reason: e.decline_reason,
    customer_initials: e.customer_initials, timestamp: e.created_at,
});

const toVisit = (v) => ({
    id: v.id, technician_id: v.technician_id, customer_name: v.customer_name, address: v.address,
    visit_type: v.visit_type, required_service_ids: v.required_service_ids || [], status: v.status,
    timestamp: v.created_at,
});

const toVideo = (r) => ({
    id: r.id, company_id: r.company_id, title: r.title, purpose: r.purpose, service_id: r.service_id || '',
    script: r.script, verbatim: r.verbatim, length_seconds: r.length_seconds, aspect: r.aspect, look: r.look,
    voice: r.voice, music: r.music, status: r.status, video_url: r.video_url || '',
    production_folder: r.production_folder || '', requested_by: r.requested_by, created_at: r.created_at,
});

async function companySettings() {
    if (companyCache) return companyCache;
    const companyId = me?.company_id;
    const [{ data: co }, { data: svcs }] = await Promise.all([
        companyId ? supabase.from('companies').select('settings').eq('id', companyId).single() : Promise.resolve({ data: null }),
        supabase.from('services').select('*').order('sort_order'),
    ]);
    companyCache = { settings: co?.settings || {}, services: (svcs || []).map(toService) };
    return companyCache;
}

// ---------------------------------------------------------------------------
// The gate — which offers a visit must present before it can close
// (synchronous, from the cache filled by getServices / getVisitChecklists)
// ---------------------------------------------------------------------------
export function requiredServiceIds(visitType, date = new Date()) {
    if (!companyCache) return [];
    const { settings, services } = companyCache;
    const month = date.getMonth() + 1;
    const fromChecklist = ((settings.visit_checklists || {})[visitType] || []).map(i => i.leads_to);
    const inSeason = Object.entries(settings.seasonal_config || {})
        .filter(([, cfg]) => cfg.label && (cfg.months || []).includes(month)).map(([id]) => id);
    const limit = settings.required_offers_per_visit || 4;
    return [...new Set([...fromChecklist, ...inSeason])]
        .filter(id => services.some(s => s.id === id && s.is_active))
        .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Stats, computed from the rows this user is allowed to read
// ---------------------------------------------------------------------------
function computeDashboardStats({ events, visits, services, technicians, config }) {
    const approved = events.filter(e => e.outcome === 'approved');
    const declined = events.filter(e => e.outcome === 'declined');
    const totalRevenue = approved.reduce((s, e) => s + e.revenue, 0);
    const serviceMap = {};
    events.forEach(e => {
        const svc = services.find(s => s.id === e.service_id);
        const row = serviceMap[e.service_id] ||= { service_id: e.service_id, name: svc?.name || 'Offer', type: svc?.type || 'Unknown', presented: 0, approved: 0, declined: 0, revenue: 0 };
        row.presented++;
        if (e.outcome === 'approved') { row.approved++; row.revenue += e.revenue; } else row.declined++;
    });
    const techMap = {};
    const techRow = (id) => techMap[id] ||= { technician_id: id, name: technicians.find(t => t.id === id)?.full_name || 'Technician', visits: 0, presented: 0, approved: 0, declined: 0, revenue: 0 };
    visits.forEach(v => { techRow(v.technician_id).visits++; });
    events.forEach(e => {
        const r = techRow(e.technician_id);
        r.presented++;
        if (e.outcome === 'approved') { r.approved++; r.revenue += e.revenue; } else r.declined++;
    });
    const revenueByType = {};
    approved.forEach(e => { const t = services.find(s => s.id === e.service_id)?.type || 'Unknown'; revenueByType[t] = (revenueByType[t] || 0) + e.revenue; });
    let lostRevenue = 0;
    declined.forEach(e => {
        const st = serviceMap[e.service_id];
        lostRevenue += st && st.approved > 0 ? st.revenue / st.approved : firstPrice(services.find(s => s.id === e.service_id)?.price_range);
    });
    const declineReasons = {};
    declined.forEach(e => { const k = e.decline_reason || 'unknown'; declineReasons[k] = (declineReasons[k] || 0) + 1; });
    const askedVisits = visits.filter(v => events.some(e => e.visit_id === v.id)).length;
    return {
        totalPresented: events.length,
        visitCount: visits.length,
        askedVisits,
        askRate: visits.length ? askedVisits / visits.length : 0,
        approvedCount: approved.length,
        declinedCount: declined.length,
        approvalRate: events.length ? approved.length / events.length : 0,
        totalRevenue,
        lostRevenue: Math.round(lostRevenue),
        revenueByType,
        declineReasons,
        byService: Object.values(serviceMap),
        byTechnician: Object.values(techMap).sort((a, b) => b.revenue - a.revenue),
        config,
    };
}

const since = (days) => { const d = new Date(); d.setDate(d.getDate() - days); return d.toISOString(); };

async function rowsSince(days, extra = (q) => q) {
    const [ev, vi] = await Promise.all([
        extra(supabase.from('offer_events').select('*').gte('created_at', since(days))),
        extra(supabase.from('visits').select('*').gte('created_at', since(days))),
    ]);
    if (ev.error) throw ev.error;
    if (vi.error) throw vi.error;
    return { events: ev.data.map(toEvent), visits: vi.data.map(toVisit) };
}

const configFrom = (settings) => ({
    order_routing_type: 'email', order_routing_target: '', accounting_system: 'none', accounting_api_key: '',
    min_presentations_per_month: 20, target_approval_rate: 25, flag_underperformers: true, monthly_revenue_goal: 40000,
    required_offers_per_visit: 4,
    notification_preferences: { email_on_approve: true, email_on_decline: false, weekly_summary: true, underperformer_alert: true },
    ...settings,
});

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
export const api = {
    // --- Auth ---
    restoreSession: async () => {
        const { data } = await supabase.auth.getSession();
        return data?.session ? loadMe() : null;
    },
    signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { user: null, error: { message: 'That email and password do not match. Check the demo logins and try again.' } };
        const user = await loadMe();
        return user ? { user, error: null } : { user: null, error: { message: 'Signed in, but this account has no profile yet.' } };
    },
    signOut: async () => { await supabase.auth.signOut(); me = null; companyCache = null; },

    // --- Services ---
    getServices: async () => {
        companyCache = null;
        const c = await companySettings();
        return ok([...c.services]);
    },
    saveService: async (s) => {
        const row = {
            name: s.name, category: s.type, price_range: s.price_range, price: firstPrice(s.price_range),
            offer_context: s.offer_context, sales_script: s.script, is_active: s.is_active !== false,
            benefits: (() => { try { return JSON.parse(s.benefits || '[]'); } catch { return String(s.benefits || '').split('\n').filter(Boolean); } })(),
        };
        const q = s.id ? supabase.from('services').update(row).eq('id', s.id) : supabase.from('services').insert({ ...row, company_id: me.company_id, sort_order: 99 });
        const { error } = await q;
        companyCache = null;
        return error ? fail(error) : ok(s);
    },
    deleteService: async (id) => {
        // Soft delete keeps offer history intact
        const { error } = await supabase.from('services').update({ is_active: false }).eq('id', id);
        companyCache = null;
        return error ? fail(error) : ok(null);
    },

    // --- Technicians ---
    getTechnicians: async () => {
        const { data, error } = await supabase.from('profiles').select('*').eq('company_id', me.company_id).eq('role', 'technician').neq('status', 'removed').order('full_name');
        return error ? fail(error) : ok(data.map(toTech));
    },
    inviteTechnician: async (email, name) => {
        const temp = crypto.getRandomValues(new Uint32Array(4)).join('-') + 'Aa!';
        const { data, error } = await supabase.functions.invoke('create-user', { body: { email, password: temp, full_name: name, role: 'technician' } });
        if (error || data?.error) return fail(data?.error || error);
        await supabase.from('profiles').update({ status: 'invited' }).eq('id', data.user.id);
        return ok({});
    },
    updateTechnician: async (t) => {
        const { error } = await supabase.from('profiles').update({ full_name: t.full_name, email: t.email, status: t.status }).eq('id', t.id);
        return error ? fail(error) : ok(t);
    },
    deleteTechnician: async (id) => {
        const { error } = await supabase.from('profiles').update({ status: 'removed', is_active: false }).eq('id', id);
        return error ? fail(error) : ok(null);
    },

    // --- Dashboard ---
    getDashboardStats: async (periodDays = 30) => {
        try {
            const [{ events, visits }, svc, techs, cfg] = await Promise.all([
                rowsSince(periodDays), companySettings(), api.getTechnicians(), api.getCompanyConfig(),
            ]);
            return ok(computeDashboardStats({ events, visits, services: svc.services, technicians: techs.data || [], config: cfg.data }));
        } catch (e) { return fail(e); }
    },
    getTechnicianStats: async (techId, periodDays = 30) => {
        try {
            const { events, visits } = await rowsSince(periodDays, (q) => q.eq('technician_id', techId));
            const { services } = await companySettings();
            const approved = events.filter(e => e.outcome === 'approved');
            const recentEvents = events
                .map(e => ({ ...e, service_name: services.find(s => s.id === e.service_id)?.name || 'Offer' }))
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            return ok({
                visits: visits.length, presented: events.length, approved: approved.length, declined: events.length - approved.length,
                revenue: approved.reduce((s, e) => s + e.revenue, 0),
                presentationRate: visits.length ? events.length / visits.length : 0,
                closeRate: events.length ? approved.length / events.length : 0,
                recentEvents: recentEvents.slice(0, 10),
            });
        } catch (e) { return fail(e); }
    },

    // --- Offer tracking ---
    logOfferDecision: async ({ service_id, visit_id, outcome, decline_reason, address, customer_initials }) => {
        const { data, error } = await supabase.from('offer_events').insert({
            company_id: me.company_id, technician_id: me.id, service_id, visit_id: visit_id || null, outcome,
            revenue: 0, decline_reason: outcome === 'declined' ? (decline_reason || null) : null,
            customer_initials: customer_initials || null, address: address || null,
        }).select().single();
        return error ? fail(error) : ok([toEvent(data)]);
    },
    recordOrderRevenue: async ({ visit_id, items }) => {
        const { error } = await supabase.rpc('record_order_revenue', {
            p_visit: visit_id || null,
            p_items: (items || []).map(i => ({ service_id: i.service_id, price: Number(i.price) || 0 })),
        });
        return error ? fail(error) : ok(null);
    },
    submitOrder: async (o) => {
        const total = Number(o.total) || (o.items || []).reduce((s, i) => s + (Number(i.price) || 0), 0);
        const { data, error } = await supabase.from('orders').insert({
            company_id: me.company_id, technician_id: me.id, customer_name: o.customer_name || 'Customer',
            customer_email: o.customer_email || null, customer_phone: o.customer_phone || null,
            customer_address: o.service_address || null, status: 'approved', subtotal: total, total,
            signature_url: o.signature || null, notes: o.notes || null,
        }).select('id').single();
        if (error) return fail(error);
        if (o.items?.length) {
            await supabase.from('order_items').insert(o.items.map(i => ({
                order_id: data.id, service_id: i.service_id, quantity: 1, unit_price: Number(i.price) || 0, subtotal: Number(i.price) || 0,
            })));
        }
        return ok([{ id: `ORD-${data.id.slice(0, 8).toUpperCase()}` }]);
    },

    // --- Config ---
    getCompanyConfig: async () => {
        const { settings } = await companySettings();
        return ok(configFrom(settings));
    },
    saveCompanyConfig: async (patch) => {
        const { settings } = await companySettings();
        const next = { ...settings, ...patch };
        const { error } = await supabase.from('companies').update({ settings: next }).eq('id', me.company_id);
        companyCache = null;
        return error ? fail(error) : ok(configFrom(next));
    },

    // --- Customer lookup (accounting system not connected yet: demo list) ---
    lookupCustomer: async (query) => {
        const q = query.toLowerCase();
        const match = MOCK_CUSTOMERS_QB.find(c => c.name.toLowerCase().includes(q) || c.phone.includes(q));
        return { data: match || null, error: match ? null : { message: 'Customer not found in accounting system.' } };
    },

    getSeasonalConfig: async () => ok((await companySettings()).settings.seasonal_config || {}),
    getVisitChecklists: async () => ok((await companySettings()).settings.visit_checklists || {}),
    getDeclineReasons: async () => ok(DECLINE_REASONS),

    getAddressHistory: async (address) => {
        const { data, error } = await supabase.from('offer_events').select('*, services(name), profiles(full_name)')
            .ilike('address', `%${address.trim()}%`).order('created_at', { ascending: false }).limit(20);
        if (error) return fail(error);
        return ok(data.map(h => ({ address: h.address, service_id: h.service_id, service_name: h.services?.name, outcome: h.outcome, date: h.created_at, technician: h.profiles?.full_name || 'Technician' })));
    },

    // --- Follow-up queue ---
    getFollowUps: async () => {
        const { data, error } = await supabase.from('follow_ups').select('*, services(name)').eq('status', 'pending').order('follow_up_date');
        if (error) return fail(error);
        return ok(data.map(f => ({ id: f.id, address: f.address, service_id: f.service_id, service_name: f.services?.name || 'Offer', declined_date: f.created_at, follow_up_date: f.follow_up_date, technician_id: f.technician_id, status: f.status, decline_reason: f.decline_reason })));
    },
    createFollowUp: async ({ address, service_id, decline_reason, visit_id }) => {
        const { data, error } = await supabase.from('follow_ups').insert({ company_id: me.company_id, technician_id: me.id, service_id, address, decline_reason, visit_id: visit_id || null }).select().single();
        return error ? fail(error) : ok(data);
    },
    dismissFollowUp: async (id) => {
        const { error } = await supabase.from('follow_ups').update({ status: 'dismissed' }).eq('id', id);
        return error ? fail(error) : ok(null);
    },

    getTechnicianStreak: async (techId, periodDays = 30) => {
        try {
            const { events, visits } = await rowsSince(periodDays, (q) => q.eq('technician_id', techId));
            let streak = 0;
            for (const v of [...visits].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))) {
                if (events.some(e => e.visit_id === v.id)) streak++; else break;
            }
            return ok({ streak, totalVisits: visits.length });
        } catch (e) { return fail(e); }
    },

    getServicePairings: async (periodDays = 30) => {
        try {
            const { events } = await rowsSince(periodDays, (q) => q);
            const { services } = await companySettings();
            const approved = events.filter(e => e.outcome === 'approved');
            const pairCounts = {};
            const count = (ids) => { const u = [...new Set(ids)]; for (let i = 0; i < u.length; i++) for (let j = i + 1; j < u.length; j++) { const k = [u[i], u[j]].sort().join('|'); pairCounts[k] = (pairCounts[k] || 0) + 1; } };
            const byVisit = {}; approved.forEach(e => { if (e.visit_id) (byVisit[e.visit_id] ||= []).push(e.service_id); });
            Object.values(byVisit).forEach(count);
            const byDay = {}; approved.forEach(e => { (byDay[`${e.technician_id}_${new Date(e.timestamp).toDateString()}`] ||= []).push(e.service_id); });
            Object.values(byDay).forEach(count);
            const name = (id) => services.find(s => s.id === id)?.name || 'Offer';
            return ok(Object.entries(pairCounts).map(([k, c]) => { const [a, b] = k.split('|'); return { service1: name(a), service2: name(b), count: c }; }).sort((a, b) => b.count - a.count).slice(0, 5));
        } catch (e) { return fail(e); }
    },

    // --- Visits (the gate) ---
    startVisit: async ({ customer_name, address, visit_type }) => {
        await companySettings();
        const { data, error } = await supabase.from('visits').insert({
            company_id: me.company_id, technician_id: me.id, customer_name, address: address || null, visit_type,
            required_service_ids: requiredServiceIds(visit_type), status: 'open',
        }).select().single();
        return error ? fail(error) : ok(toVisit(data));
    },
    getVisitProgress: async (visitId) => {
        const [{ data: v, error }, { data: ev }] = await Promise.all([
            supabase.from('visits').select('*').eq('id', visitId).single(),
            supabase.from('offer_events').select('*').eq('visit_id', visitId).order('created_at'),
        ]);
        if (error) return fail(error);
        const { services } = await companySettings();
        const required = (v.required_service_ids || []).map(id => {
            const last = [...(ev || [])].reverse().find(e => e.service_id === id);
            return { service_id: id, name: services.find(s => s.id === id)?.name || 'Offer', outcome: last?.outcome || null, decline_reason: last?.decline_reason || null };
        });
        const askedCount = required.filter(r => r.outcome).length;
        return ok({ required, askedCount, requiredCount: required.length, canClose: askedCount === required.length });
    },
    closeVisit: async (visitId) => {
        const { data, error } = await supabase.rpc('close_visit', { p_visit: visitId });
        if (error) {
            const progress = (await api.getVisitProgress(visitId)).data;
            return { data: progress, error: { message: error.message } };
        }
        return ok(data);
    },

    // --- Video requests ---
    getVideoPurposes: async () => ok(VIDEO_PURPOSES),
    getVideoRequests: async (companyId) => {
        let q = supabase.from('video_requests').select('*').order('created_at', { ascending: false });
        if (companyId) q = q.eq('company_id', companyId);
        const { data, error } = await q;
        return error ? fail(error) : ok(data.map(toVideo));
    },
    createVideoRequest: async (r) => {
        const { data, error } = await supabase.from('video_requests').insert({
            company_id: r.company_id || me.company_id, title: r.title, purpose: r.purpose, service_id: r.service_id || null,
            script: r.script, verbatim: r.verbatim, length_seconds: Number(r.length_seconds) || 30, aspect: r.aspect,
            look: r.look, voice: r.voice, music: r.music, requested_by: r.requested_by || me.full_name, status: 'requested',
        }).select().single();
        return error ? fail(error) : ok(toVideo(data));
    },
    updateVideoRequest: async (id, patch) => {
        const { data, error } = await supabase.from('video_requests').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id).select().single();
        return error ? fail(error) : ok(toVideo(data));
    },
    getReadyVideosForService: async (serviceId) => {
        const { data, error } = await supabase.from('video_requests').select('*').eq('service_id', serviceId).eq('status', 'ready').neq('video_url', '');
        return error ? fail(error) : ok(data.map(toVideo));
    },

    // --- Companies (super admin) ---
    getCompanies: async () => {
        const [{ data: cos, error }, { data: profs }] = await Promise.all([
            supabase.from('companies').select('*').order('created_at'),
            supabase.from('profiles').select('company_id, role, status'),
        ]);
        if (error) return fail(error);
        return ok(cos.map(c => ({
            id: c.id, name: c.name, website: c.website || '', industry: c.industry || '', brand_color: c.primary_color || '#004B87',
            admin_name: c.admin_name || '', admin_email: c.admin_email || '', status: c.status || (c.is_active ? 'active' : 'paused'),
            technicians: (profs || []).filter(p => p.company_id === c.id && p.role === 'technician' && p.status !== 'removed').length,
            created_at: c.created_at,
        })));
    },
    createCompany: async (c) => {
        const slug = `${c.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) + '-' + Date.now().toString(36);
        const { data, error } = await supabase.from('companies').insert({
            name: c.name, slug, website: c.website || null, industry: c.industry, primary_color: c.brand_color,
            admin_name: c.admin_name || null, admin_email: c.admin_email, status: 'onboarding',
            settings: { required_offers_per_visit: 4, monthly_revenue_goal: 40000, min_presentations_per_month: 20, visit_checklists: {}, seasonal_config: {} },
        }).select().single();
        if (error) return fail(error);
        if (c.admin_email) {
            const temp = crypto.getRandomValues(new Uint32Array(4)).join('-') + 'Aa!';
            const res = await supabase.functions.invoke('create-user', { body: { email: c.admin_email, password: temp, full_name: c.admin_name || c.admin_email, role: 'admin', company_id: data.id } });
            if (res.error || res.data?.error) return { data: { ...c, ...data }, error: { message: `Company created; the admin login was not: ${res.data?.error || res.error.message}` } };
        }
        return ok({ ...c, id: data.id });
    },
    updateCompanyStatus: async (id, status) => {
        const { error } = await supabase.from('companies').update({ status, is_active: status !== 'paused' }).eq('id', id);
        return error ? fail(error) : ok(null);
    },
    getPlatformStats: async () => {
        try {
            const [{ data: cos }, { data: profs }, { events }] = await Promise.all([
                supabase.from('companies').select('id, status'),
                supabase.from('profiles').select('role, status'),
                rowsSince(30),
            ]);
            return ok({
                companies: cos.length,
                activeCompanies: cos.filter(c => c.status === 'active').length,
                technicians: profs.filter(p => p.role === 'technician' && p.status !== 'removed').length,
                offers30d: events.length,
                revenue30d: events.filter(e => e.outcome === 'approved').reduce((s, e) => s + e.revenue, 0),
            });
        } catch (e) { return fail(e); }
    },
};
