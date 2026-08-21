import { PrismaClient, RoleType, PlanTierName, ServiceCategoryName, AbhaSyncStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SERVICES_DATA = [
  // A. EMERGENCY RESPONSE (1-12)
  { num: 1, code: 'EMG-01', name: '24x7 emergency helpline, one number', cat: ServiceCategoryName.A_EMERGENCY, price: 0, sla: 1, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },
  { num: 2, code: 'EMG-02', name: 'Emergency medical profile (ICE)', cat: ServiceCategoryName.A_EMERGENCY, price: 0, sla: 1, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },
  { num: 3, code: 'EMG-03', name: 'Ambulance dispatch & coordination', cat: ServiceCategoryName.A_EMERGENCY, price: 0, sla: 15, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },
  { num: 4, code: 'EMG-04', name: 'BLS ambulance evacuation - included', cat: ServiceCategoryName.A_EMERGENCY, price: 250000, sla: 30, payPerUse: false, kavach: 0, sahara: 1, sampoorna: 3, nivas: 6, unl: false },
  { num: 5, code: 'EMG-05', name: 'Ambulance beyond included quota', cat: ServiceCategoryName.A_EMERGENCY, price: 250000, sla: 30, payPerUse: true, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: false },
  { num: 6, code: 'EMG-06', name: 'Physical presence at the hospital', cat: ServiceCategoryName.A_EMERGENCY, price: 350000, sla: 45, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },
  { num: 7, code: 'EMG-07', name: 'Admission paperwork, pre-auth, billing', cat: ServiceCategoryName.A_EMERGENCY, price: 350000, sla: 60, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },
  { num: 8, code: 'EMG-08', name: 'Discharge & step-down plan', cat: ServiceCategoryName.A_EMERGENCY, price: 250000, sla: 120, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },
  { num: 9, code: 'EMG-09', name: 'Family escalation, time-zone aware', cat: ServiceCategoryName.A_EMERGENCY, price: 0, sla: 5, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },
  { num: 10, code: 'EMG-10', name: 'Published response-time SLA', cat: ServiceCategoryName.A_EMERGENCY, price: 0, sla: 1, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },
  { num: 11, code: 'EMG-11', name: 'Pre-mapped hospital network & tie-ups', cat: ServiceCategoryName.A_EMERGENCY, price: 0, sla: 1, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },
  { num: 12, code: 'EMG-12', name: 'Annual emergency drill / mock response', cat: ServiceCategoryName.A_EMERGENCY, price: 150000, sla: 1440, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 1, nivas: 2, unl: false },

  // B. PRIMARY & CONTINUING CARE (13-23)
  { num: 13, code: 'MED-01', name: 'GP teleconsult', cat: ServiceCategoryName.B_PRIMARY_CARE, price: 35000, sla: 60, payPerUse: false, kavach: 1, sahara: 4, sampoorna: 12, nivas: 12, unl: false },
  { num: 14, code: 'MED-02', name: 'Specialist teleconsult', cat: ServiceCategoryName.B_PRIMARY_CARE, price: 70000, sla: 120, payPerUse: false, kavach: 0, sahara: 1, sampoorna: 4, nivas: 6, unl: false },
  { num: 15, code: 'MED-03', name: 'Doctor home visit', cat: ServiceCategoryName.B_PRIMARY_CARE, price: 150000, sla: 240, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 2, nivas: 4, unl: false },
  { num: 16, code: 'MED-04', name: 'Nurse home visit (vitals, dressing, injection)', cat: ServiceCategoryName.B_PRIMARY_CARE, price: 90000, sla: 120, payPerUse: false, kavach: 0, sahara: 2, sampoorna: 12, nivas: 24, unl: false },
  { num: 17, code: 'MED-05', name: 'Care officer home visit', cat: ServiceCategoryName.B_PRIMARY_CARE, price: 120000, sla: 1440, payPerUse: false, kavach: 0, sahara: 12, sampoorna: 24, nivas: 52, unl: false },
  { num: 18, code: 'MED-06', name: 'Named panel physician', cat: ServiceCategoryName.B_PRIMARY_CARE, price: 0, sla: 1, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },
  { num: 19, code: 'MED-07', name: 'Comprehensive geriatric assessment', cat: ServiceCategoryName.B_PRIMARY_CARE, price: 450000, sla: 1440, payPerUse: false, kavach: 0, sahara: 1, sampoorna: 1, nivas: 2, unl: false },
  { num: 20, code: 'MED-08', name: 'IHI 4Ms review (What Matters, Meds, Mentation, Mobility)', cat: ServiceCategoryName.B_PRIMARY_CARE, price: 180000, sla: 1440, payPerUse: false, kavach: 0, sahara: 1, sampoorna: 2, nivas: 4, unl: false },
  { num: 21, code: 'MED-09', name: 'Fall-risk assessment & home safety audit', cat: ServiceCategoryName.B_PRIMARY_CARE, price: 250000, sla: 1440, payPerUse: false, kavach: 0, sahara: 1, sampoorna: 1, nivas: 2, unl: false },
  { num: 22, code: 'MED-10', name: 'Written care plan, shared with family', cat: ServiceCategoryName.B_PRIMARY_CARE, price: 0, sla: 1440, payPerUse: false, kavach: 0, sahara: 4, sampoorna: 4, nivas: 12, unl: false },
  { num: 23, code: 'MED-11', name: 'Second-opinion coordination', cat: ServiceCategoryName.B_PRIMARY_CARE, price: 300000, sla: 2880, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 1, nivas: 2, unl: false },

  // C. DIAGNOSTICS & MONITORING (24-34)
  { num: 24, code: 'DIA-01', name: 'Diagnostic panel with home collection', cat: ServiceCategoryName.C_DIAGNOSTICS, price: 120000, sla: 720, payPerUse: false, kavach: 0, sahara: 1, sampoorna: 2, nivas: 2, unl: false },
  { num: 25, code: 'DIA-02', name: 'Comprehensive senior package (80-100 parameters)', cat: ServiceCategoryName.C_DIAGNOSTICS, price: 190000, sla: 1440, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 1, nivas: 1, unl: false },
  { num: 26, code: 'DIA-03', name: 'Home phlebotomy sample collection', cat: ServiceCategoryName.C_DIAGNOSTICS, price: 0, sla: 360, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },
  { num: 27, code: 'DIA-04', name: 'ECG at home (12-lead)', cat: ServiceCategoryName.C_DIAGNOSTICS, price: 60000, sla: 360, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 1, nivas: 2, unl: false },
  { num: 28, code: 'DIA-05', name: 'X-ray at home (portable)', cat: ServiceCategoryName.C_DIAGNOSTICS, price: 180000, sla: 720, payPerUse: true, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: false },
  { num: 29, code: 'DIA-06', name: 'Vitals capture by care officer', cat: ServiceCategoryName.C_DIAGNOSTICS, price: 0, sla: 1440, payPerUse: false, kavach: 0, sahara: 12, sampoorna: 24, nivas: 52, unl: false },
  { num: 30, code: 'DIA-07', name: 'RPM device kit (BP, scale, thermometer)', cat: ServiceCategoryName.C_DIAGNOSTICS, price: 0, sla: 1440, payPerUse: false, kavach: 0, sahara: 1, sampoorna: 1, nivas: 1, unl: false },
  { num: 31, code: 'DIA-08', name: 'Fall-detection wearable with SOS', cat: ServiceCategoryName.C_DIAGNOSTICS, price: 750000, sla: 1440, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 1, nivas: 1, unl: false },
  { num: 32, code: 'DIA-09', name: 'Glucometer test strips', cat: ServiceCategoryName.C_DIAGNOSTICS, price: 1500, sla: 1440, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 180, nivas: 365, unl: false },
  { num: 33, code: 'DIA-10', name: 'Live vitals dashboard for the family', cat: ServiceCategoryName.C_DIAGNOSTICS, price: 0, sla: 1, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },
  { num: 34, code: 'DIA-11', name: 'AI deterioration alerts', cat: ServiceCategoryName.C_DIAGNOSTICS, price: 0, sla: 15, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },

  // D. MEDICATION MANAGEMENT (35-40)
  { num: 35, code: 'RX-01', name: 'Medication reconciliation', cat: ServiceCategoryName.D_MEDICATION, price: 90000, sla: 1440, payPerUse: false, kavach: 0, sahara: 2, sampoorna: 4, nivas: 12, unl: false },
  { num: 36, code: 'RX-02', name: 'Adherence reminders (app + call)', cat: ServiceCategoryName.D_MEDICATION, price: 0, sla: 1, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },
  { num: 37, code: 'RX-03', name: 'Prescription refill coordination', cat: ServiceCategoryName.D_MEDICATION, price: 0, sla: 720, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },
  { num: 38, code: 'RX-04', name: 'Medicine home delivery', cat: ServiceCategoryName.D_MEDICATION, price: 0, sla: 720, payPerUse: false, kavach: 0, sahara: 12, sampoorna: 12, nivas: 12, unl: false },
  { num: 39, code: 'RX-05', name: 'Partner pharmacy discount', cat: ServiceCategoryName.D_MEDICATION, price: 0, sla: 1, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },
  { num: 40, code: 'RX-06', name: 'Weekly pill organiser, filled by us', cat: ServiceCategoryName.D_MEDICATION, price: 25000, sla: 1440, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 12, nivas: 52, unl: false },

  // E. THERAPY, REHAB & MENTAL HEALTH (41-45)
  { num: 41, code: 'THP-01', name: 'Physiotherapy at home', cat: ServiceCategoryName.E_THERAPY, price: 90000, sla: 360, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 6, nivas: 24, unl: false },
  { num: 42, code: 'THP-02', name: 'Post-discharge rehabilitation plan', cat: ServiceCategoryName.E_THERAPY, price: 0, sla: 1440, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },
  { num: 43, code: 'THP-03', name: 'Dietician consult', cat: ServiceCategoryName.E_THERAPY, price: 60000, sla: 720, payPerUse: false, kavach: 0, sahara: 1, sampoorna: 4, nivas: 12, unl: false },
  { num: 44, code: 'THP-04', name: 'Counselling / mental health session', cat: ServiceCategoryName.E_THERAPY, price: 120000, sla: 720, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 4, nivas: 12, unl: false },
  { num: 45, code: 'THP-05', name: 'Cognitive screening (MMSE/MoCA)', cat: ServiceCategoryName.E_THERAPY, price: 90000, sla: 1440, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 1, nivas: 2, unl: false },

  // F. HIGH-DEPENDENCY & LONG-TERM CARE (46-51)
  { num: 46, code: 'HDP-01', name: 'Live-in attendant / caregiver', cat: ServiceCategoryName.F_HIGH_DEPENDENCY, price: 3200000, sla: 2880, payPerUse: true, kavach: 0, sahara: 0, sampoorna: 0, nivas: 12, unl: false },
  { num: 47, code: 'HDP-02', name: 'Attendant supervision & replacement bench', cat: ServiceCategoryName.F_HIGH_DEPENDENCY, price: 0, sla: 1440, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },
  { num: 48, code: 'HDP-03', name: 'Qualified nurse (GNM) at home', cat: ServiceCategoryName.F_HIGH_DEPENDENCY, price: 320000, sla: 720, payPerUse: true, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: false },
  { num: 49, code: 'HDP-04', name: 'Equipment rental - bed, oxygen, wheelchair', cat: ServiceCategoryName.F_HIGH_DEPENDENCY, price: 420000, sla: 720, payPerUse: true, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: false },
  { num: 50, code: 'HDP-05', name: 'Wound / pressure-ulcer care', cat: ServiceCategoryName.F_HIGH_DEPENDENCY, price: 90000, sla: 360, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 12, unl: false },
  { num: 51, code: 'HDP-06', name: 'Palliative and end-of-life support', cat: ServiceCategoryName.F_HIGH_DEPENDENCY, price: 0, sla: 1440, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },

  // G. RECORDS, INSURANCE & ADVOCACY (52-56)
  { num: 52, code: 'REC-01', name: 'ABHA health account created and maintained', cat: ServiceCategoryName.G_RECORDS_INSURANCE, price: 0, sla: 1440, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },
  { num: 53, code: 'REC-02', name: 'Digital records vault', cat: ServiceCategoryName.G_RECORDS_INSURANCE, price: 0, sla: 1, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },
  { num: 54, code: 'REC-03', name: 'Annual insurance policy review', cat: ServiceCategoryName.G_RECORDS_INSURANCE, price: 150000, sla: 2880, payPerUse: false, kavach: 0, sahara: 1, sampoorna: 1, nivas: 1, unl: false },
  { num: 55, code: 'REC-04', name: 'Claims paperwork & follow-through', cat: ServiceCategoryName.G_RECORDS_INSURANCE, price: 250000, sla: 1440, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },
  { num: 56, code: 'REC-05', name: 'Cashless network access', cat: ServiceCategoryName.G_RECORDS_INSURANCE, price: 0, sla: 1, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },

  // H. HOME & DAILY LIVING (57-64)
  { num: 57, code: 'HOM-01', name: 'Utility bill payments', cat: ServiceCategoryName.H_DAILY_LIVING, price: 25000, sla: 1440, payPerUse: false, kavach: 0, sahara: 12, sampoorna: 24, nivas: 24, unl: false },
  { num: 58, code: 'HOM-02', name: 'Grocery ordering & delivery oversight', cat: ServiceCategoryName.H_DAILY_LIVING, price: 25000, sla: 720, payPerUse: false, kavach: 0, sahara: 12, sampoorna: 24, nivas: 52, unl: false },
  { num: 59, code: 'HOM-03', name: 'Meal / tiffin coordination', cat: ServiceCategoryName.H_DAILY_LIVING, price: 25000, sla: 1440, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 12, nivas: 12, unl: false },
  { num: 60, code: 'HOM-04', name: 'Domestic help sourcing & verification', cat: ServiceCategoryName.H_DAILY_LIVING, price: 900000, sla: 4320, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 1, nivas: 2, unl: false },
  { num: 61, code: 'HOM-05', name: 'Household repairs coordination', cat: ServiceCategoryName.H_DAILY_LIVING, price: 30000, sla: 720, payPerUse: false, kavach: 0, sahara: 4, sampoorna: 12, nivas: 24, unl: false },
  { num: 62, code: 'HOM-06', name: 'Appliance AMC management', cat: ServiceCategoryName.H_DAILY_LIVING, price: 30000, sla: 1440, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 4, nivas: 4, unl: false },
  { num: 63, code: 'HOM-07', name: 'Home safety modification', cat: ServiceCategoryName.H_DAILY_LIVING, price: 0, sla: 2880, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 1, nivas: 1, unl: false },
  { num: 64, code: 'HOM-08', name: 'Errand runs (post, market, documents)', cat: ServiceCategoryName.H_DAILY_LIVING, price: 25000, sla: 720, payPerUse: false, kavach: 0, sahara: 6, sampoorna: 24, nivas: 52, unl: false },

  // I. FINANCIAL, LEGAL & COMPLIANCE (65-73)
  { num: 65, code: 'FIN-01', name: 'Doorstep banking coordination', cat: ServiceCategoryName.I_FINANCIAL_LEGAL, price: 15000, sla: 1440, payPerUse: false, kavach: 0, sahara: 4, sampoorna: 12, nivas: 12, unl: false },
  { num: 66, code: 'FIN-02', name: 'Jeevan Pramaan / digital life certificate', cat: ServiceCategoryName.I_FINANCIAL_LEGAL, price: 0, sla: 1440, payPerUse: false, kavach: 0, sahara: 1, sampoorna: 1, nivas: 1, unl: false },
  { num: 67, code: 'FIN-03', name: 'Pension / PPO follow-up', cat: ServiceCategoryName.I_FINANCIAL_LEGAL, price: 90000, sla: 2880, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 2, nivas: 4, unl: false },
  { num: 68, code: 'FIN-04', name: 'Income tax filing coordination', cat: ServiceCategoryName.I_FINANCIAL_LEGAL, price: 120000, sla: 4320, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 1, nivas: 2, unl: false },
  { num: 69, code: 'FIN-05', name: 'KYC, Aadhaar, PAN updates', cat: ServiceCategoryName.I_FINANCIAL_LEGAL, price: 60000, sla: 2880, payPerUse: false, kavach: 0, sahara: 1, sampoorna: 2, nivas: 2, unl: false },
  { num: 70, code: 'FIN-06', name: 'Will drafting coordination', cat: ServiceCategoryName.I_FINANCIAL_LEGAL, price: 400000, sla: 4320, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 1, nivas: 1, unl: false },
  { num: 71, code: 'FIN-07', name: 'Power of Attorney for NRI child', cat: ServiceCategoryName.I_FINANCIAL_LEGAL, price: 900000, sla: 4320, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 1, nivas: 1, unl: false },
  { num: 72, code: 'FIN-08', name: 'Property management coordination', cat: ServiceCategoryName.I_FINANCIAL_LEGAL, price: 0, sla: 4320, payPerUse: true, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: false },
  { num: 73, code: 'FIN-09', name: 'Monthly expense statement to family', cat: ServiceCategoryName.I_FINANCIAL_LEGAL, price: 0, sla: 1440, payPerUse: false, kavach: 0, sahara: 12, sampoorna: 12, nivas: 12, unl: false },

  // J. MOBILITY, TRAVEL & ACCOMPANIMENT (74-78)
  { num: 74, code: 'MOB-01', name: 'Appointment accompaniment', cat: ServiceCategoryName.J_MOBILITY_TRAVEL, price: 70000, sla: 360, payPerUse: false, kavach: 0, sahara: 2, sampoorna: 12, nivas: 24, unl: false },
  { num: 75, code: 'MOB-02', name: 'Cab booking & escort', cat: ServiceCategoryName.J_MOBILITY_TRAVEL, price: 20000, sla: 120, payPerUse: false, kavach: 0, sahara: 4, sampoorna: 24, nivas: 52, unl: false },
  { num: 76, code: 'MOB-03', name: 'Airport meet & greet', cat: ServiceCategoryName.J_MOBILITY_TRAVEL, price: 180000, sla: 720, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 2, nivas: 4, unl: false },
  { num: 77, code: 'MOB-04', name: 'Travel escort (domestic flight/train)', cat: ServiceCategoryName.J_MOBILITY_TRAVEL, price: 220000, sla: 1440, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 1, nivas: 2, unl: false },
  { num: 78, code: 'MOB-05', name: 'Temple, bank and social outing accompaniment', cat: ServiceCategoryName.J_MOBILITY_TRAVEL, price: 50000, sla: 360, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 12, nivas: 24, unl: false },

  // K. COMPANIONSHIP & ENGAGEMENT (79-83)
  { num: 79, code: 'CMP-01', name: 'Scheduled check-in calls', cat: ServiceCategoryName.K_COMPANIONSHIP, price: 0, sla: 720, payPerUse: false, kavach: 12, sahara: 26, sampoorna: 52, nivas: 104, unl: false },
  { num: 80, code: 'CMP-02', name: 'Companionship visits (walk, chess, talk)', cat: ServiceCategoryName.K_COMPANIONSHIP, price: 50000, sla: 1440, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 12, nivas: 52, unl: false },
  { num: 81, code: 'CMP-03', name: 'Community events and interest groups', cat: ServiceCategoryName.K_COMPANIONSHIP, price: 0, sla: 1440, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },
  { num: 82, code: 'CMP-04', name: 'Festival and birthday presence', cat: ServiceCategoryName.K_COMPANIONSHIP, price: 90000, sla: 1440, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 2, nivas: 4, unl: false },
  { num: 83, code: 'CMP-05', name: 'Technology help (video calls, phone, UPI)', cat: ServiceCategoryName.K_COMPANIONSHIP, price: 40000, sla: 720, payPerUse: false, kavach: 0, sahara: 2, sampoorna: 6, nivas: 12, unl: false },

  // L. THE FAMILY LAYER (84-90)
  { num: 84, code: 'FAM-01', name: 'Named care officer with direct number', cat: ServiceCategoryName.L_FAMILY_LAYER, price: 0, sla: 1, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },
  { num: 85, code: 'FAM-02', name: 'Published caseload per officer', cat: ServiceCategoryName.L_FAMILY_LAYER, price: 0, sla: 1, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },
  { num: 86, code: 'FAM-03', name: 'Family dashboard and app', cat: ServiceCategoryName.L_FAMILY_LAYER, price: 0, sla: 1, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },
  { num: 87, code: 'FAM-04', name: 'Monthly written care report', cat: ServiceCategoryName.L_FAMILY_LAYER, price: 0, sla: 1440, payPerUse: false, kavach: 0, sahara: 12, sampoorna: 12, nivas: 12, unl: false },
  { num: 88, code: 'FAM-05', name: 'Time-zone-aware family calls', cat: ServiceCategoryName.L_FAMILY_LAYER, price: 0, sla: 1440, payPerUse: false, kavach: 0, sahara: 4, sampoorna: 12, nivas: 12, unl: false },
  { num: 89, code: 'FAM-06', name: 'Published escalation matrix', cat: ServiceCategoryName.L_FAMILY_LAYER, price: 0, sla: 1, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true },
  { num: 90, code: 'FAM-07', name: 'Second parent on same plan', cat: ServiceCategoryName.L_FAMILY_LAYER, price: 0, sla: 1, payPerUse: false, kavach: 0, sahara: 0, sampoorna: 0, nivas: 0, unl: true }
];

async function main() {
  console.log('🌱 Starting Pococare database seed...');

  // 1. Seed Plan Tiers
  const kavach = await prisma.planTier.upsert({
    where: { name: PlanTierName.KAVACH },
    update: {},
    create: { name: PlanTierName.KAVACH, annualPricePaise: 990000, description: 'Emergency response spine and essential check-ins' }
  });
  const sahara = await prisma.planTier.upsert({
    where: { name: PlanTierName.SAHARA },
    update: {},
    create: { name: PlanTierName.SAHARA, annualPricePaise: 3990000, description: 'Active senior care with monthly care officer visits and teleconsults' }
  });
  const sampoorna = await prisma.planTier.upsert({
    where: { name: PlanTierName.SAMPOORNA },
    update: {},
    create: { name: PlanTierName.SAMPOORNA, annualPricePaise: 8990000, description: 'Comprehensive care with bi-weekly visits, doctor home visits, and diagnostics' }
  });
  const nivas = await prisma.planTier.upsert({
    where: { name: PlanTierName.NIVAS },
    update: {},
    create: { name: PlanTierName.NIVAS, annualPricePaise: 39900000, description: 'High-dependency live-in caregiver and continuous clinical oversight' }
  });
  console.log('✓ Plan tiers seeded (Kavach, Sahara, Sampoorna, Nivas)');

  // 2. Seed 90 Services & Plan Quotas
  for (const s of SERVICES_DATA) {
    const service = await prisma.serviceCatalog.upsert({
      where: { code: s.code },
      update: {
        name: s.name,
        category: s.cat,
        unitPricePaise: s.price,
        slaMinutes: s.sla,
        isPayPerUseOnly: s.payPerUse
      },
      create: {
        serviceNumber: s.num,
        code: s.code,
        name: s.name,
        category: s.cat,
        description: s.name,
        unitPricePaise: s.price,
        slaMinutes: s.sla,
        isPayPerUseOnly: s.payPerUse
      }
    });

    const tierMap = [
      { tierId: kavach.id, count: s.kavach },
      { tierId: sahara.id, count: s.sahara },
      { tierId: sampoorna.id, count: s.sampoorna },
      { tierId: nivas.id, count: s.nivas }
    ];

    for (const t of tierMap) {
      await prisma.planQuota.upsert({
        where: {
          planTierId_serviceCatalogId: {
            planTierId: t.tierId,
            serviceCatalogId: service.id
          }
        },
        update: {
          includedUnitsYear: t.count,
          isUnlimited: s.unl
        },
        create: {
          planTierId: t.tierId,
          serviceCatalogId: service.id,
          includedUnitsYear: t.count,
          isUnlimited: s.unl
        }
      });
    }

    if ([12, 13, 15, 17, 21, 29].includes(s.num)) {
      await prisma.sopTemplate.upsert({
        where: {
          serviceCatalogId_version: {
            serviceCatalogId: service.id,
            version: 1
          }
        },
        update: {},
        create: {
          serviceCatalogId: service.id,
          version: 1,
          title: 'Standard Operating Procedure: ' + s.name,
          description: 'Protocol checklist for ' + s.name,
          jsonSchema: {
            steps: [
              { id: 'step_1', title: 'Arrive at premises and verify member identity', type: 'BOOLEAN', required: true },
              { id: 'step_2', title: 'Capture resting blood pressure (Systolic / Diastolic)', type: 'VITALS', required: true },
              { id: 'step_3', title: 'Capture pulse and SpO2 oxygen saturation', type: 'VITALS', required: true },
              { id: 'step_4', title: 'Medication adherence and refill review', type: 'BOOLEAN', required: true },
              { id: 'step_5', title: 'Member confirmation signature', type: 'SIGNATURE', required: true }
            ]
          }
        }
      });
    }
  }
  console.log('✓ Seeded ' + SERVICES_DATA.length + ' services across categories A to L with versioned SOP templates');

  // 3. Seed Users across roles
  const passwordHash = await bcrypt.hash('PocoCare@2026', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pococare.in' },
    update: {},
    create: {
      name: 'Radhakrishnan Nair',
      email: 'admin@pococare.in',
      phone: '+919880012345',
      passwordHash,
      userRoles: { create: [{ role: RoleType.ADMIN }, { role: RoleType.OPS_MANAGER }] }
    }
  });

  const dispatcher = await prisma.user.upsert({
    where: { email: 'dispatcher@pococare.in' },
    update: {},
    create: {
      name: 'Pooja Sharma',
      email: 'dispatcher@pococare.in',
      phone: '+919880012346',
      passwordHash,
      userRoles: { create: [{ role: RoleType.DISPATCHER }] }
    }
  });

  const careOfficerBlr = await prisma.user.upsert({
    where: { email: 'co.blr@pococare.in' },
    update: {},
    create: {
      name: 'Subedar Major R. Venkatesh (Retd.)',
      email: 'co.blr@pococare.in',
      phone : '+919845011223',
      passwordHash,
      userRoles: { create: [{ role: RoleType.CARE_OFFICER }] }
    }
  });

  const doctor = await prisma.user.upsert({
    where: { email: 'dr.anand@pococare.in' },
    update: {},
    create: { name: 'Dr. Anand Kulkarni (MD Geriatrics)', email: 'dr.anand@pococare.in', phone: '+919845099887', passwordHash, userRoles: { create: [{ role: RoleType.DOCTOR }] } }
  });

  const nriSon = await prisma.user.upsert({
    where: { email: 'vikram.menon@gmail.com' },
    update: {},
    create: { name: 'Vikram Menon', email: 'vikram.menon@gmail.com', phone: '+14155552671', passwordHash, userRoles: { create: [{ role: RoleType.FAMILY_PRIMARY_NRI }] } }
  });

  // 4. Seed Household in Indiranagar, Bangalore
  const household = await prisma.household.upsert({
    where: { id: 'hh-blr-001' },
    update: {},
    create: {
      id: 'hh-blr-001',
      name: 'Menon Residence',
      city: 'Bangalore',
      addressLine: '452, 12th Main Road, HAL 2nd Stage, Indiranagar',
      postalCode: '560038',
      primaryContactPhone: '+919845023456',
      timeZone: 'Asia/Kolkata',
      careOfficerId: careOfficerBlr.id,
      wallet: {
        create: {
          balancePaise: 1500000
        }
      },
      subscriptions: {
        create: {
          planTierId: sampoorna.id,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          autoRenew: true
        }
      }
    }
  });

  const father = await prisma.member.upsert({
    where: { id: 'mem-blr-001' },
    update: {},
    create: {
      id: 'mem-blr-001',
      householdId: household.id,
      firstName: 'Gopalakrishnan',
      lastName: 'Menon',
      phone: '+919845023456',
      email: 'gopal.menon@gmail.com',
      relationship: 'FATHER',
      dateOfBirth: new Date('1948-06-15'),
      gender: 'MALE',
      abhaNumber: '91-1234-5678-9012',
      abhaStatus: AbhaSyncStatus.LINKED,
      iceProfile: {
        create: {
          bloodGroup: 'O_POSITIVE',
          allergies: ['Penicillin', 'Sulfa drugs'],
          chronicConditions: ['Hypertension', 'Type 2 Diabetes', 'Mild Osteoarthritis'],
          currentMedications: [
            { name: 'Telmisartan', dosage: '40mg', frequency: 'Once daily (Morning)' },
            { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily (After meals)' },
            { name: 'Atorvastatin', dosage: '10mg', frequency: 'Once daily (Night)' }
          ],
          baselineVitals: { systolicBp: 130, diastolicBp: 82, pulse: 74, sugarFasting: 118 },
          preferredHospitalName: 'Manipal Hospital Old Airport Road',
          preferredHospitalPhone: '+918025024444',
          preferredHospitalAddress: '98, HAL Old Airport Rd, Kodihalli, Bengaluru 560017',
          emergencyNotes: 'Cardiac stent placed in 2021. Prefers Dr. Anand Kulkarni.'
        }
      }
    }
  });

  const now = Date.now();
  for (let i = 6; i >= 0; i--) {
    const readingDate = new Date(now - i * 24 * 60 * 60 * 1000);
    await prisma.vitalsReading.create({
      data: {
        memberId: father.id,
        systolicBp: 126 + Math.floor(Math.random() * 8),
        diastolicBp: 80 + Math.floor(Math.random() * 6),
        pulseBpm: 72 + Math.floor(Math.random() * 6),
        bloodGlucoseMgDl: 115 + Math.floor(Math.random() * 12),
        spo2Percent: 98.0,
        weightKg: 68.5,
        temperatureF: 98.4,
        recordedAt: readingDate,
        isAbnormal: false
      }
    });
  }

  console.log('✓ Seeded sample Household (Bangalore), Members with ICE Profile & 7-day Vitals History');
  console.log('✨ Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
