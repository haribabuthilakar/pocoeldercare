import type { InternalJwtPayload } from '@poco/types';
import { UserRole } from '@poco/constants';

export interface CareOfficerSession {
  user: InternalJwtPayload;
  careOfficerId: string;
  fullName: string;
  phone: string;
  cluster: string;
  accessToken: string;
  refreshToken: string;
  pinHash?: string;
  pinSetup: boolean;
}

export const mockCareOfficerUser: InternalJwtPayload = {
  sub: 'usr_co_001',
  email: 'care.officer.1@poco.care',
  roles: [UserRole.CARE_OFFICER],
  tokenType: 'INTERNAL',
  assignedTerritories: ['BLR-SOUTH-01'],
};

export const mockFieldSession: CareOfficerSession = {
  user: mockCareOfficerUser,
  careOfficerId: 'co_prof_001',
  fullName: 'Rajesh Kumar',
  phone: '+919876543210',
  cluster: 'Indiranagar Cluster',
  accessToken: 'mock_jwt_access_token_field_app_123',
  refreshToken: 'mock_jwt_refresh_token_field_app_456',
  pinHash: '1234',
  pinSetup: true,
};
