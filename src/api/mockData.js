// =========================================================================
// MOCK DATA — ServicePro HVAC Demo
// All mutable data stores for the mock API simulation
// =========================================================================

export const MOCK_ADMIN_USER = {
    id: 'admin_user_sp',
    company_id: 'comp_sp_123',
    full_name: 'Admin Manager',
    email: 'admin@demo.com',
    role: 'admin',
    company: {
        id: 'comp_sp_123',
        name: 'ServicePro HVAC',
        logo_url: '',
        brand_color: '#004B87'
    }
};

export const MOCK_TECH_USER = {
    id: 'tech_user_sp',
    company_id: 'comp_sp_123',
    full_name: 'Field Technician',
    email: 'tech@demo.com',
    role: 'technician',
    company: {
        id: 'comp_sp_123',
        name: 'ServicePro HVAC',
        logo_url: '',
        brand_color: '#004B87'
    }
};

// =========================================================================
// MUTABLE STORE — single object to avoid ES module immutability issues
// All mutable arrays/objects are properties of this store.
// =========================================================================
export const store = {};

// Additional technician users for multi-tech demo
store.technicians = [
    { id: 'tech_123', full_name: 'John Doe', email: 'john.doe@demo.com', status: 'active' },
    { id: 'tech_456', full_name: 'Jane Smith', email: 'jane.smith@demo.com', status: 'active' },
    { id: 'tech_789', full_name: 'Mike Rivera', email: 'mike.r@demo.com', status: 'active' },
    { id: 'tech_012', full_name: 'Sarah Chen', email: 'sarah.c@demo.com', status: 'active' },
    { id: 'tech_345', full_name: 'Tom Bradley', email: 'tom.b@demo.com', status: 'invited' },
];

store.services = [
    // HVAC Services
    { id: 'svc_001', type: 'HVAC', company_id: 'comp_sp_123', name: 'Coil Cleaning & Sanitization', price_range: '$150 - 250', offer_context: 'During AC Tune-Up', is_active: true, sort_order: 1, benefits: JSON.stringify(['Improves cooling efficiency', 'Reduces airborne bacteria', 'Extends unit lifespan']), script: 'While cleaning your system, I noticed significant buildup on the indoor coil. A deep-cleaning and sanitization will improve your air quality and help the system run more efficiently.' },
    { id: 'svc_002', type: 'HVAC', company_id: 'comp_sp_123', name: 'Surge Protector Installation', price_range: '$120', offer_context: 'Any HVAC call', is_active: true, sort_order: 2, benefits: JSON.stringify(['Protects sensitive electronics from power surges', 'Prevents costly board replacements', 'Required by some manufacturer warranties']), script: 'Modern HVAC systems have sensitive circuit boards. I recommend a surge protector to safeguard your investment against unexpected power fluctuations.' },
    { id: 'svc_006', type: 'HVAC', company_id: 'comp_sp_123', name: 'UV Light Air Purifier', price_range: '$350 - 500', offer_context: 'During maintenance or IAQ complaint', is_active: true, sort_order: 3, benefits: JSON.stringify(['Kills mold and bacteria in the air handler', 'Reduces allergens and odors', 'Improves overall indoor air quality']), script: 'For ongoing air quality improvement, a UV light inside the air handler kills mold, bacteria, and viruses as air passes through. It\'s a set-it-and-forget-it solution.' },
    // Plumbing Services
    { id: 'svc_003', type: 'Plumbing', company_id: 'comp_sp_123', name: 'Water Heater Flush & Inspection', price_range: '$180', offer_context: 'During any plumbing repair', is_active: true, sort_order: 1, benefits: JSON.stringify(['Removes sediment buildup', 'Increases efficiency and lifespan', 'Prevents unexpected failures']), script: 'To keep your water heater running efficiently, I recommend a full flush and inspection to clear out sediment that can cause damage over time.' },
    { id: 'svc_004', type: 'Plumbing', company_id: 'comp_sp_123', name: 'Bio-Clean Drain Treatment', price_range: '$95', offer_context: 'After clearing a clog', is_active: true, sort_order: 2, benefits: JSON.stringify(['Natural enzymes eliminate organic waste', 'Prevents future clogs', 'Safe for all pipes']), script: 'To prevent this from happening again, I recommend a Bio-Clean treatment. It uses natural enzymes to eat away at the gunk in your pipes, keeping them clear.' },
    { id: 'svc_007', type: 'Plumbing', company_id: 'comp_sp_123', name: 'Whole-House Water Filtration', price_range: '$800 - 1200', offer_context: 'Water quality complaint or new install', is_active: true, sort_order: 3, benefits: JSON.stringify(['Removes chlorine, sediment, and contaminants', 'Better tasting water from every faucet', 'Protects appliances from scale buildup']), script: 'If you\'re concerned about water quality, a whole-house filtration system gives you clean, filtered water from every tap in your home.' },
    // Energy Services
    { id: 'svc_005', type: 'Energy', company_id: 'comp_sp_123', name: 'Home Energy Audit', price_range: '$300 - 500', offer_context: 'After high-bill complaint', is_active: true, sort_order: 1, benefits: JSON.stringify(['Pinpoints sources of energy loss', 'Provides a roadmap for savings', 'Can identify insulation and sealing issues']), script: 'It sounds like your energy bills are higher than they should be. We can perform a comprehensive energy audit to find exactly where your home is losing energy and create a plan to fix it.' },
    { id: 'svc_008', type: 'Energy', company_id: 'comp_sp_123', name: 'Smart Thermostat Installation', price_range: '$250 - 400', offer_context: 'Any HVAC or energy call', is_active: true, sort_order: 2, benefits: JSON.stringify(['Saves 10-15% on heating and cooling', 'Remote control from your phone', 'Learns your schedule automatically']), script: 'A smart thermostat can save you 10-15% on your energy bills by learning your schedule and adjusting automatically. You can also control it from your phone.' },
];

// =========================================================================
// EVENT-LEVEL DATA — Powers the dashboard analytics & leaderboard
// =========================================================================

// Helper to generate dates within the last N days
const daysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
    return d.toISOString();
};

// Visits represent individual customer appointments
store.visits = [
    // John Doe — 25 visits in the last 30 days (high volume)
    { id: 'visit_001', technician_id: 'tech_123', timestamp: daysAgo(1), customer_name: 'Williams Residence' },
    { id: 'visit_002', technician_id: 'tech_123', timestamp: daysAgo(2), customer_name: 'Garcia Home' },
    { id: 'visit_003', technician_id: 'tech_123', timestamp: daysAgo(3), customer_name: 'Anderson Property' },
    { id: 'visit_004', technician_id: 'tech_123', timestamp: daysAgo(4), customer_name: 'Thompson Estate' },
    { id: 'visit_005', technician_id: 'tech_123', timestamp: daysAgo(5), customer_name: 'Martinez Residence' },
    { id: 'visit_006', technician_id: 'tech_123', timestamp: daysAgo(6), customer_name: 'Davis Home' },
    { id: 'visit_007', technician_id: 'tech_123', timestamp: daysAgo(7), customer_name: 'Wilson Property' },
    { id: 'visit_008', technician_id: 'tech_123', timestamp: daysAgo(8), customer_name: 'Taylor Home' },
    { id: 'visit_009', technician_id: 'tech_123', timestamp: daysAgo(9), customer_name: 'Brown Residence' },
    { id: 'visit_010', technician_id: 'tech_123', timestamp: daysAgo(10), customer_name: 'Lee Property' },
    { id: 'visit_011', technician_id: 'tech_123', timestamp: daysAgo(11), customer_name: 'Clark Home' },
    { id: 'visit_012', technician_id: 'tech_123', timestamp: daysAgo(12), customer_name: 'Hall Residence' },
    { id: 'visit_013', technician_id: 'tech_123', timestamp: daysAgo(14), customer_name: 'Young Property' },
    { id: 'visit_014', technician_id: 'tech_123', timestamp: daysAgo(16), customer_name: 'King Home' },
    { id: 'visit_015', technician_id: 'tech_123', timestamp: daysAgo(18), customer_name: 'Wright Residence' },
    { id: 'visit_016', technician_id: 'tech_123', timestamp: daysAgo(20), customer_name: 'Lopez Property' },
    { id: 'visit_017', technician_id: 'tech_123', timestamp: daysAgo(22), customer_name: 'Hill Home' },
    { id: 'visit_018', technician_id: 'tech_123', timestamp: daysAgo(24), customer_name: 'Scott Residence' },
    { id: 'visit_019', technician_id: 'tech_123', timestamp: daysAgo(25), customer_name: 'Green Property' },
    { id: 'visit_020', technician_id: 'tech_123', timestamp: daysAgo(26), customer_name: 'Adams Home' },
    { id: 'visit_021', technician_id: 'tech_123', timestamp: daysAgo(27), customer_name: 'Baker Residence' },
    { id: 'visit_022', technician_id: 'tech_123', timestamp: daysAgo(28), customer_name: 'Nelson Property' },
    { id: 'visit_023', technician_id: 'tech_123', timestamp: daysAgo(29), customer_name: 'Carter Home' },
    { id: 'visit_024', technician_id: 'tech_123', timestamp: daysAgo(29), customer_name: 'Mitchell Residence' },
    { id: 'visit_025', technician_id: 'tech_123', timestamp: daysAgo(30), customer_name: 'Perez Property' },

    // Jane Smith — 22 visits (good volume)
    { id: 'visit_101', technician_id: 'tech_456', timestamp: daysAgo(1), customer_name: 'Robinson Home' },
    { id: 'visit_102', technician_id: 'tech_456', timestamp: daysAgo(2), customer_name: 'Walker Residence' },
    { id: 'visit_103', technician_id: 'tech_456', timestamp: daysAgo(3), customer_name: 'Allen Property' },
    { id: 'visit_104', technician_id: 'tech_456', timestamp: daysAgo(5), customer_name: 'Sanchez Home' },
    { id: 'visit_105', technician_id: 'tech_456', timestamp: daysAgo(6), customer_name: 'Morris Residence' },
    { id: 'visit_106', technician_id: 'tech_456', timestamp: daysAgo(7), customer_name: 'Rogers Property' },
    { id: 'visit_107', technician_id: 'tech_456', timestamp: daysAgo(9), customer_name: 'Reed Home' },
    { id: 'visit_108', technician_id: 'tech_456', timestamp: daysAgo(10), customer_name: 'Cook Residence' },
    { id: 'visit_109', technician_id: 'tech_456', timestamp: daysAgo(12), customer_name: 'Morgan Property' },
    { id: 'visit_110', technician_id: 'tech_456', timestamp: daysAgo(13), customer_name: 'Bell Home' },
    { id: 'visit_111', technician_id: 'tech_456', timestamp: daysAgo(15), customer_name: 'Murphy Residence' },
    { id: 'visit_112', technician_id: 'tech_456', timestamp: daysAgo(16), customer_name: 'Bailey Property' },
    { id: 'visit_113', technician_id: 'tech_456', timestamp: daysAgo(18), customer_name: 'Rivera Home' },
    { id: 'visit_114', technician_id: 'tech_456', timestamp: daysAgo(19), customer_name: 'Cooper Residence' },
    { id: 'visit_115', technician_id: 'tech_456', timestamp: daysAgo(21), customer_name: 'Richardson Property' },
    { id: 'visit_116', technician_id: 'tech_456', timestamp: daysAgo(22), customer_name: 'Cox Home' },
    { id: 'visit_117', technician_id: 'tech_456', timestamp: daysAgo(24), customer_name: 'Howard Residence' },
    { id: 'visit_118', technician_id: 'tech_456', timestamp: daysAgo(25), customer_name: 'Ward Property' },
    { id: 'visit_119', technician_id: 'tech_456', timestamp: daysAgo(27), customer_name: 'Torres Home' },
    { id: 'visit_120', technician_id: 'tech_456', timestamp: daysAgo(28), customer_name: 'Peterson Residence' },
    { id: 'visit_121', technician_id: 'tech_456', timestamp: daysAgo(29), customer_name: 'Gray Property' },
    { id: 'visit_122', technician_id: 'tech_456', timestamp: daysAgo(30), customer_name: 'Ramirez Home' },

    // Mike Rivera — 18 visits (moderate)
    { id: 'visit_201', technician_id: 'tech_789', timestamp: daysAgo(1), customer_name: 'James Home' },
    { id: 'visit_202', technician_id: 'tech_789', timestamp: daysAgo(3), customer_name: 'Watson Property' },
    { id: 'visit_203', technician_id: 'tech_789', timestamp: daysAgo(5), customer_name: 'Brooks Residence' },
    { id: 'visit_204', technician_id: 'tech_789', timestamp: daysAgo(7), customer_name: 'Kelly Home' },
    { id: 'visit_205', technician_id: 'tech_789', timestamp: daysAgo(9), customer_name: 'Sanders Property' },
    { id: 'visit_206', technician_id: 'tech_789', timestamp: daysAgo(11), customer_name: 'Price Residence' },
    { id: 'visit_207', technician_id: 'tech_789', timestamp: daysAgo(13), customer_name: 'Bennett Home' },
    { id: 'visit_208', technician_id: 'tech_789', timestamp: daysAgo(15), customer_name: 'Wood Property' },
    { id: 'visit_209', technician_id: 'tech_789', timestamp: daysAgo(17), customer_name: 'Barnes Residence' },
    { id: 'visit_210', technician_id: 'tech_789', timestamp: daysAgo(19), customer_name: 'Ross Home' },
    { id: 'visit_211', technician_id: 'tech_789', timestamp: daysAgo(20), customer_name: 'Henderson Property' },
    { id: 'visit_212', technician_id: 'tech_789', timestamp: daysAgo(22), customer_name: 'Coleman Residence' },
    { id: 'visit_213', technician_id: 'tech_789', timestamp: daysAgo(23), customer_name: 'Jenkins Home' },
    { id: 'visit_214', technician_id: 'tech_789', timestamp: daysAgo(25), customer_name: 'Perry Property' },
    { id: 'visit_215', technician_id: 'tech_789', timestamp: daysAgo(26), customer_name: 'Powell Residence' },
    { id: 'visit_216', technician_id: 'tech_789', timestamp: daysAgo(27), customer_name: 'Long Home' },
    { id: 'visit_217', technician_id: 'tech_789', timestamp: daysAgo(28), customer_name: 'Patterson Property' },
    { id: 'visit_218', technician_id: 'tech_789', timestamp: daysAgo(30), customer_name: 'Hughes Residence' },

    // Sarah Chen — 12 visits (lower volume, below goal)
    { id: 'visit_301', technician_id: 'tech_012', timestamp: daysAgo(2), customer_name: 'Flores Home' },
    { id: 'visit_302', technician_id: 'tech_012', timestamp: daysAgo(5), customer_name: 'Washington Property' },
    { id: 'visit_303', technician_id: 'tech_012', timestamp: daysAgo(8), customer_name: 'Butler Residence' },
    { id: 'visit_304', technician_id: 'tech_012', timestamp: daysAgo(11), customer_name: 'Simmons Home' },
    { id: 'visit_305', technician_id: 'tech_012', timestamp: daysAgo(14), customer_name: 'Foster Property' },
    { id: 'visit_306', technician_id: 'tech_012', timestamp: daysAgo(17), customer_name: 'Gonzales Residence' },
    { id: 'visit_307', technician_id: 'tech_012', timestamp: daysAgo(19), customer_name: 'Bryant Home' },
    { id: 'visit_308', technician_id: 'tech_012', timestamp: daysAgo(22), customer_name: 'Alexander Property' },
    { id: 'visit_309', technician_id: 'tech_012', timestamp: daysAgo(24), customer_name: 'Russell Residence' },
    { id: 'visit_310', technician_id: 'tech_012', timestamp: daysAgo(26), customer_name: 'Griffin Home' },
    { id: 'visit_311', technician_id: 'tech_012', timestamp: daysAgo(28), customer_name: 'Diaz Property' },
    { id: 'visit_312', technician_id: 'tech_012', timestamp: daysAgo(30), customer_name: 'Hayes Residence' },

    // === HISTORICAL VISITS (31-90 days ago) ===
    { id: 'visit_h001', technician_id: 'tech_123', timestamp: daysAgo(35), customer_name: 'Evans Home' },
    { id: 'visit_h002', technician_id: 'tech_123', timestamp: daysAgo(38), customer_name: 'Fisher Property' },
    { id: 'visit_h003', technician_id: 'tech_123', timestamp: daysAgo(40), customer_name: 'Hunt Residence' },
    { id: 'visit_h004', technician_id: 'tech_123', timestamp: daysAgo(42), customer_name: 'Mason Home' },
    { id: 'visit_h005', technician_id: 'tech_123', timestamp: daysAgo(45), customer_name: 'Dixon Property' },
    { id: 'visit_h006', technician_id: 'tech_123', timestamp: daysAgo(48), customer_name: 'Stone Home' },
    { id: 'visit_h007', technician_id: 'tech_123', timestamp: daysAgo(50), customer_name: 'Webb Residence' },
    { id: 'visit_h008', technician_id: 'tech_123', timestamp: daysAgo(55), customer_name: 'Craig Property' },
    { id: 'visit_h009', technician_id: 'tech_123', timestamp: daysAgo(60), customer_name: 'Palmer Home' },
    { id: 'visit_h010', technician_id: 'tech_123', timestamp: daysAgo(65), customer_name: 'Shaw Residence' },
    { id: 'visit_h101', technician_id: 'tech_456', timestamp: daysAgo(33), customer_name: 'Dunn Home' },
    { id: 'visit_h102', technician_id: 'tech_456', timestamp: daysAgo(36), customer_name: 'Carr Property' },
    { id: 'visit_h103', technician_id: 'tech_456', timestamp: daysAgo(40), customer_name: 'Hart Residence' },
    { id: 'visit_h104', technician_id: 'tech_456', timestamp: daysAgo(43), customer_name: 'Boyd Home' },
    { id: 'visit_h105', technician_id: 'tech_456', timestamp: daysAgo(47), customer_name: 'Dean Property' },
    { id: 'visit_h106', technician_id: 'tech_456', timestamp: daysAgo(52), customer_name: 'Lane Residence' },
    { id: 'visit_h107', technician_id: 'tech_456', timestamp: daysAgo(58), customer_name: 'Fox Home' },
    { id: 'visit_h108', technician_id: 'tech_456', timestamp: daysAgo(62), customer_name: 'Hale Property' },
    { id: 'visit_h201', technician_id: 'tech_789', timestamp: daysAgo(34), customer_name: 'Curry Home' },
    { id: 'visit_h202', technician_id: 'tech_789', timestamp: daysAgo(39), customer_name: 'Quinn Property' },
    { id: 'visit_h203', technician_id: 'tech_789', timestamp: daysAgo(44), customer_name: 'Gibbs Residence' },
    { id: 'visit_h204', technician_id: 'tech_789', timestamp: daysAgo(49), customer_name: 'Rowe Home' },
    { id: 'visit_h205', technician_id: 'tech_789', timestamp: daysAgo(55), customer_name: 'Mack Property' },
    { id: 'visit_h206', technician_id: 'tech_789', timestamp: daysAgo(60), customer_name: 'Drake Residence' },
    { id: 'visit_h301', technician_id: 'tech_012', timestamp: daysAgo(37), customer_name: 'Byrd Home' },
    { id: 'visit_h302', technician_id: 'tech_012', timestamp: daysAgo(50), customer_name: 'Love Property' },
    { id: 'visit_h303', technician_id: 'tech_012', timestamp: daysAgo(63), customer_name: 'Watts Residence' },
];

// Offer events — each time a technician presented a service and got a decision
store.offerEvents = [
    // John Doe — 22 presentations out of 25 visits (88% presentation rate), strong closer
    { id: 'evt_001', technician_id: 'tech_123', service_id: 'svc_001', visit_id: 'visit_001', outcome: 'approved', revenue: 200, timestamp: daysAgo(1) },
    { id: 'evt_002', technician_id: 'tech_123', service_id: 'svc_002', visit_id: 'visit_002', outcome: 'approved', revenue: 120, timestamp: daysAgo(2) },
    { id: 'evt_003', technician_id: 'tech_123', service_id: 'svc_001', visit_id: 'visit_003', outcome: 'declined', revenue: 0, decline_reason: 'too_expensive', timestamp: daysAgo(3) },
    { id: 'evt_004', technician_id: 'tech_123', service_id: 'svc_006', visit_id: 'visit_004', outcome: 'approved', revenue: 425, timestamp: daysAgo(4) },
    { id: 'evt_005', technician_id: 'tech_123', service_id: 'svc_002', visit_id: 'visit_005', outcome: 'declined', revenue: 0, decline_reason: 'not_now', timestamp: daysAgo(5) },
    { id: 'evt_006', technician_id: 'tech_123', service_id: 'svc_008', visit_id: 'visit_006', outcome: 'approved', revenue: 300, timestamp: daysAgo(6) },
    { id: 'evt_007', technician_id: 'tech_123', service_id: 'svc_001', visit_id: 'visit_007', outcome: 'approved', revenue: 175, timestamp: daysAgo(7) },
    { id: 'evt_008', technician_id: 'tech_123', service_id: 'svc_003', visit_id: 'visit_008', outcome: 'declined', revenue: 0, decline_reason: 'think_about_it', timestamp: daysAgo(8) },
    { id: 'evt_009', technician_id: 'tech_123', service_id: 'svc_005', visit_id: 'visit_009', outcome: 'approved', revenue: 400, timestamp: daysAgo(9) },
    { id: 'evt_010', technician_id: 'tech_123', service_id: 'svc_002', visit_id: 'visit_010', outcome: 'approved', revenue: 120, timestamp: daysAgo(10) },
    { id: 'evt_011', technician_id: 'tech_123', service_id: 'svc_004', visit_id: 'visit_011', outcome: 'declined', revenue: 0, decline_reason: 'no_interest', timestamp: daysAgo(11) },
    { id: 'evt_012', technician_id: 'tech_123', service_id: 'svc_006', visit_id: 'visit_012', outcome: 'declined', revenue: 0, decline_reason: 'too_expensive', timestamp: daysAgo(12) },
    { id: 'evt_013', technician_id: 'tech_123', service_id: 'svc_001', visit_id: 'visit_013', outcome: 'approved', revenue: 225, timestamp: daysAgo(14) },
    { id: 'evt_014', technician_id: 'tech_123', service_id: 'svc_008', visit_id: 'visit_014', outcome: 'approved', revenue: 350, timestamp: daysAgo(16) },
    { id: 'evt_015', technician_id: 'tech_123', service_id: 'svc_003', visit_id: 'visit_015', outcome: 'approved', revenue: 180, timestamp: daysAgo(18) },
    { id: 'evt_016', technician_id: 'tech_123', service_id: 'svc_007', visit_id: 'visit_016', outcome: 'declined', revenue: 0, decline_reason: 'spouse_decision', timestamp: daysAgo(20) },
    { id: 'evt_017', technician_id: 'tech_123', service_id: 'svc_002', visit_id: 'visit_017', outcome: 'approved', revenue: 120, timestamp: daysAgo(22) },
    { id: 'evt_018', technician_id: 'tech_123', service_id: 'svc_001', visit_id: 'visit_018', outcome: 'declined', revenue: 0, decline_reason: 'not_now', timestamp: daysAgo(24) },
    { id: 'evt_019', technician_id: 'tech_123', service_id: 'svc_005', visit_id: 'visit_019', outcome: 'approved', revenue: 350, timestamp: daysAgo(25) },
    { id: 'evt_020', technician_id: 'tech_123', service_id: 'svc_004', visit_id: 'visit_020', outcome: 'approved', revenue: 95, timestamp: daysAgo(26) },
    { id: 'evt_021', technician_id: 'tech_123', service_id: 'svc_006', visit_id: 'visit_021', outcome: 'approved', revenue: 475, timestamp: daysAgo(27) },
    { id: 'evt_022', technician_id: 'tech_123', service_id: 'svc_003', visit_id: 'visit_023', outcome: 'declined', revenue: 0, decline_reason: 'already_have', timestamp: daysAgo(29) },

    // Jane Smith — 18 presentations out of 22 visits (82%), decent closer
    { id: 'evt_101', technician_id: 'tech_456', service_id: 'svc_003', visit_id: 'visit_101', outcome: 'approved', revenue: 180, timestamp: daysAgo(1) },
    { id: 'evt_102', technician_id: 'tech_456', service_id: 'svc_004', visit_id: 'visit_102', outcome: 'approved', revenue: 95, timestamp: daysAgo(2) },
    { id: 'evt_103', technician_id: 'tech_456', service_id: 'svc_001', visit_id: 'visit_103', outcome: 'declined', revenue: 0, decline_reason: 'think_about_it', timestamp: daysAgo(3) },
    { id: 'evt_104', technician_id: 'tech_456', service_id: 'svc_007', visit_id: 'visit_104', outcome: 'approved', revenue: 950, timestamp: daysAgo(5) },
    { id: 'evt_105', technician_id: 'tech_456', service_id: 'svc_002', visit_id: 'visit_105', outcome: 'declined', revenue: 0, decline_reason: 'too_expensive', timestamp: daysAgo(6) },
    { id: 'evt_106', technician_id: 'tech_456', service_id: 'svc_005', visit_id: 'visit_106', outcome: 'approved', revenue: 450, timestamp: daysAgo(7) },
    { id: 'evt_107', technician_id: 'tech_456', service_id: 'svc_001', visit_id: 'visit_107', outcome: 'approved', revenue: 200, timestamp: daysAgo(9) },
    { id: 'evt_108', technician_id: 'tech_456', service_id: 'svc_008', visit_id: 'visit_108', outcome: 'declined', revenue: 0, decline_reason: 'not_now', timestamp: daysAgo(10) },
    { id: 'evt_109', technician_id: 'tech_456', service_id: 'svc_003', visit_id: 'visit_109', outcome: 'approved', revenue: 180, timestamp: daysAgo(12) },
    { id: 'evt_110', technician_id: 'tech_456', service_id: 'svc_006', visit_id: 'visit_110', outcome: 'approved', revenue: 400, timestamp: daysAgo(13) },
    { id: 'evt_111', technician_id: 'tech_456', service_id: 'svc_004', visit_id: 'visit_111', outcome: 'declined', revenue: 0, decline_reason: 'no_interest', timestamp: daysAgo(15) },
    { id: 'evt_112', technician_id: 'tech_456', service_id: 'svc_002', visit_id: 'visit_112', outcome: 'approved', revenue: 120, timestamp: daysAgo(16) },
    { id: 'evt_113', technician_id: 'tech_456', service_id: 'svc_001', visit_id: 'visit_113', outcome: 'approved', revenue: 225, timestamp: daysAgo(18) },
    { id: 'evt_114', technician_id: 'tech_456', service_id: 'svc_007', visit_id: 'visit_114', outcome: 'declined', revenue: 0, decline_reason: 'too_expensive', timestamp: daysAgo(19) },
    { id: 'evt_115', technician_id: 'tech_456', service_id: 'svc_003', visit_id: 'visit_115', outcome: 'declined', revenue: 0, decline_reason: 'spouse_decision', timestamp: daysAgo(21) },
    { id: 'evt_116', technician_id: 'tech_456', service_id: 'svc_005', visit_id: 'visit_117', outcome: 'approved', revenue: 375, timestamp: daysAgo(24) },
    { id: 'evt_117', technician_id: 'tech_456', service_id: 'svc_008', visit_id: 'visit_119', outcome: 'approved', revenue: 275, timestamp: daysAgo(27) },
    { id: 'evt_118', technician_id: 'tech_456', service_id: 'svc_004', visit_id: 'visit_121', outcome: 'approved', revenue: 95, timestamp: daysAgo(29) },

    // Mike Rivera — 14 presentations out of 18 visits (78%), moderate closer
    { id: 'evt_201', technician_id: 'tech_789', service_id: 'svc_002', visit_id: 'visit_201', outcome: 'approved', revenue: 120, timestamp: daysAgo(1) },
    { id: 'evt_202', technician_id: 'tech_789', service_id: 'svc_001', visit_id: 'visit_202', outcome: 'declined', revenue: 0, decline_reason: 'not_now', timestamp: daysAgo(3) },
    { id: 'evt_203', technician_id: 'tech_789', service_id: 'svc_006', visit_id: 'visit_203', outcome: 'approved', revenue: 400, timestamp: daysAgo(5) },
    { id: 'evt_204', technician_id: 'tech_789', service_id: 'svc_003', visit_id: 'visit_204', outcome: 'approved', revenue: 180, timestamp: daysAgo(7) },
    { id: 'evt_205', technician_id: 'tech_789', service_id: 'svc_004', visit_id: 'visit_205', outcome: 'declined', revenue: 0, decline_reason: 'think_about_it', timestamp: daysAgo(9) },
    { id: 'evt_206', technician_id: 'tech_789', service_id: 'svc_008', visit_id: 'visit_206', outcome: 'approved', revenue: 300, timestamp: daysAgo(11) },
    { id: 'evt_207', technician_id: 'tech_789', service_id: 'svc_001', visit_id: 'visit_207', outcome: 'declined', revenue: 0, decline_reason: 'already_have', timestamp: daysAgo(13) },
    { id: 'evt_208', technician_id: 'tech_789', service_id: 'svc_005', visit_id: 'visit_208', outcome: 'declined', revenue: 0, decline_reason: 'too_expensive', timestamp: daysAgo(15) },
    { id: 'evt_209', technician_id: 'tech_789', service_id: 'svc_002', visit_id: 'visit_209', outcome: 'approved', revenue: 120, timestamp: daysAgo(17) },
    { id: 'evt_210', technician_id: 'tech_789', service_id: 'svc_007', visit_id: 'visit_210', outcome: 'approved', revenue: 1000, timestamp: daysAgo(19) },
    { id: 'evt_211', technician_id: 'tech_789', service_id: 'svc_001', visit_id: 'visit_212', outcome: 'approved', revenue: 200, timestamp: daysAgo(22) },
    { id: 'evt_212', technician_id: 'tech_789', service_id: 'svc_003', visit_id: 'visit_214', outcome: 'declined', revenue: 0, decline_reason: 'not_now', timestamp: daysAgo(25) },
    { id: 'evt_213', technician_id: 'tech_789', service_id: 'svc_006', visit_id: 'visit_216', outcome: 'approved', revenue: 450, timestamp: daysAgo(27) },
    { id: 'evt_214', technician_id: 'tech_789', service_id: 'svc_004', visit_id: 'visit_218', outcome: 'approved', revenue: 95, timestamp: daysAgo(30) },

    // Sarah Chen — 6 presentations out of 12 visits (50% presentation rate — underperformer!)
    { id: 'evt_301', technician_id: 'tech_012', service_id: 'svc_001', visit_id: 'visit_301', outcome: 'approved', revenue: 175, timestamp: daysAgo(2) },
    { id: 'evt_302', technician_id: 'tech_012', service_id: 'svc_003', visit_id: 'visit_303', outcome: 'declined', revenue: 0, decline_reason: 'too_expensive', timestamp: daysAgo(8) },
    { id: 'evt_303', technician_id: 'tech_012', service_id: 'svc_002', visit_id: 'visit_305', outcome: 'approved', revenue: 120, timestamp: daysAgo(14) },
    { id: 'evt_304', technician_id: 'tech_012', service_id: 'svc_004', visit_id: 'visit_307', outcome: 'declined', revenue: 0, decline_reason: 'no_interest', timestamp: daysAgo(19) },
    { id: 'evt_305', technician_id: 'tech_012', service_id: 'svc_001', visit_id: 'visit_309', outcome: 'approved', revenue: 200, timestamp: daysAgo(24) },
    { id: 'evt_306', technician_id: 'tech_012', service_id: 'svc_005', visit_id: 'visit_311', outcome: 'declined', revenue: 0, decline_reason: 'think_about_it', timestamp: daysAgo(28) },

    // === HISTORICAL DATA (31-90 days ago) — makes 90-day and All Time views distinct ===
    // John Doe — prior month
    { id: 'evt_h001', technician_id: 'tech_123', service_id: 'svc_001', visit_id: 'visit_h001', outcome: 'approved', revenue: 200, timestamp: daysAgo(35) },
    { id: 'evt_h002', technician_id: 'tech_123', service_id: 'svc_002', visit_id: 'visit_h002', outcome: 'approved', revenue: 120, timestamp: daysAgo(38) },
    { id: 'evt_h003', technician_id: 'tech_123', service_id: 'svc_006', visit_id: 'visit_h003', outcome: 'declined', revenue: 0, decline_reason: 'too_expensive', timestamp: daysAgo(40) },
    { id: 'evt_h004', technician_id: 'tech_123', service_id: 'svc_003', visit_id: 'visit_h004', outcome: 'approved', revenue: 180, timestamp: daysAgo(42) },
    { id: 'evt_h005', technician_id: 'tech_123', service_id: 'svc_008', visit_id: 'visit_h005', outcome: 'approved', revenue: 300, timestamp: daysAgo(45) },
    { id: 'evt_h006', technician_id: 'tech_123', service_id: 'svc_005', visit_id: 'visit_h006', outcome: 'declined', revenue: 0, decline_reason: 'not_now', timestamp: daysAgo(48) },
    { id: 'evt_h007', technician_id: 'tech_123', service_id: 'svc_001', visit_id: 'visit_h007', outcome: 'approved', revenue: 225, timestamp: daysAgo(50) },
    { id: 'evt_h008', technician_id: 'tech_123', service_id: 'svc_004', visit_id: 'visit_h008', outcome: 'approved', revenue: 95, timestamp: daysAgo(55) },
    { id: 'evt_h009', technician_id: 'tech_123', service_id: 'svc_007', visit_id: 'visit_h009', outcome: 'approved', revenue: 1000, timestamp: daysAgo(60) },
    { id: 'evt_h010', technician_id: 'tech_123', service_id: 'svc_002', visit_id: 'visit_h010', outcome: 'declined', revenue: 0, decline_reason: 'already_have', timestamp: daysAgo(65) },

    // Jane Smith — prior month
    { id: 'evt_h101', technician_id: 'tech_456', service_id: 'svc_003', visit_id: 'visit_h101', outcome: 'approved', revenue: 180, timestamp: daysAgo(33) },
    { id: 'evt_h102', technician_id: 'tech_456', service_id: 'svc_001', visit_id: 'visit_h102', outcome: 'approved', revenue: 200, timestamp: daysAgo(36) },
    { id: 'evt_h103', technician_id: 'tech_456', service_id: 'svc_007', visit_id: 'visit_h103', outcome: 'approved', revenue: 900, timestamp: daysAgo(40) },
    { id: 'evt_h104', technician_id: 'tech_456', service_id: 'svc_002', visit_id: 'visit_h104', outcome: 'declined', revenue: 0, decline_reason: 'think_about_it', timestamp: daysAgo(43) },
    { id: 'evt_h105', technician_id: 'tech_456', service_id: 'svc_006', visit_id: 'visit_h105', outcome: 'approved', revenue: 425, timestamp: daysAgo(47) },
    { id: 'evt_h106', technician_id: 'tech_456', service_id: 'svc_004', visit_id: 'visit_h106', outcome: 'declined', revenue: 0, decline_reason: 'no_interest', timestamp: daysAgo(52) },
    { id: 'evt_h107', technician_id: 'tech_456', service_id: 'svc_005', visit_id: 'visit_h107', outcome: 'approved', revenue: 375, timestamp: daysAgo(58) },
    { id: 'evt_h108', technician_id: 'tech_456', service_id: 'svc_008', visit_id: 'visit_h108', outcome: 'approved', revenue: 300, timestamp: daysAgo(62) },

    // Mike Rivera — prior month
    { id: 'evt_h201', technician_id: 'tech_789', service_id: 'svc_001', visit_id: 'visit_h201', outcome: 'approved', revenue: 175, timestamp: daysAgo(34) },
    { id: 'evt_h202', technician_id: 'tech_789', service_id: 'svc_006', visit_id: 'visit_h202', outcome: 'declined', revenue: 0, decline_reason: 'spouse_decision', timestamp: daysAgo(39) },
    { id: 'evt_h203', technician_id: 'tech_789', service_id: 'svc_003', visit_id: 'visit_h203', outcome: 'approved', revenue: 180, timestamp: daysAgo(44) },
    { id: 'evt_h204', technician_id: 'tech_789', service_id: 'svc_002', visit_id: 'visit_h204', outcome: 'approved', revenue: 120, timestamp: daysAgo(49) },
    { id: 'evt_h205', technician_id: 'tech_789', service_id: 'svc_008', visit_id: 'visit_h205', outcome: 'approved', revenue: 350, timestamp: daysAgo(55) },
    { id: 'evt_h206', technician_id: 'tech_789', service_id: 'svc_004', visit_id: 'visit_h206', outcome: 'declined', revenue: 0, decline_reason: 'not_now', timestamp: daysAgo(60) },

    // Sarah Chen — prior month (still underperforming)
    { id: 'evt_h301', technician_id: 'tech_012', service_id: 'svc_001', visit_id: 'visit_h301', outcome: 'approved', revenue: 200, timestamp: daysAgo(37) },
    { id: 'evt_h302', technician_id: 'tech_012', service_id: 'svc_003', visit_id: 'visit_h302', outcome: 'declined', revenue: 0, decline_reason: 'too_expensive', timestamp: daysAgo(50) },
    { id: 'evt_h303', technician_id: 'tech_012', service_id: 'svc_002', visit_id: 'visit_h303', outcome: 'approved', revenue: 120, timestamp: daysAgo(63) },
];

// =========================================================================
// CUSTOMER DATA — For accounting system lookup simulation
// =========================================================================

export const MOCK_CUSTOMERS_QB = [
    { name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '555-0101', address: '123 Oak St, Austin, TX 78701' },
    { name: 'Mike Williams', email: 'mike.w@email.com', phone: '555-0202', address: '456 Elm Ave, Austin, TX 78702' },
    { name: 'Jennifer Garcia', email: 'jen.g@email.com', phone: '555-0303', address: '789 Pine Rd, Round Rock, TX 78664' },
    { name: 'Robert Anderson', email: 'rob.a@email.com', phone: '555-0404', address: '321 Maple Dr, Cedar Park, TX 78613' },
    { name: 'Lisa Thompson', email: 'lisa.t@email.com', phone: '555-0505', address: '654 Birch Ln, Georgetown, TX 78626' },
];

// =========================================================================
// SEASONAL CONFIG — which months each service is "in season"
// =========================================================================
export const SEASONAL_CONFIG = {
    'svc_001': { months: [3, 4, 5, 6, 7, 8], label: 'Spring/Summer Pick' },       // Coil Cleaning
    'svc_002': { months: [1,2,3,4,5,6,7,8,9,10,11,12], label: '' },               // Surge Protector — always
    'svc_006': { months: [3, 4, 5, 6, 7, 8, 9], label: 'Allergy Season' },        // UV Light
    'svc_003': { months: [9, 10, 11], label: 'Fall Maintenance' },                 // Water Heater Flush
    'svc_004': { months: [1,2,3,4,5,6,7,8,9,10,11,12], label: '' },               // Bio-Clean — always
    'svc_007': { months: [1,2,3,4,5,6,7,8,9,10,11,12], label: '' },               // Water Filtration — always
    'svc_005': { months: [5, 6, 7, 11, 12, 1], label: 'Peak Bill Season' },       // Energy Audit
    'svc_008': { months: [9, 10, 11, 3, 4, 5], label: 'Season Change Pick' },     // Smart Thermostat
};

// =========================================================================
// VISIT TYPE CHECKLISTS — "What to Look For" per call type
// =========================================================================
export const VISIT_CHECKLISTS = {
    'AC Tune-Up': [
        { check: 'Inspect evaporator coil condition', leads_to: 'svc_001', trigger: 'If dirty or buildup visible' },
        { check: 'Verify surge protector present', leads_to: 'svc_002', trigger: 'If no surge protector installed' },
        { check: 'Check air handler for mold/odor', leads_to: 'svc_006', trigger: 'If musty smell or visible growth' },
        { check: 'Review thermostat age and type', leads_to: 'svc_008', trigger: 'If manual or older programmable' },
        { check: 'Ask about energy bills', leads_to: 'svc_005', trigger: 'If customer mentions high bills' },
    ],
    'Heating Repair': [
        { check: 'Verify surge protector present', leads_to: 'svc_002', trigger: 'If no surge protector installed' },
        { check: 'Review thermostat capabilities', leads_to: 'svc_008', trigger: 'If basic thermostat in use' },
        { check: 'Ask about energy bills', leads_to: 'svc_005', trigger: 'If customer mentions high costs' },
        { check: 'Check air quality concerns', leads_to: 'svc_006', trigger: 'If family has allergies or respiratory issues' },
    ],
    'Plumbing Repair': [
        { check: 'Ask when water heater was last flushed', leads_to: 'svc_003', trigger: 'If over 1 year or never' },
        { check: 'Inspect drains for slow flow', leads_to: 'svc_004', trigger: 'If slow draining or odor' },
        { check: 'Test water quality/taste', leads_to: 'svc_007', trigger: 'If hard water, chlorine taste, or staining' },
    ],
    'Drain Service': [
        { check: 'Assess recurring clog history', leads_to: 'svc_004', trigger: 'If repeat service call' },
        { check: 'Ask when water heater was last flushed', leads_to: 'svc_003', trigger: 'If over 1 year' },
        { check: 'Check water quality', leads_to: 'svc_007', trigger: 'If hard water signs visible' },
    ],
    'General Inspection': [
        { check: 'Inspect HVAC coils', leads_to: 'svc_001', trigger: 'If any buildup' },
        { check: 'Check for surge protection', leads_to: 'svc_002', trigger: 'If not present' },
        { check: 'Review water heater condition', leads_to: 'svc_003', trigger: 'If sediment or age concerns' },
        { check: 'Evaluate energy efficiency', leads_to: 'svc_005', trigger: 'If home is older or poorly insulated' },
        { check: 'Check thermostat', leads_to: 'svc_008', trigger: 'If outdated model' },
    ],
};

// =========================================================================
// ADDRESS HISTORY — past offers at specific addresses
// =========================================================================
store.addressHistory = [
    { address: '123 Oak St, Austin, TX 78701', service_id: 'svc_001', service_name: 'Coil Cleaning & Sanitization', outcome: 'approved', date: daysAgo(45), technician: 'John Doe' },
    { address: '123 Oak St, Austin, TX 78701', service_id: 'svc_002', service_name: 'Surge Protector Installation', outcome: 'declined', date: daysAgo(45), technician: 'John Doe' },
    { address: '456 Elm Ave, Austin, TX 78702', service_id: 'svc_003', service_name: 'Water Heater Flush & Inspection', outcome: 'approved', date: daysAgo(60), technician: 'Jane Smith' },
    { address: '456 Elm Ave, Austin, TX 78702', service_id: 'svc_004', service_name: 'Bio-Clean Drain Treatment', outcome: 'declined', date: daysAgo(60), technician: 'Jane Smith' },
    { address: '789 Pine Rd, Round Rock, TX 78664', service_id: 'svc_005', service_name: 'Home Energy Audit', outcome: 'declined', date: daysAgo(30), technician: 'Mike Rivera' },
    { address: '321 Maple Dr, Cedar Park, TX 78613', service_id: 'svc_006', service_name: 'UV Light Air Purifier', outcome: 'approved', date: daysAgo(90), technician: 'Sarah Chen' },
];

// =========================================================================
// FOLLOW-UP QUEUE — declined services tagged for re-presentation
// =========================================================================
store.followUps = [
    { id: 'fu_001', address: '123 Oak St, Austin, TX 78701', service_id: 'svc_002', service_name: 'Surge Protector Installation', declined_date: daysAgo(45), follow_up_date: daysAgo(15), technician_id: 'tech_123', status: 'pending', decline_reason: 'too_expensive' },
    { id: 'fu_002', address: '456 Elm Ave, Austin, TX 78702', service_id: 'svc_004', service_name: 'Bio-Clean Drain Treatment', declined_date: daysAgo(60), follow_up_date: daysAgo(30), technician_id: 'tech_456', status: 'pending', decline_reason: 'think_about_it' },
    { id: 'fu_003', address: '789 Pine Rd, Round Rock, TX 78664', service_id: 'svc_005', service_name: 'Home Energy Audit', declined_date: daysAgo(30), follow_up_date: daysAgo(0), technician_id: 'tech_789', status: 'pending', decline_reason: 'not_now' },
];

// =========================================================================
// DECLINE REASONS — tracked on each decline
// =========================================================================
export const DECLINE_REASONS = [
    { value: 'too_expensive', label: 'Too expensive' },
    { value: 'not_now', label: 'Not right now' },
    { value: 'already_have', label: 'Already have it' },
    { value: 'think_about_it', label: 'Wants to think about it' },
    { value: 'no_interest', label: 'Not interested' },
    { value: 'spouse_decision', label: 'Needs to discuss with spouse' },
    { value: 'other', label: 'Other' },
];

// =========================================================================
// CONFIGURATION
// =========================================================================

store.config = {
    order_routing_type: 'email',
    order_routing_target: 'service@company.com',
    accounting_system: 'none',
    accounting_api_key: '',
    min_presentations_per_month: 20,
    target_approval_rate: 25,
    flag_underperformers: true,
    monthly_revenue_goal: 40000,
    notification_preferences: {
        email_on_approve: true,
        email_on_decline: false,
        weekly_summary: true,
        underperformer_alert: true,
    }
};
