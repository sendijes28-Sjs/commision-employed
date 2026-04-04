const fs = require('fs');
const path = './src/app/pages/PayoutHistoryPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add PageHeader import
if (!content.includes('import { PageHeader }')) {
  content = content.replace('import { toast } from "sonner";', 'import { toast } from "sonner";\nimport { PageHeader } from "../components/PageHeader";');
}

// Replace Page Header implementation
const headerRegex = /<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

const newHeader = `<PageHeader
        title="Payout History"
        subtitle="Track historical commission payments"
      />`;

content = content.replace(headerRegex, newHeader + "\n\n      ");


// Regex to clean up typography everywhere
content = content.replace(/ \bitalic\b/g, '');
content = content.replace(/ \btracking-widest\b/g, ' tracking-wide');
content = content.replace(/ \btracking-tighter\b/g, ' tracking-tight');
content = content.replace(/ \btext-\[7px\]\b/g, ' text-xs');
content = content.replace(/ \btext-\[8px\]\b/g, ' text-xs');
content = content.replace(/ \btext-\[9px\]\b/g, ' text-xs');
content = content.replace(/ \btext-\[10px\]\b/g, ' text-sm');
content = content.replace(/ \btext-\[11px\]\b/g, ' text-sm');

fs.writeFileSync(path, content, 'utf8');
console.log('PayoutHistoryPage.tsx updated successfully');
