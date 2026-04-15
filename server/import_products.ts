import db from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importProducts() {
    const csvPath = path.resolve(__dirname, '../HARGA USER NEW - PRICE LIST.csv');
    console.log(`Reading from: ${csvPath}`);

    if (!fs.existsSync(csvPath)) {
        console.error("Price list CSV not found!");
        process.exit(1);
    }

    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n');
    
    console.log(`Found ${lines.length} lines in CSV.`);

    let importedCount = 0;
    const productsToInsert: any[] = [];

    // Skip initial empty rows or generic headers
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith(',,,') || line.includes('KODE BARANG')) continue;

        // Price list format: ,SKU,Name,Price
        const cells = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        
        if (cells.length < 3) continue;

        const sku = cells[1]?.trim().replace(/^"|"$/g, '') || "";
        const name = cells[2]?.trim().replace(/^"|"$/g, '') || "";
        const priceStr = cells[3]?.trim().replace(/^"|"$/g, '') || "0";
        
        // Clean price (Indonesian format: dots/commas are thousands)
        const segments = priceStr.replace(/[^0-9.,]/g, '').split(/[.,]/);
        let price = 0;
        if (segments.length === 1) {
            price = parseInt(segments[0], 10) || 0;
        } else {
            const last = segments[segments.length - 1];
            if (last.length <= 2) {
                // Ignore decimals
                price = parseInt(segments.slice(0, -1).join(''), 10) || 0;
            } else {
                // All parts are thousands
                price = parseInt(segments.join(''), 10) || 0;
            }
        }

        if (name && price > 0) {
            productsToInsert.push({ sku, name: name.toUpperCase(), bottom_price: price });
            importedCount++;
        }
    }

    try {
        await db.transaction(async (trx) => {
            console.log('Cleaning products table...');
            await trx('products').del();
            console.log(`Inserting ${productsToInsert.length} products...`);
            
            // Batch insert for performance
            const chunkSize = 100;
            for (let i = 0; i < productsToInsert.length; i += chunkSize) {
                const chunk = productsToInsert.slice(i, i + chunkSize);
                await trx('products').insert(chunk);
            }
        });
        console.log(`Successfully imported ${importedCount} products into database.`);
    } catch (err) {
        console.error("Database transaction failed:", err);
        throw err;
    }
}

importProducts()
    .then(() => process.exit(0))
    .catch(err => {
        console.error("Import failed:", err);
        process.exit(1);
    });
