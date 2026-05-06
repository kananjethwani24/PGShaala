import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'FIND PG DATA GG.xlsx');
const fileBuffer = fs.readFileSync(filePath);
const workbook = XLSX.read(fileBuffer);

console.log('Sheet Names:', workbook.SheetNames);

workbook.SheetNames.forEach(name => {
    console.log(`\n--- Sheet: ${name} ---`);
    const worksheet = workbook.Sheets[name];
    const data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Read as array of arrays to see raw structure
    if (data.length > 0) {
        console.log('Header Row (Array of Arrays):', data[0]);
        if (data.length > 1) {
            console.log('Sample Row 1:', data[1]);
        }
    }
});
