import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { PG_EXCEL_LOOKUP } from '../src/data/pgExcelData';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_PUBLISHABLE_KEY!);

async function updateDB() {
    let success = 0;
    let failed = 0;

    // Fetch all properties to get their exact names from DB
    const { data: props, error: fetchErr } = await supabase.from('properties').select('id, name');
    if (fetchErr) {
        console.error('Failed to fetch properties:', fetchErr);
        return;
    }

    console.log(`Found ${props.length} properties in DB.`);

    for (const prop of props) {
        const lowerName = prop.name.toLowerCase().trim();
        let match = PG_EXCEL_LOOKUP[lowerName];

        // fuzzy fallback if exact name doesn't match
        if (!match) {
            const fuzzyKey = Object.keys(PG_EXCEL_LOOKUP).find(k => k.includes(lowerName) || lowerName.includes(k));
            if (fuzzyKey) match = PG_EXCEL_LOOKUP[fuzzyKey];
        }

        if (match) {
            const mapLink = match.exactLocation || match.googleMapsUrl;
            const driveLink = match.driveLink;

            const updates: any = {};
            if (mapLink) updates.google_maps_link = mapLink;
            if (driveLink) updates.photos = [driveLink]; // arrays in json payload
            if (match.area) updates.area = match.area;

            if (Object.keys(updates).length > 0) {
                const { error: updErr } = await supabase.from('properties').update(updates).eq('id', prop.id);
                if (updErr) {
                    console.error(`Failed to update ${prop.name}:`, updErr.message);
                    failed++;
                } else {
                    console.log(`Updated ${prop.name}`);
                    success++;
                }
            }
        }
    }
    console.log(`Update complete. Success: ${success}, Failed: ${failed}`);
}

updateDB();
