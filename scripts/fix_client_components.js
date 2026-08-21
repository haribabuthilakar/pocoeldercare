const fs = require('fs');

const files = [
  'apps/family-portal/src/components/vitals/health-summary-badge.tsx',
  'apps/family-portal/src/components/care-officer/named-care-officer-card.tsx',
  'apps/family-portal/src/components/calendar/appointment-card.tsx',
  'apps/family-portal/src/components/services/quota-pricing-badge.tsx',
  'apps/family-portal/src/components/wallet/transaction-ledger.tsx',
  'apps/family-portal/src/components/digest/monthly-value-digest.tsx'
];


forEachFile:
for (const f of files) {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    if (!content.startsWith("'use client';")) {
      content = "'use client';\n\n" + content;
      fs.writeFileSync(f, content, 'utf8');
      console.log('Added use client to:', f);
    }
  }
}
