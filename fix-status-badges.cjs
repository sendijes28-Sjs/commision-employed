const fs = require('fs');
const path = require('path');

const pages = [
  './src/app/pages/InvoiceListPage.tsx',
  './src/app/pages/InvoiceValidationPage.tsx',
  './src/app/pages/CommissionReportPage.tsx'
];

for (const file of pages) {
  let content = fs.readFileSync(file, 'utf8');

  // Insert import
  if (!content.includes('import { StatusBadge }')) {
    content = content.replace(/import \{ PageHeader \} from "\.\.\/components\/PageHeader";/g, 'import { PageHeader } from "../components/PageHeader";\nimport { StatusBadge } from "../components/StatusBadge";');
  }

  // Remove getStatusStyle block
  content = content.replace(/  const getStatusStyle = \(status: string\) => {[\s\S]*?};\n/g, '');

  // Replace span with StatusBadge in InvoiceListPage
  content = content.replace(/<span className=\{`text-xs font-medium px-2\.5 py-1 rounded-md border \$\{getStatusStyle\(([^)]+)\)\}`\}>\s*\{([^}]+)\}\s*<\/span>/g, '<StatusBadge status={$1} />');
  
  // DashboardPage might have another format, we'll check it later.

  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated ' + file);
}
