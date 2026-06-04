import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length) {
    env[key.trim()] = values.join('=').trim().replace(/(^"|"$)/g, '');
  }
});

const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function countPGs() {
  const { count: pgCount } = await supabase.from('properties').select('*', { count: 'exact', head: true }).eq('is_active', true);
  const { count: roomCount } = await supabase.from('rooms').select('*', { count: 'exact', head: true }).eq('auto_locked', false);
  const { count: bedCount } = await supabase.from('beds').select('*', { count: 'exact', head: true }).in('status', ['vacant', 'vacating_soon']);

  console.log(`Active PGs: ${pgCount}`);
  console.log(`Unlocked Rooms: ${roomCount}`);
  console.log(`Vacant/Vacating Beds: ${bedCount}`);
  
  // Test the RPC directly
  const { data: matchData, error } = await supabase.rpc('match_beds_for_lead', {
    p_location: '',
    p_budget: 0,
    p_room_type: null,
    p_interests: []
  });
  console.log('RPC Test Match Count:', matchData?.length || 0);
  if (error) console.error('RPC Error:', error);
}

countPGs();
