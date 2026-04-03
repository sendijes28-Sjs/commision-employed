const fs = require('fs');

const pages = [
  './src/app/pages/InvoiceListPage.tsx',
  './src/app/pages/InvoiceValidationPage.tsx',
  './src/app/pages/CommissionReportPage.tsx',
  './src/app/pages/InvoiceDetailPage.tsx',
  './src/app/pages/CreateInvoicePage.tsx'
];

for (const path of pages) {
  try {
    let content = fs.readFileSync(path, 'utf8');

    // Add PageHeader import safely
    if (!content.includes('import { PageHeader }')) {
      content = content.replace(/import \{.*\} from ("|')react("|');/, (match) => match + '\nimport { PageHeader } from "../components/PageHeader";');
    }

    content = content.replace(/ \bitalic\b/g, '');
    content = content.replace(/ \btracking-widest\b/g, ' tracking-wide');
    content = content.replace(/ \btracking-tighter\b/g, ' tracking-tight');
    content = content.replace(/ \btext-\[7px\]\b/g, ' text-xs');
    content = content.replace(/ \btext-\[8px\]\b/g, ' text-xs');
    content = content.replace(/ \btext-\[9px\]\b/g, ' text-xs');
    content = content.replace(/ \btext-\[10px\]\b/g, ' text-sm');
    content = content.replace(/ \btext-\[11px\]\b/g, ' text-sm');

    fs.writeFileSync(path, content, 'utf8');
    console.log(`${path} updated successfully`);
  } catch (e) {
    console.log(`Failed to update ${path}: ${e.message}`);
  }
}
