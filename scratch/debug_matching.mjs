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

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function debug() {
  // Check a sample of leads and their interests
  const { data: leads } = await supabase
    .from('leads')
    .select('id, name, preferred_location, budget, interests, status')
    .neq('status', 'booked')
    .neq('status', 'lost')
    .limit(5);
  
  console.log('\n=== SAMPLE LEADS ===');
  leads?.forEach(l => {
    console.log(`${l.name}: location="${l.preferred_location}", budget="${l.budget}", interests=${JSON.stringify(l.interests)}`);
  });

  // Check properties and their interests
  const { data: props } = await supabase
    .from('properties')
    .select('id, name, area, city, interests, is_active')
    .limit(10);
  
  console.log('\n=== SAMPLE PROPERTIES & INTERESTS ===');
  props?.forEach(p => {
    console.log(`${p.name}: area="${p.area}", city="${p.city}", interests=${JSON.stringify(p.interests)}`);
  });

  // Check beds and rent
  const { data: beds } = await supabase
    .from('beds')
    .select('id, status, room_id, rooms(room_number, auto_locked, rent_per_bed, room_type)')
    .in('status', ['vacant', 'vacating_soon'])
    .limit(10);

  console.log('\n=== SAMPLE VACANT BEDS ===');
  beds?.forEach(b => {
    console.log(`Bed ${b.id.substring(0,8)}: status=${b.status}, rent=${b.rooms?.rent_per_bed}, auto_locked=${b.rooms?.auto_locked}`);
  });
}

debug().catch(console.error);
