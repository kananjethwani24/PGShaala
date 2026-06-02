// High-Fidelity Client-Side Mock Database for PGShaala
// Simulates a relational PostgreSQL database on top of localStorage with full join & CRUD support.
const uuidv4 = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const getLocalStorage = (key: string, defaultVal: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const setLocalStorage = (key: string, val: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
};

// Initial Mock Data
const INITIAL_AGENTS = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Demo Agent', email: 'agent@gharpayy.com', phone: '9876543210', is_active: true, created_at: new Date().toISOString() },
  { id: 'a1', name: 'Priya Sharma', email: 'priya@gharpayy.com', phone: '9876543210', is_active: true, created_at: new Date().toISOString() },
  { id: 'a2', name: 'Rahul Verma', email: 'rahul@gharpayy.com', phone: '8765432109', is_active: true, created_at: new Date().toISOString() },
  { id: 'a3', name: 'Anita Desai', email: 'anita@gharpayy.com', phone: '7654321098', is_active: true, created_at: new Date().toISOString() },
  { id: 'a4', name: 'Vikram Singh', email: 'vikram@gharpayy.com', phone: '6543210987', is_active: true, created_at: new Date().toISOString() },
];

const INITIAL_OWNERS = [
  { id: 'owner1-uuid', user_id: 'owner1-auth-uuid', name: 'Ramesh Reddy', email: 'owner1@pgshaala.com', phone: '9999999991', company_name: 'Reddy Properties', is_active: true, created_at: new Date().toISOString() },
  { id: 'owner2-uuid', user_id: 'owner2-auth-uuid', name: 'Suresh Kumar', email: 'owner2@pgshaala.com', phone: '9999999992', company_name: 'Kumar Co-living', is_active: true, created_at: new Date().toISOString() },
  { id: 'owner3-uuid', user_id: 'owner3-auth-uuid', name: 'Priya Sharma', email: 'owner3@pgshaala.com', phone: '9999999993', company_name: 'Sharma PG', is_active: true, created_at: new Date().toISOString() }
];

const INITIAL_PROPERTIES = [
  { id: '22222222-2222-2222-2222-222222222222', name: 'FORUM PRO BOYS', area: 'koramangla', address: 'silk board, Koramangala, sg palya, MG road, nexus', city: 'Bangalore', price_range: '12k - 24k', is_active: true, food_details: '3-meals North & South Indian veg/non-veg', gender_allowed: 'male', total_rooms: 5, total_beds: 15, owner_id: 'owner1-uuid', created_at: new Date().toISOString() },
  { id: '33333333-3333-3333-3333-333333333333', name: 'FORUM 1 BOYS', area: 'koramangla', address: 'silk board, Koramangala, sg palya, MG road, nexus', city: 'Bangalore', price_range: '11k - 22k', is_active: true, food_details: '3-meals daily veg/non-veg', gender_allowed: 'male', total_rooms: 4, total_beds: 12, owner_id: 'owner1-uuid', created_at: new Date().toISOString() },
  { id: '44444444-4444-4444-4444-444444444444', name: 'GT GIRLS', area: 'koramangla', address: 'silk board, Koramangala, sg palya, MG road, nexus', city: 'Bangalore', price_range: '16k - 25k', is_active: true, food_details: '3-meals delicious home-style veg', gender_allowed: 'female', total_rooms: 6, total_beds: 18, owner_id: 'owner2-uuid', created_at: new Date().toISOString() },
  { id: '55555555-5555-5555-5555-555555555555', name: 'ESPLANADE GIRLS', area: 'koramangla', address: 'silk board, Koramangala, sg palya, MG road, nexus', city: 'Bangalore', price_range: '21k - 41k', is_active: true, food_details: 'Premium multi-cuisine buffet', gender_allowed: 'female', total_rooms: 8, total_beds: 24, owner_id: 'owner2-uuid', created_at: new Date().toISOString() },
  { id: '357a6c2f-3632-4a6e-9535-ea757f618634', name: 'GQ girl', area: 'koramangla', address: 'NEXUS, IBC knowledge, baneraghata road, dairy circle', city: 'Bangalore', price_range: '16k - 24k', is_active: true, food_details: 'Standard meals', gender_allowed: 'female', total_rooms: 3, total_beds: 9, owner_id: 'owner1-uuid', created_at: new Date().toISOString() },
  { id: 'a2c1e655-d27e-41a6-b1d7-0cb369c30345', name: 'homely GIRLS', area: 'koramangla', address: 'silk board, Koramangala, sg palya, MG road, nexus', city: 'Bangalore', price_range: '14k - 24k', is_active: true, food_details: 'Homestyle cooking', gender_allowed: 'female', total_rooms: 4, total_beds: 12, owner_id: 'owner2-uuid', created_at: new Date().toISOString() },
  { id: '1ef5dac0-7134-4022-b4f8-6afa746d7b4e', name: 'AFFO GIRLS NV', area: 'koramangla', address: 'IBC knowledge, baneraghata road, dairy circle', city: 'Bangalore', price_range: '11k - 20k', is_active: true, food_details: 'Affordable veg/non-veg meals', gender_allowed: 'female', total_rooms: 4, total_beds: 12, owner_id: 'owner3-uuid', created_at: new Date().toISOString() },
  { id: '24346cda-5c11-4519-9cc6-1c1560fb7b90', name: 'homely BOYS', area: 'koramangla', address: 'silk board, Koramangala, sg palya, MG road, nexus', city: 'Bangalore', price_range: '14k - 24k', is_active: true, food_details: 'Veg & non-veg options', gender_allowed: 'male', total_rooms: 4, total_beds: 12, owner_id: 'owner3-uuid', created_at: new Date().toISOString() },
];

const INITIAL_ROOMS = [
  // FORUM PRO BOYS Rooms
  { id: 'r1', property_id: '22222222-2222-2222-2222-222222222222', room_number: '101', floor: '1st', bed_count: 2, status: 'occupied', expected_rent: 14000, rent_per_bed: 14000, room_type: 'Double Sharing', furnishing: 'Fully Furnished', bathroom_type: 'Attached', amenities: ['WiFi', 'AC', 'TV'], created_at: new Date().toISOString() },
  { id: 'r2', property_id: '22222222-2222-2222-2222-222222222222', room_number: '102', floor: '1st', bed_count: 3, status: 'vacant', expected_rent: 12000, rent_per_bed: 12000, room_type: 'Triple Sharing', furnishing: 'Fully Furnished', bathroom_type: 'Attached', amenities: ['WiFi', 'Geyser'], created_at: new Date().toISOString() },
  { id: 'r3', property_id: '22222222-2222-2222-2222-222222222222', room_number: '201', floor: '2nd', bed_count: 1, status: 'occupied', expected_rent: 20000, rent_per_bed: 20000, room_type: 'Single Room', furnishing: 'Fully Furnished', bathroom_type: 'Attached', amenities: ['WiFi', 'AC', 'TV', 'Balcony'], created_at: new Date().toISOString() },
  { id: 'r4', property_id: '22222222-2222-2222-2222-222222222222', room_number: '202', floor: '2nd', bed_count: 2, status: 'vacating', expected_rent: 15000, rent_per_bed: 15000, room_type: 'Double Sharing', furnishing: 'Semi Furnished', bathroom_type: 'Attached', amenities: ['WiFi', 'Fridge'], created_at: new Date().toISOString() },
  
  // FORUM 1 BOYS Rooms
  { id: 'r5', property_id: '33333333-3333-3333-3333-333333333333', room_number: '101', floor: '1st', bed_count: 2, status: 'occupied', expected_rent: 13000, rent_per_bed: 13000, room_type: 'Double Sharing', furnishing: 'Fully Furnished', bathroom_type: 'Attached', amenities: ['WiFi', 'Fridge'], created_at: new Date().toISOString() },
  { id: 'r6', property_id: '33333333-3333-3333-3333-333333333333', room_number: '102', floor: '1st', bed_count: 3, status: 'vacant', expected_rent: 11000, rent_per_bed: 11000, room_type: 'Triple Sharing', furnishing: 'Fully Furnished', bathroom_type: 'Attached', amenities: ['WiFi'], created_at: new Date().toISOString() },
  
  // GT GIRLS Rooms
  { id: 'r7', property_id: '44444444-4444-4444-4444-444444444444', room_number: 'G01', floor: 'Ground', bed_count: 2, status: 'occupied', expected_rent: 18000, rent_per_bed: 18000, room_type: 'Double Sharing', furnishing: 'Fully Furnished', bathroom_type: 'Attached', amenities: ['WiFi', 'AC', 'Gym'], created_at: new Date().toISOString() },
  { id: 'r8', property_id: '44444444-4444-4444-4444-444444444444', room_number: 'G02', floor: 'Ground', bed_count: 2, status: 'vacant', expected_rent: 18000, rent_per_bed: 18000, room_type: 'Double Sharing', furnishing: 'Fully Furnished', bathroom_type: 'Attached', amenities: ['WiFi', 'AC'], created_at: new Date().toISOString() },
  
  // ESPLANADE GIRLS Rooms
  { id: 'r9', property_id: '55555555-5555-5555-5555-555555555555', room_number: '101', floor: '1st', bed_count: 1, status: 'occupied', expected_rent: 35000, rent_per_bed: 35000, room_type: 'Single Room', furnishing: 'Luxury Furnished', bathroom_type: 'Attached', amenities: ['WiFi', 'AC', 'TV', 'Balcony', 'Gym'], created_at: new Date().toISOString() },
  { id: 'r10', property_id: '55555555-5555-5555-5555-555555555555', room_number: '102', floor: '1st', bed_count: 2, status: 'vacant', expected_rent: 22000, rent_per_bed: 22000, room_type: 'Double Sharing', furnishing: 'Luxury Furnished', bathroom_type: 'Attached', amenities: ['WiFi', 'AC', 'TV'], created_at: new Date().toISOString() },
];

const INITIAL_BEDS = [
  // FORUM PRO BOYS Room 101 Beds
  { id: 'b1', room_id: 'r1', bed_number: 'B1', status: 'occupied', current_tenant_name: 'Rahul Sharma', current_rent: 14000, move_in_date: '2026-01-10', created_at: new Date().toISOString() },
  { id: 'b2', room_id: 'r1', bed_number: 'B2', status: 'occupied', current_tenant_name: 'Rajesh Kumar', current_rent: 14000, move_in_date: '2026-02-15', created_at: new Date().toISOString() },
  
  // FORUM PRO BOYS Room 102 Beds
  { id: 'b3', room_id: 'r2', bed_number: 'B1', status: 'vacant', current_tenant_name: null, current_rent: null, move_in_date: null, created_at: new Date().toISOString() },
  { id: 'b4', room_id: 'r2', bed_number: 'B2', status: 'vacant', current_tenant_name: null, current_rent: null, move_in_date: null, created_at: new Date().toISOString() },
  { id: 'b5', room_id: 'r2', bed_number: 'B3', status: 'vacant', current_tenant_name: null, current_rent: null, move_in_date: null, created_at: new Date().toISOString() },
  
  // GT GIRLS Room G01 Beds
  { id: 'b6', room_id: 'r7', bed_number: 'B1', status: 'occupied', current_tenant_name: 'Priya Patel', current_rent: 18000, move_in_date: '2026-03-01', created_at: new Date().toISOString() },
  { id: 'b7', room_id: 'r7', bed_number: 'B2', status: 'occupied', current_tenant_name: 'Anita Singh', current_rent: 18000, move_in_date: '2026-03-05', created_at: new Date().toISOString() },
];

const INITIAL_LEADS = [
  { id: 'l1', name: 'Rahul Sharma', phone: '9876543210', email: 'rahul@example.com', source: 'website', status: 'new', assigned_agent_id: '11111111-1111-1111-1111-111111111111', budget: '15k', preferred_location: 'Koramangala', property_id: '22222222-2222-2222-2222-222222222222', first_response_time_min: 5, lead_score: 25, created_at: '2026-03-08T09:15:00', updated_at: '2026-03-08T09:15:00', last_activity_at: '2026-03-08T09:15:00', tags: ['Budget Conscious'] },
  { id: 'l2', name: 'Priya Patel', phone: '9988776655', email: 'priya@example.com', source: 'instagram', status: 'contacted', assigned_agent_id: '11111111-1111-1111-1111-111111111111', budget: '20k', preferred_location: 'Koramangala', property_id: '44444444-4444-4444-4444-444444444444', first_response_time_min: 2, lead_score: 35, created_at: '2026-03-08T08:30:00', updated_at: '2026-03-08T08:45:00', last_activity_at: '2026-03-08T08:45:00', tags: ['Wants AC'] },
  { id: 'l3', name: 'Amit Kumar', phone: '9123456780', email: 'amit@example.com', source: 'whatsapp', status: 'visit_scheduled', assigned_agent_id: '11111111-1111-1111-1111-111111111111', budget: '18k', preferred_location: 'Koramangala', property_id: '33333333-3333-3333-3333-333333333333', first_response_time_min: 10, lead_score: 80, created_at: '2026-03-07T14:00:00', updated_at: '2026-03-08T10:00:00', last_activity_at: '2026-03-08T10:00:00', tags: ['Hot Lead'] },
  { id: 'l4', name: 'Neha Singh', phone: '9876501234', email: 'neha@example.com', source: 'phone', status: 'booked', assigned_agent_id: '11111111-1111-1111-1111-111111111111', budget: '22k', preferred_location: 'Koramangala', property_id: '55555555-5555-5555-5555-555555555555', first_response_time_min: 1, lead_score: 100, created_at: '2026-03-05T16:00:00', updated_at: '2026-03-08T11:00:00', last_activity_at: '2026-03-08T11:00:00', tags: ['Closed'] },
];

const INITIAL_VISITS = [
  { id: 'v1', lead_id: 'l3', property_id: '33333333-3333-3333-3333-333333333333', assigned_staff_id: '11111111-1111-1111-1111-111111111111', scheduled_at: new Date(Date.now() + 86400000).toISOString(), confirmed: true, notes: 'Interested in double sharing', created_at: new Date().toISOString() },
  { id: 'v2', lead_id: 'l2', property_id: '44444444-4444-4444-4444-444444444444', assigned_staff_id: 'a1', scheduled_at: new Date(Date.now() + 172800000).toISOString(), confirmed: true, outcome: 'considering', notes: 'Needs premium food', created_at: new Date().toISOString() }
];

const INITIAL_CONVERSATIONS = [
  { id: 'c1', lead_id: 'l1', agent_id: '11111111-1111-1111-1111-111111111111', message: 'Hello! I saw your PG listings in Koramangala. Are they available?', direction: 'inbound', channel: 'whatsapp', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'c2', lead_id: 'l1', agent_id: '11111111-1111-1111-1111-111111111111', message: 'Yes, they are! We have rooms available in FORUM PRO BOYS and FORUM 1 BOYS. What is your budget?', direction: 'outbound', channel: 'whatsapp', created_at: new Date(Date.now() - 3000000).toISOString() },
];

const INITIAL_USER_ROLES = [
  { user_id: 'admin-auth-uuid', role: 'admin' },
  { user_id: 'manager-auth-uuid', role: 'manager' },
  { user_id: 'agent-auth-uuid', role: 'agent' },
  { user_id: 'owner1-auth-uuid', role: 'owner' },
  { user_id: 'owner2-auth-uuid', role: 'owner' },
  { user_id: 'owner3-auth-uuid', role: 'owner' },
];

const INITIAL_TEMPLATES = [
  { id: 't1', name: 'Welcome Message', body: 'Hi {{name}}, welcome to PG Shaala! Thanks for reaching out. We have amazing PGs matching your budget in {{location}}.', channel: 'whatsapp' },
  { id: 't2', name: 'Schedule Visit', body: 'Hi {{name}}, would you like to schedule a visit to {{property}} tomorrow at 11 AM?', channel: 'whatsapp' },
  { id: 't3', name: 'Follow up', body: 'Hi {{name}}, just checking if you have finalized your accommodation or need more options?', channel: 'whatsapp' },
];

const INITIAL_NOTIFICATIONS = [
  { id: 'n1', user_id: 'admin-auth-uuid', type: 'warning', title: 'Stale Rooms Alert', body: 'Room 102 in FORUM PRO BOYS status has not been confirmed for 24h.', is_read: false, created_at: new Date().toISOString() },
  { id: 'n2', user_id: 'admin-auth-uuid', type: 'info', title: 'New Booking Request', body: 'Rahul Sharma requested a booking in FORUM PRO BOYS.', is_read: false, created_at: new Date().toISOString() },
];

const INITIAL_BOOKINGS = [
  { id: 'bk1', lead_id: 'l4', property_id: '55555555-5555-5555-5555-555555555555', room_id: 'r9', bed_id: 'b6', booking_status: 'confirmed', monthly_rent: 35000, security_deposit: 70000, move_in_date: '2026-03-10', payment_status: 'paid', notes: 'Premium client, booking confirmed.', booked_by: '11111111-1111-1111-1111-111111111111', created_at: new Date().toISOString() }
];

const INITIAL_ACTIVITY_LOG = [
  { id: 'act1', lead_id: 'l1', agent_id: '11111111-1111-1111-1111-111111111111', action: 'status_change', metadata: { from: 'new', to: 'contacted' }, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 'act2', lead_id: 'l3', agent_id: 'a1', action: 'visit_scheduled', metadata: { property_id: '33333333-3333-3333-3333-333333333333', scheduled_at: new Date().toISOString() }, created_at: new Date().toISOString() },
];

// Initialize Memory DB
class InMemoryDB {
  tables: Record<string, any[]> = {};

  constructor() {
    this.tables.properties = getLocalStorage('pgs_properties', INITIAL_PROPERTIES);
    this.tables.rooms = getLocalStorage('pgs_rooms', INITIAL_ROOMS);
    this.tables.beds = getLocalStorage('pgs_beds', INITIAL_BEDS);
    this.tables.agents = getLocalStorage('pgs_agents', INITIAL_AGENTS);
    this.tables.owners = getLocalStorage('pgs_owners', INITIAL_OWNERS);
    // Migrate old email domains
    this.tables.owners.forEach(o => {
      if (o.email && o.email.includes('@gharpayy.com')) {
        o.email = o.email.replace('@gharpayy.com', '@pgshaala.com');
      }
    });
    setLocalStorage('pgs_owners', this.tables.owners);

    this.tables.leads = getLocalStorage('pgs_leads', INITIAL_LEADS);
    this.tables.visits = getLocalStorage('pgs_visits', INITIAL_VISITS);
    this.tables.conversations = getLocalStorage('pgs_conversations', INITIAL_CONVERSATIONS);
    this.tables.user_roles = getLocalStorage('pgs_user_roles', INITIAL_USER_ROLES);
    this.tables.message_templates = getLocalStorage('pgs_templates', INITIAL_TEMPLATES);
    this.tables.notifications = getLocalStorage('pgs_notifications', INITIAL_NOTIFICATIONS);
    this.tables.bookings = getLocalStorage('pgs_bookings', INITIAL_BOOKINGS);
    this.tables.activity_log = getLocalStorage('pgs_activity_log', INITIAL_ACTIVITY_LOG);
    this.tables.soft_locks = getLocalStorage('pgs_soft_locks', []);
    this.tables.room_status_log = getLocalStorage('pgs_room_status_log', []);
    this.tables.profiles = getLocalStorage('pgs_profiles', []);
    this.tables.landmarks = [];
  }

  saveTable(tableName: string) {
    if (this.tables[tableName]) {
      setLocalStorage(`pgs_${tableName}`, this.tables[tableName]);
    }
  }

  saveAll() {
    Object.keys(this.tables).forEach(t => this.saveTable(t));
  }
}

export const db = new InMemoryDB();

// Mock Auth State
let currentSession: any = (() => {
  const session = getLocalStorage('pgs_session', null);
  return session;
})();

// Custom Mock Promise-Like Chain Builder
class MockQueryBuilder {
  tableName: string;
  filters: Array<(item: any) => boolean> = [];
  orderField: string | null = null;
  orderAscending = true;
  limitCount: number | null = null;
  joinTables: string[] = [];

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns: string = '*') {
    if (columns.includes('rooms')) this.joinTables.push('rooms');
    if (columns.includes('properties')) this.joinTables.push('properties');
    if (columns.includes('owners')) this.joinTables.push('owners');
    if (columns.includes('leads')) this.joinTables.push('leads');
    if (columns.includes('agents')) this.joinTables.push('agents');
    return this;
  }

  eq(field: string, value: any) {
    if (value !== undefined && value !== null) {
      this.filters.push((item) => item[field] === value);
    }
    return this;
  }

  neq(field: string, value: any) {
    if (value !== undefined && value !== null) {
      this.filters.push((item) => item[field] !== value);
    }
    return this;
  }

  gt(field: string, value: any) {
    if (value !== undefined && value !== null) {
      this.filters.push((item) => item[field] > value);
    }
    return this;
  }

  gte(field: string, value: any) {
    if (value !== undefined && value !== null) {
      this.filters.push((item) => item[field] >= value);
    }
    return this;
  }

  lt(field: string, value: any) {
    if (value !== undefined && value !== null) {
      this.filters.push((item) => item[field] < value);
    }
    return this;
  }

  lte(field: string, value: any) {
    if (value !== undefined && value !== null) {
      this.filters.push((item) => item[field] <= value);
    }
    return this;
  }

  ilike(field: string, pattern: string) {
    const cleanPattern = pattern.replace(/%/g, '').toLowerCase();
    this.filters.push((item) => item[field] && item[field].toString().toLowerCase().includes(cleanPattern));
    return this;
  }

  in(field: string, values: any[]) {
    if (values && values.length) {
      this.filters.push((item) => values.includes(item[field]));
    }
    return this;
  }

  order(field: string, options?: { ascending: boolean }) {
    this.orderField = field;
    this.orderAscending = options?.ascending !== false;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  range(from: number, to: number) {
    // Basic range simulation
    return this;
  }

  maybeSingle() {
    return this.then((res: any) => {
      return { data: res.data && res.data.length ? res.data[0] : null, error: null };
    });
  }

  single() {
    return this.then((res: any) => {
      if (!res.data || res.data.length === 0) {
        return { data: null, error: { message: "No rows found" } };
      }
      return { data: res.data[0], error: null };
    });
  }

  // Execute Select Query
  executeSelect() {
    const rawData = db.tables[this.tableName] || [];
    
    // Apply filters
    let filteredData = rawData.filter(item => {
      for (const filter of this.filters) {
        if (!filter(item)) return false;
      }
      return true;
    });

    // Apply Order
    if (this.orderField) {
      filteredData = [...filteredData].sort((a, b) => {
        const valA = a[this.orderField!];
        const valB = b[this.orderField!];
        if (valA < valB) return this.orderAscending ? -1 : 1;
        if (valA > valB) return this.orderAscending ? 1 : -1;
        return 0;
      });
    }

    // Apply Limit
    if (this.limitCount !== null) {
      filteredData = filteredData.slice(0, this.limitCount);
    }

    // Apply Joins
    const joinedData = filteredData.map(item => {
      const copy = { ...item };
      
      if (this.joinTables.includes('rooms') && this.tableName === 'properties') {
        copy.rooms = db.tables.rooms.filter(r => r.property_id === item.id);
      }
      if (this.joinTables.includes('properties') && this.tableName === 'rooms') {
        const prop = db.tables.properties.find(p => p.id === item.property_id);
        copy.properties = prop ? { ...prop, owners: db.tables.owners.find(o => o.id === prop.owner_id) } : null;
      }
      if (this.joinTables.includes('properties') && this.tableName === 'beds') {
        const room = db.tables.rooms.find(r => r.id === item.room_id);
        copy.rooms = room ? { ...room, properties: db.tables.properties.find(p => p.id === room.property_id) } : null;
      }
      if (this.joinTables.includes('owners') && this.tableName === 'properties') {
        copy.owners = db.tables.owners.find(o => o.id === item.owner_id) || null;
      }
      if (this.joinTables.includes('leads') && this.tableName === 'soft_locks') {
        copy.leads = db.tables.leads.find(l => l.id === item.lead_id) || null;
      }
      if (this.joinTables.includes('agents') && this.tableName === 'soft_locks') {
        copy.agents = db.tables.agents.find(a => a.id === item.locked_by) || null;
      }
      return copy;
    });

    return { data: JSON.parse(JSON.stringify(joinedData)), error: null, count: joinedData.length };
  }

  // Insert Action
  async insert(record: any) {
    const rawTable = db.tables[this.tableName];
    const recordsToInsert = Array.isArray(record) ? record : [record];
    const inserted: any[] = [];

    recordsToInsert.forEach(rec => {
      const newRec = {
        id: rec.id || uuidv4(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...rec
      };
      
      // Auto-trigger side effects like bed creation when room is created!
      if (this.tableName === 'rooms') {
        const bedCount = newRec.bed_count || 1;
        for (let i = 1; i <= bedCount; i++) {
          db.tables.beds.push({
            id: uuidv4(),
            room_id: newRec.id,
            bed_number: `B${i}`,
            status: 'vacant',
            current_tenant_name: null,
            current_rent: null,
            move_in_date: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
        db.saveTable('beds');
      }

      // Auto-trigger room status updates and confirmation dates when a confirmation log is created!
      if (this.tableName === 'room_status_log') {
        const room = db.tables.rooms.find(r => r.id === newRec.room_id);
        if (room) {
          room.status = newRec.status;
          room.last_confirmed_at = new Date().toISOString();
          db.saveTable('rooms');
        }
      }

      rawTable.push(newRec);
      inserted.push(newRec);
    });

    db.saveTable(this.tableName);
    
    // Simulate select returning the inserted row
    return {
      select: () => ({
        single: () => Promise.resolve({ data: inserted[0], error: null }),
        maybeSingle: () => Promise.resolve({ data: inserted[0], error: null }),
        then: (resolve: any) => resolve({ data: inserted, error: null })
      }),
      then: (resolve: any) => resolve({ data: inserted, error: null })
    };
  }

  // Update Action
  async update(updates: any) {
    const rawTable = db.tables[this.tableName];
    
    // Execute a select query to find matches
    const matches = rawTable.filter(item => {
      for (const filter of this.filters) {
        if (!filter(item)) return false;
      }
      return true;
    });

    matches.forEach(item => {
      Object.assign(item, updates, { updated_at: new Date().toISOString() });
      
      // Side effects like triggers
      if (this.tableName === 'visits' && updates.outcome === 'booked') {
        // Auto create booking
        db.tables.bookings.push({
          id: uuidv4(),
          lead_id: item.lead_id,
          property_id: item.property_id,
          room_id: item.room_id || null,
          bed_id: item.bed_id || null,
          booking_status: 'pending',
          booked_by: item.assigned_staff_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        db.saveTable('bookings');

        // Lock bed
        if (item.bed_id) {
          db.tables.soft_locks.push({
            id: uuidv4(),
            room_id: item.room_id,
            bed_id: item.bed_id,
            lead_id: item.lead_id,
            lock_type: 'pre_booking',
            locked_by: item.assigned_staff_id,
            locked_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 86400000).toISOString(),
            is_active: true,
            created_at: new Date().toISOString()
          });
          db.saveTable('soft_locks');
        }

        // Set lead status to booked
        const lead = db.tables.leads.find(l => l.id === item.lead_id);
        if (lead) {
          lead.status = 'booked';
          db.saveTable('leads');
        }
      }
      
      if (this.tableName === 'bookings' && updates.booking_status === 'confirmed') {
        if (item.bed_id) {
          const bed = db.tables.beds.find(b => b.id === item.bed_id);
          if (bed) {
            bed.status = 'booked';
            db.saveTable('beds');
          }
        }
      }
    });

    db.saveTable(this.tableName);

    return {
      select: () => ({
        single: () => Promise.resolve({ data: matches[0] || null, error: null }),
        then: (resolve: any) => resolve({ data: matches, error: null })
      }),
      then: (resolve: any) => resolve({ data: matches, error: null })
    };
  }

  // Delete Action
  async delete() {
    const rawTable = db.tables[this.tableName];
    
    const remaining = rawTable.filter(item => {
      for (const filter of this.filters) {
        if (!filter(item)) return false;
      }
      return true;
    });

    db.tables[this.tableName] = rawTable.filter(item => !remaining.includes(item));
    db.saveTable(this.tableName);

    return { data: remaining, error: null };
  }

  // Support for standard Promises/Async-Await
  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any): Promise<any> {
    const res = this.executeSelect();
    return Promise.resolve(res).then(onfulfilled, onrejected);
  }
}

// Active auth state change listeners
const authListeners = new Set<(event: string, session: any) => void>();

const notifyAuthListeners = (event: string, session: any) => {
  authListeners.forEach(callback => {
    try {
      callback(event, session);
    } catch (e) {
      console.error('Error triggering auth listener:', e);
    }
  });
};

// Full Exported Mock Supabase Client API
export const mockSupabase: any = {
  auth: {
    onAuthStateChange: (callback: any) => {
      authListeners.add(callback);
      // Trigger callback immediately with current mock session
      setTimeout(() => callback('SIGNED_IN', currentSession), 50);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authListeners.delete(callback);
            }
          }
        }
      };
    },
    getSession: async () => ({ data: { session: currentSession }, error: null }),
    getUser: async () => ({ data: { user: currentSession?.user || null }, error: null }),
    signInWithPassword: async ({ email, password }: any) => {
      let role = 'agent';
      let userId = 'agent-auth-uuid';
      let fullName = 'Demo Agent';

      if (email.includes('admin')) {
        role = 'admin';
        userId = 'admin-auth-uuid';
        fullName = 'Admin Manager';
      } else if (email.includes('manager')) {
        role = 'manager';
        userId = 'manager-auth-uuid';
        fullName = 'PG Manager';
      } else if (email.includes('owner')) {
        role = 'owner';
        if (email.includes('owner2')) {
          userId = 'owner2-auth-uuid';
          fullName = 'Suresh Kumar';
        } else if (email.includes('owner3')) {
          userId = 'owner3-auth-uuid';
          fullName = 'Priya Sharma';
        } else {
          userId = 'owner1-auth-uuid';
          fullName = 'Ramesh Reddy';
        }
      }

      currentSession = {
        access_token: 'mock-jwt-token',
        user: {
          id: userId,
          email: email,
          user_metadata: { full_name: fullName },
        }
      };

      // Add to user_roles
      const existingRole = db.tables.user_roles.find(r => r.user_id === userId);
      if (!existingRole) {
        db.tables.user_roles.push({ user_id: userId, role });
        db.saveTable('user_roles');
      }

      setLocalStorage('pgs_session', currentSession);
      notifyAuthListeners('SIGNED_IN', currentSession);

      return { data: currentSession, error: null };
    },
    signOut: async () => {
      currentSession = null;
      setLocalStorage('pgs_session', null);
      notifyAuthListeners('SIGNED_OUT', null);
      return { error: null };
    },
    signUp: async ({ email, password, options }: any) => {
      const newUserId = uuidv4();
      const name = options?.data?.full_name || 'New User';
      
      const newRole = { user_id: newUserId, role: 'agent' };
      db.tables.user_roles.push(newRole);
      db.saveTable('user_roles');

      return {
        data: {
          user: {
            id: newUserId,
            email,
            user_metadata: { full_name: name }
          }
        },
        error: null
      };
    },
    resetPasswordForEmail: async () => ({ error: null }),
    updateUser: async () => ({ error: null }),
  },
  from: (tableName: string) => {
    return new MockQueryBuilder(tableName);
  },
  channel: () => ({
    on: () => ({
      subscribe: () => ({ unsubscribe: () => {} }),
    }),
  }),
  removeChannel: () => {},
  removeAllChannels: () => {},
  rpc: (funcName: string, args: any) => {
    // Handle RPC functions
    if (funcName === 'get_property_effort') {
      const pId = args.p_property_id;
      const totalLeads = db.tables.leads.filter(l => l.property_id === pId).length;
      const totalVisits = db.tables.visits.filter(v => v.property_id === pId).length;
      const booked = db.tables.visits.filter(v => v.property_id === pId && v.outcome === 'booked').length;
      const considering = db.tables.visits.filter(v => v.property_id === pId && v.outcome === 'considering').length;
      
      return Promise.resolve({
        data: {
          total_leads: totalLeads,
          total_visits: totalVisits,
          completed_visits: booked + considering,
          booked: booked,
          considering: considering,
          not_interested: totalVisits - (booked + considering)
        },
        error: null
      });
    }
    return Promise.resolve({ data: null, error: null });
  },
  storage: {
    from: () => ({
      upload: async () => ({ data: { path: 'mock_path' }, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=1000' } }),
    }),
  },
};
