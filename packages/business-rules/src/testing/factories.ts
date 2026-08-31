import { TicketStatus, ServiceRequestStatus, TicketPriority, SlaStatus, UserRole } from '@poco/constants';
import type { CandidateCareOfficer } from '../assignments/validator';
import type { ServiceCatalogVersionData, PackageVersionData } from '../catalog/pricing';
import { BASE_TEST_TIME } from './time';

let uuidCounter = 1000;
export function mockUuid(prefix = 'obj'): string {
  uuidCounter++;
  return `${prefix.padEnd(8, '0')}-0000-4000-a000-${uuidCounter.toString().padStart(12, '0')}`;
}

export function createMockTicket(overrides: Partial<any> = {}) {
  return {
    id: overrides.id || mockUuid('ticket'),
    householdId: overrides.householdId || mockUuid('house'),
    seniorId: overrides.seniorId || mockUuid('senior'),
    assignedCareOfficerId: overrides.assignedCareOfficerId || null,
    title: overrides.title || 'Routine Caregiver Check-in',
    status: overrides.status || TicketStatus.OPEN,
    priority: overrides.priority || TicketPriority.ROUTINE,
    slaStatus: overrides.slaStatus || SlaStatus.NORMAL,
    category: overrides.category || 'WELLNESS',
    responseDueAt: overrides.responseDueAt || new Date(BASE_TEST_TIME.getTime() + 3600000),
    deliveryDueAt: overrides.deliveryDueAt || new Date(BASE_TEST_TIME.getTime() + 28800000),
    createdAt: overrides.createdAt || BASE_TEST_TIME,
    childRequests: overrides.childRequests || [],
    ...overrides
  };
}

export function createMockServiceRequest(overrides: Partial<any> = {}) {
  return {
    id: overrides.id || mockUuid('sreq'),
    ticketId: overrides.ticketId || mockUuid('ticket'),
    serviceCatalogVersionId: overrides.serviceCatalogVersionId || mockUuid('catver'),
    status: overrides.status || ServiceRequestStatus.PENDING,
    assignedCareOfficerId: overrides.assignedCareOfficerId || null,
    deliveryDueAt: overrides.deliveryDueAt || new Date(BASE_TEST_TIME.getTime() + 14400000),
    ...overrides
  };
}

export function createMockCareOfficer(overrides: Partial<CandidateCareOfficer> = {}): CandidateCareOfficer {
  return {
    id: overrides.id || mockUuid('officer'),
    isAvailable: overrides.isAvailable !== undefined ? overrides.isAvailable : true,
    certifications: overrides.certifications || [
      {
        certificationCode: 'BLS_CPR',
        expiresAt: new Date('2028-01-01T00:00:00Z'),
        status: 'ACTIVE'
      },
      {
        certificationCode: 'GERIATRIC_FIRST_AID',
        expiresAt: new Date('2028-01-01T00:00:00Z'),
        status: 'ACTIVE'
      }
    ],
    ...overrides
  };
}

export function createMockServiceVersion(overrides: Partial<ServiceCatalogVersionData> = {}): ServiceCatalogVersionData {
  return {
    id: overrides.id || mockUuid('catver'),
    serviceCatalogId: overrides.serviceCatalogId || mockUuid('cat'),
    version: overrides.version || 1,
    pricePaise: overrides.pricePaise !== undefined ? overrides.pricePaise : 40000, // ₹400
    requiredCertifications: overrides.requiredCertifications || [],
    ...overrides
  };
}

export function createMockPackageVersion(overrides: Partial<PackageVersionData> = {}): PackageVersionData {
  return {
    id: overrides.id || mockUuid('pkgver'),
    packageId: overrides.packageId || mockUuid('pkg'),
    version: overrides.version || 1,
    monthlyPricePaise: overrides.monthlyPricePaise !== undefined ? overrides.monthlyPricePaise : 300000,
    serviceQuotas: overrides.serviceQuotas || [],
    ...overrides
  };
}
