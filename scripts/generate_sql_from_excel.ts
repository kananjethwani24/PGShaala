import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// Current properties in Supabase (to match against)
const supabaseProperties = [
  { "id": "22222222-2222-2222-2222-222222222222", "name": "FORUM PRO BOYS" },
  { "id": "33333333-3333-3333-3333-333333333333", "name": "FORUM 1 BOYS" },
  { "id": "44444444-4444-4444-4444-444444444444", "name": "GT GIRLS" },
  { "id": "55555555-5555-5555-5555-555555555555", "name": "ESPLANADE GIRLS" },
  { "id": "357a6c2f-3632-4a6e-9535-ea757f618634", "name": "GQ girl" },
  { "id": "a2c1e655-d27e-41a6-b1d7-0cb369c30345", "name": "homely GIRLS" },
  { "id": "1ef5dac0-7134-4022-b4f8-6afa746d7b4e", "name": "AFFO GIRLS NV" },
  { "id": "24346cda-5c11-4519-9cc6-1c1560fb7b90", "name": "homely BOYS" },
  { "id": "758cb7f9-a22c-41c8-91e0-f687c257439c", "name": "G Forum GIRLS" },
  { "id": "95a020e3-6c3d-4f3c-a1f4-8868c1a7eb2e", "name": "jack coed" },
  { "id": "6463d529-0a7a-4f2a-98a4-ffb6615c7221", "name": "WYSE GIRLS" },
  { "id": "d7a45eda-1b1f-4521-bcb7-d53c5b849761", "name": "XOLD FLATLIKE COED " },
  { "id": "9f49171c-3d4b-4893-924a-c8c8914b6638", "name": "John Boys" },
  { "id": "14ea6da2-9011-4c02-bf3b-2a60311ef4e7", "name": "JOY GIRLS " },
  { "id": "f7f3e0ef-e6ed-4524-9603-75f2f593951b", "name": "khb girls" }
];

const filePath = path.join(process.cwd(), 'FIND PG DATA GG.xlsx');
const fileBuffer = fs.readFileSync(filePath);
const workbook = XLSX.read(fileBuffer);

const sqlUpdates: string[] = [];

function extractUrl(text: any): string | null {
    if (!text || typeof text !== 'string') return null;
    const match = text.match(/https?:\/\/[^\s\]\n]+/);
    return match ? match[0].replace(/[\]\)]+$/, '') : null;
}

function normalizeName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

console.log('Processing sheets...');

workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const data: any[] = XLSX.utils.sheet_to_json(worksheet);

    data.forEach(row => {
        // Try to find a property name in common column headers
        const nameKey = Object.keys(row).find(k => normalizeName(k) === 'names' || normalizeName(k) === 'name');
        if (!nameKey) return;

        const rawName = row[nameKey];
        if (!rawName || typeof rawName !== 'string') return;

        const normalizedRawName = normalizeName(rawName);

        // Find match in Supabase properties
        const match = supabaseProperties.find(p => {
            const normalizedPName = normalizeName(p.name);
            return normalizedPName === normalizedRawName || 
                   normalizedPName.includes(normalizedRawName) || 
                   normalizedRawName.includes(normalizedPName);
        });

        if (match) {
            const foodKey = Object.keys(row).find(k => normalizeName(k) === 'food');
            const mapKey = Object.keys(row).find(k => normalizeName(k) === 'location' || normalizeName(k) === 'exactlocation');
            const driveKey = Object.keys(row).find(k => normalizeName(k) === 'drivelink' || normalizeName(k) === 'drivepics' || normalizeName(k) === 'pics');

            const foodDetails = row[foodKey!] || '';
            const mapLink = extractUrl(row[mapKey!]);
            const driveLink = extractUrl(row[driveKey!]);

            if (foodDetails || mapLink || driveLink) {
                let sql = `UPDATE public.properties SET `;
                const sets = [];
                if (foodDetails) sets.push(`food_details = '${String(foodDetails).replace(/'/g, "''")}'`);
                if (mapLink) sets.push(`google_maps_link = '${mapLink}'`);
                if (driveLink) sets.push(`virtual_tour_link = '${driveLink}'`);
                
                sql += sets.join(', ') + ` WHERE id = '${match.id}';`;
                sqlUpdates.push(sql);
                console.log(`Matched: "${rawName}" -> "${match.name}"`);
            }
        }
    });
});

const outputFilePath = path.join(process.cwd(), 'update_properties.sql');
fs.writeFileSync(outputFilePath, sqlUpdates.join('\n'));

console.log(`\nGenerated ${sqlUpdates.length} update statements in ${outputFilePath}`);
