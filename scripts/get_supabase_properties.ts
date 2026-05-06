import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_PUBLISHABLE_KEY!);

async function getProperties() {
    const { data, error } = await supabase.from('properties').select('id, name');
    if (error) {
        console.error('Error fetching properties:', error);
        return;
    }
    console.log('Current Properties in Supabase:');
    console.log(JSON.stringify(data, null, 2));
}

getProperties();
