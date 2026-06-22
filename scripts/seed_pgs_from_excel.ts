/**
 * seed_pgs_from_excel.ts
 * ----------------------
 * Reads excel_pgs.json (already parsed from FIND PG DATA GG.xlsx)
 * and upserts every PG into Supabase via the REST API.
 *
 * Usage:
 *   npx tsx scripts/seed_pgs_from_excel.ts
 *
 * Required env (in .env):
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_KEY   ← Supabase Dashboard → Project Settings → API → service_role key
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// ── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!SUPABASE_URL) {
    console.error('❌  Missing VITE_SUPABASE_URL in .env');
    process.exit(1);
}

// ── Supabase client (service role skips RLS) ──────────────────────────────────
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
});

// ── Area normalisation (same logic as parse_excel.ts) ─────────────────────────
function normaliseArea(raw: string): string {
    const n = (raw || '').toLowerCase().split('\n')[0].trim();
    if (n.includes('koramangla') || n.includes('kormangala') || n.includes('sg palya') || n.includes('taverekere') || n.includes('tavrekere')) return 'Koramangala';
    if (n.includes('btm')) return 'BTM Layout';
    if (n.includes('bellandur')) return 'Bellandur';
    if (n.includes('whitefield') || n.includes('whitfield') || n.includes('kadugodi') || n.includes('itpl')) return 'Whitefield';
    if (n.includes('brookf') || n.includes('brookefi')) return 'Brookefield';
    if (n.includes('marathahalli')) return 'Marathahalli';
    if (n.includes('ypr') || n.includes('yeshwanth') || n.includes('ypr campus')) return 'Yeshwanthpur';
    if (n.includes('nagawara') || n.includes('manyata') || n.includes('hebbal')) return 'Nagawara/Manyata';
    if (n.includes('bgm') || n.includes('madadev') || n.includes('bagmane') || n.includes('mahadev')) return 'Mahadevapura';
    if (n.includes('hsr') || n.includes('silk board')) return 'HSR Layout';
    if (n.includes('e city') || n.includes('electronic')) return 'Electronic City';
    if (n.includes('domlur')) return 'Domlur';
    if (n.includes('sarjapur')) return 'Sarjapur';
    if (n.includes('spice garden')) return 'Spice Garden';
    if (n.includes('vasanth nagar') || n.includes('mcc')) return 'Vasanthnagar';
    if (n.includes('kadubes') || n.includes('kadubeshan')) return 'Kadubeesanahalli';
    return raw.split('\n')[0].trim() || 'Bangalore';
}

// ── Extract first URL from a string ──────────────────────────────────────────
function extractUrl(text: string | undefined | null): string | null {
    if (!text) return null;
    const m = text.match(/https?:\/\/[^\s\]"]+/);
    return m ? m[0].replace(/[\])"']+$/, '') : null;
}

// ── Determine gender from PG name ────────────────────────────────────────────
function inferGender(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('girls') || n.includes('ladies') || n.includes('girl')) return 'female';
    if (n.includes('boys') || n.includes('gents')) return 'male';
    return 'coed';
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    const jsonPath = path.resolve('excel_pgs.json');
    if (!fs.existsSync(jsonPath)) {
        console.error('❌  excel_pgs.json not found. Run scripts/parse_excel.ts first.');
        process.exit(1);
    }

    const pgs: any[] = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`📋  Loaded ${pgs.length} PGs from excel_pgs.json\n`);

    // Fetch existing property names from Supabase
    const { data: existing, error: fetchErr } = await supabase
        .from('properties')
        .select('id, name');

    if (fetchErr) {
        console.error('❌  Could not fetch existing properties:', fetchErr.message);
        console.error('    Make sure SUPABASE_SERVICE_KEY is set in .env (or the anon key has read access).');
        process.exit(1);
    }

    const existingMap = new Map<string, string>(); // normalised name -> id
    (existing || []).forEach(p => existingMap.set(p.name.toLowerCase().trim(), p.id));
    console.log(`🗄️   Found ${existingMap.size} properties already in Supabase\n`);

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const pg of pgs) {
        const rawName: string = (pg.name || '').trim();
        if (!rawName) { skipped++; continue; }

        const area = normaliseArea(pg.area || pg.zone || '');
        const locality = pg.locality || pg.zone || area;
        const exactLocation = pg.exactLocation || null;
        const driveLink = pg.driveLink || null;
        const googleMapsUrl = pg.googleMapsUrl || extractUrl(pg.location) || null;
        const exactName = pg.exactName || null;
        const gender = inferGender(rawName);

        const property: Record<string, any> = {
            name: rawName,
            area: area,
            locality: locality.substring(0, 200),
            exact_name: exactName,
            google_maps_link: exactLocation || googleMapsUrl,
            virtual_tour_link: driveLink,
            gender_type: gender,
            is_active: true,
        };

        const key = rawName.toLowerCase().trim();

        if (existingMap.has(key)) {
            // UPDATE existing
            const id = existingMap.get(key)!;
            const { error } = await supabase
                .from('properties')
                .update(property)
                .eq('id', id);

            if (error) {
                console.error(`❌  Update failed for "${rawName}": ${error.message}`);
                failed++;
            } else {
                console.log(`✏️   Updated: ${rawName}`);
                updated++;
            }
        } else {
            // INSERT new
            const { data: inserted_row, error } = await supabase
                .from('properties')
                .insert({ ...property })
                .select('id')
                .single();

            if (error) {
                // Try fallback: maybe it was inserted by a concurrent run / name mismatch
                if (error.code === '23505') {
                    console.warn(`⚠️   Duplicate (skipping): ${rawName}`);
                    skipped++;
                } else {
                    console.error(`❌  Insert failed for "${rawName}": ${error.message} (code: ${error.code})`);
                    failed++;
                }
            } else {
                console.log(`✅  Inserted: ${rawName}`);

                // Create 2 default rooms for each new property
                if (inserted_row?.id) {
                    const rooms = [1, 2].map((i) => ({
                        property_id: inserted_row.id,
                        room_number: `10${i}`,
                        status: 'available',
                        bed_count: 3,
                    }));
                    const { error: roomErr } = await supabase.from('rooms').insert(rooms);
                    if (roomErr) {
                        console.warn(`   ⚠️  Room creation failed for ${rawName}: ${roomErr.message}`);
                    }
                }
                inserted++;
            }
        }
    }

    console.log('\n─────────────────────────────────────────');
    console.log(`✅  Inserted : ${inserted}`);
    console.log(`✏️   Updated  : ${updated}`);
    console.log(`⏭️   Skipped  : ${skipped}`);
    console.log(`❌  Failed   : ${failed}`);
    console.log('─────────────────────────────────────────');
}

main().catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
});
