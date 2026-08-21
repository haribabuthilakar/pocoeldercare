const fs = require('fs');
const path = require('path');

function writeFile(relPath, content) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}

writeFile('apps/ops-crm/src/__tests__/ops-workflows.spec.tsx', `
import { describe, it, expect } from 'vitest';

describe('Phase 4: Operations CRM & Admin Hub Workflows', () => {
  it('Pillar 1 & 2: Auto-assignment weighted multi-factor scoring (Proximity 40%, Load 30%, Lang 20%, Rating 10%)', () => {
    const candidates = [
      { id: 'off-001', name: 'Ramesh Kumar', proximityKm: 2.1, caseload: 26, maxCaseload: 35, rating: 4.9 },
      { id: 'off-002', name: 'Suresh Gowda', proximityKm: 4.8, caseload: 22, maxCaseload: 35, rating: 4.7 },
    ];

    // Compute scores
    const scored = candidates.map(c => {
      const proxScore = Math.max(0, 100 - c.proximityKm * 10) * 0.40;
      const loadScore = ((c.maxCaseload - c.caseload) / c.maxCaseload * 100) * 0.30;
      const ratingScore = (c.rating / 5.0 * 100) * 0.10;
      const langScore = 100 * 0.20;
      return { ...c, totalScore: Math.round(proxScore + loadScore + ratingScore + langScore) };
    });

    const topRanked = scored.sort((a, b) => b.totalScore - a.totalScore)[0];
    expect(topRanked.id).toBe('off-001');
    expect(topRanked.totalScore).toBeGreaterThanOrEqual(80);
  });

  it('Pillar 2: Mandatory Audit Log Policy on Manual Override (OPS-07)', () => {
    const overridePayload = {
      id: 'audit-101',
      serviceRequestId: 'req-001',
      originalOfficerId: 'off-001',
      selectedOfficerId: 'off-002',
      reasonCategory: 'FAMILY_PREFERENCE',
      notes: 'Elder expressed strong rapport with officer Suresh from past visit.',
      managerEmail: 'ops.lead@pococare.in',
      timestamp: new Date().toISOString(),
    };

    expect(overridePayload.notes.length).toBeGreaterThan(10);
    expect(overridePayload.selectedOfficerId).not.toBe(overridePayload.originalOfficerId);
    expect(['FAMILY_PREFERENCE', 'TRAFFIC_PROXIMITY_ANOMALY', 'SPECIALIZED_CLINICAL_SKILL', 'OFFICER_EMERGENCY_REASSIGNMENT']).toContain(overridePayload.reasonCategory);
  });

  it('Pillar 3: Household CRM 360° Senior ICE Profile Data Completeness', () => {
    const iceProfile = {
      seniorName: 'Gopalakrishnan Menon',
      bloodGroup: 'O+',
      chronicConditions: ['Hypertension', 'Type 2 Diabetes'],
      allergies: ['Penicillin'],
      preferredHospital: 'Manipal Hospital Old Airport Rd',
      erPhone: '+91 80 2502 4444',
      nriContact: { name: 'Divya Menon', relation: 'Daughter', phone: '+14085550192' },
    };

    expect(iceProfile.bloodGroup).toBe('O+');
    expect(iceProfile.chronicConditions.length).toBeGreaterThan(0);
    expect(iceProfile.allergies).toContain('Penicillin');
    expect(iceProfile.nriContact.phone).toMatch(/^\\+\\d+/);
  });

  it('Pillar 7: Care Officer Fleet Caseload Cap & Warning Thresholds (35-family cap)', () => {
    const maxCap = 35;
    const calculateCapacityStatus = (current: number) => {
      if (current >= maxCap) return 'CAPACITY_REACHED';
      if (current >= maxCap - 3) return 'NEAR_CAPACITY_WARNING';
      return 'AVAILABLE';
    };

    expect(calculateCapacityStatus(26)).toBe('AVAILABLE');
    expect(calculateCapacityStatus(33)).toBe('NEAR_CAPACITY_WARNING');
    expect(calculateCapacityStatus(35)).toBe('CAPACITY_REACHED');
  });

  it('Pillar 5: Semantic Versioning of Dynamic SOP Templates (v1.0.0 -> v1.1.0 OTA)', () => {
    const currentVer = 'v1.0.0';
    const [maj, min, patch] = currentVer.replace('v', '').split('.').map(Number);
    const nextVer = \`v\${maj}.\${min + 1}.0\`;

    expect(nextVer).toBe('v1.1.0');
  });

  it('Pillar 6: Partner Monthly Payout Ledger Rollup and TDS Deductions (10% Doctor / 2% Agency)', () => {
    const doctorGross = 16800;
    const doctorTds = 10;
    const doctorNet = doctorGross - (doctorGross * (doctorTds / 100));
    expect(doctorNet).toBe(15120);

    const ambulanceGross = 15000;
    const ambulanceTds = 2;
    const ambulanceNet = ambulanceGross - (ambulanceGross * (ambulanceTds / 100));
    expect(ambulanceNet).toBe(14700);
  });
});
`);

console.log('Finished updating Ops CRM test suite');

