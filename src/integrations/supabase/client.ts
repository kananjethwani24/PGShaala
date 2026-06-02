import { mockSupabase } from './mockDb';

// Replaced unreachable Supabase client with high-fidelity client-side Mock Database
export const supabase = mockSupabase;