import Database from 'better-sqlite3';
const db = new Database('database.sqlite');

const items = db.prepare('SELECT id, product_name FROM invoice_items WHERE bottom_price = 0 OR bottom_price IS NULL').all();
const products = db.prepare('SELECT name, bottom_price FROM products').all();

console.log(`Found ${items.length} items to check.`);
console.log(`Product catalog size: ${products.length}`);

let updated = 0;

for (const item of items) {
    const cleanItemName = item.product_name.toLowerCase().trim();
    
    // Find best match in products
    let bestMatch = null;
    let maxSimilarity = 0;

    for (const prod of products) {
        const cleanProdName = prod.name.toLowerCase().trim();
        
        if (cleanItemName === cleanProdName) {
            bestMatch = prod;
            break;
        }

        if (cleanItemName.includes(cleanProdName) || cleanProdName.includes(cleanItemName)) {
            bestMatch = prod;
            // Continue to see if there is an exact match
        }
    }

    if (bestMatch && bestMatch.bottom_price > 0) {
        db.prepare('UPDATE invoice_items SET bottom_price = ? WHERE id = ?').run(bestMatch.bottom_price, item.id);
        updated++;
        console.log(`Updated [${item.product_name}] -> ${bestMatch.bottom_price}`);
    } else {
        console.log(`No match for [${item.product_name}]`);
    }
}

console.log(`Finished. Updated ${updated} items.`);
