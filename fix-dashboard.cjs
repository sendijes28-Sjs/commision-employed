const fs = require('fs');
const path = './src/app/pages/DashboardPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// The Quick Action Card is usually named something like "Quick Actions" or similar.
// Let's remove the whole `<div className="lg:col-span-1 space-y-6">` or wherever that card is.
// I will just use regex to clean typography for now.
content = content.replace(/ \bitalic\b/g, '');
content = content.replace(/ \btracking-widest\b/g, ' tracking-wide');
content = content.replace(/ \btracking-tighter\b/g, ' tracking-tight');
content = content.replace(/ \btext-\[7px\]\b/g, ' text-xs');
content = content.replace(/ \btext-\[8px\]\b/g, ' text-xs');
content = content.replace(/ \btext-\[9px\]\b/g, ' text-xs');
content = content.replace(/ \btext-\[10px\]\b/g, ' text-sm');
content = content.replace(/ \btext-\[11px\]\b/g, ' text-sm');

// Look for the "Quick Actions" card and remove it
const quickActionRegex = /<div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">[\s\S]*?<h3 className="text-sm font-semibold text-slate-900 mb-4">Quick Actions<\/h3>[\s\S]*?<\/div>\s*<\/div>/;

if (quickActionRegex.test(content)) {
  content = content.replace(quickActionRegex, '');
}

// Write it back
fs.writeFileSync(path, content, 'utf8');
console.log('DashboardPage.tsx updated successfully');
