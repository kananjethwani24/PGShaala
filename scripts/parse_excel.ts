import * as xlsx from 'xlsx';
import * as fs from 'fs';

const buf = fs.readFileSync('FIND PG DATA GG.xlsx');
const workbook = xlsx.read(buf, { type: 'buffer' });
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data: any[] = xlsx.utils.sheet_to_json(sheet);

// Filter rows that have a NAMES field
const pgs = data.filter(row => row['NAMES'] && typeof row['NAMES'] === 'string');

// Extract Maps link from location text
function extractMapsLink(location: string): string | null {
    if (!location) return null;
    const match = location.match(/https:\/\/maps\.app\.goo\.gl\/[\w-]+/);
    return match ? match[0] : null;
}

// Build lookup by PG name (case-insensitive normalised)
const lookup: Record<string, { exactLocation: string | null; driveLink: string | null; googleMapsUrl: string | null; exactName: string | null; area: string }> = {};
const areaCount: Record<string, number> = {};

for (const row of pgs) {
    const name = row['NAMES'].trim();
    const exactLocation: string | null = row['exact location'] || extractMapsLink(row['LOCATION'] || '');
    const driveLink: string | null = row['Drive Link'] || null;
    const googleMapsUrl: string | null = row['url'] || null;
    const exactName: string | null = row['exact name'] || null;
    const rawArea: string = (row['AREA'] || '').trim().split('\n')[0].trim();

    // Normalize area name
    const areaNorm = rawArea.toLowerCase();
    let area = rawArea;
    if (areaNorm.includes('koramangla') || areaNorm.includes('kormangala') || areaNorm === 'sg palya') area = 'Koramangala';
    else if (areaNorm.includes('btm')) area = 'BTM Layout';
    else if (areaNorm.includes('bellandur')) area = 'Bellandur';
    else if (areaNorm.includes('whitefield') || areaNorm.includes('whitfield')) area = 'Whitefield';
    else if (areaNorm.includes('brookf') || areaNorm.includes('brookefi')) area = 'Brookefield';
    else if (areaNorm.includes('marathahalli')) area = 'Marathahalli';
    else if (areaNorm.includes('ypr') || areaNorm.includes('yeshwanth')) area = 'Yeshwanthpur';
    else if (areaNorm.includes('nagawara') || areaNorm.includes('manyata') || areaNorm.includes('hebbal')) area = 'Nagawara/Manyata';
    else if (areaNorm.includes('bgm') || areaNorm.includes('madadev') || areaNorm.includes('bagmane') || areaNorm.includes('mahadev')) area = 'Mahadevapura';
    else if (areaNorm.includes('hsr') || areaNorm.includes('silk board')) area = 'HSR Layout';
    else if (areaNorm.includes('e city') || areaNorm.includes('electronic')) area = 'Electronic City';
    else if (areaNorm.includes('domlur')) area = 'Domlur';
    else if (areaNorm.includes('sarjapur')) area = 'Sarjapur';
    else if (areaNorm.includes('spice garden')) area = 'Spice Garden';
    else if (areaNorm.includes('vasanth nagar') || areaNorm.includes('mcc')) area = 'Vasanthnagar';

    areaCount[area] = (areaCount[area] || 0) + 1;

    lookup[name.toLowerCase()] = { exactLocation, driveLink, googleMapsUrl, exactName, area };
}

// Sort areas by count descending
const sortedAreas = Object.entries(areaCount)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

const output = {
    lookup,
    areas: sortedAreas,
};

const tsContent = `// Auto-generated from FIND PG DATA GG.xlsx — do NOT edit manually
// Run: npx tsx scripts/parse_excel.ts to regenerate

export interface PGExcelData {
  exactLocation: string | null;
  driveLink: string | null;
  googleMapsUrl: string | null;
  exactName: string | null;
  area: string;
}

export const PG_EXCEL_LOOKUP: Record<string, PGExcelData> = ${JSON.stringify(lookup, null, 2)};

export const PG_AREAS_FROM_EXCEL: { name: string; count: number }[] = ${JSON.stringify(sortedAreas, null, 2)};
`;

fs.writeFileSync('src/data/pgExcelData.ts', tsContent);
console.log('Written src/data/pgExcelData.ts');
console.log('Areas:', JSON.stringify(sortedAreas, null, 2));
console.log('Total PGs indexed:', Object.keys(lookup).length);
