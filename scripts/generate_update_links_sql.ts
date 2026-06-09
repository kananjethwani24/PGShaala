import * as fs from 'fs';
import { PG_EXCEL_LOOKUP } from '../src/data/pgExcelData';

const sqlUpdates: string[] = [];

for (const [name, data] of Object.entries(PG_EXCEL_LOOKUP)) {
    const mapLink = data.exactLocation || data.googleMapsUrl;
    const driveLink = data.driveLink;

    if (!mapLink && !driveLink) continue;

    const sets = [];
    if (mapLink) sets.push(`google_maps_link = '${mapLink.replace(/'/g, "''")}'`);
    if (driveLink) sets.push(`photos = ARRAY['${driveLink.replace(/'/g, "''")}']`);

    sets.push(`area = '${data.area.replace(/'/g, "''")}'`); // Also update area since the prompt asks for "locations as per given in excel sheer"

    // Using ILIKE or lower(name)
    sqlUpdates.push(`UPDATE public.properties SET ${sets.join(', ')} WHERE lower(name) = '${name.toLowerCase().replace(/'/g, "''")}';`);
}

const output = '-- Auto-generated script to update properties from Excel data\n' + sqlUpdates.join('\n');
fs.writeFileSync('update_locations_and_images.sql', output);
console.log(`Generated ${sqlUpdates.length} update statements in update_locations_and_images.sql`);
