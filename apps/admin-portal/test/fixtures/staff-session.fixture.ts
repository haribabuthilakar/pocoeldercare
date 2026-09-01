import { UserRole } from '@poco/constants';

export interface StaffSessionUser {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
}

export const mockSuperAdmin: StaffSessionUser = {
  id: 'usr-admin-01',
  name: 'Ananya Sharma',
  email: 'ananya.admin@pocoeldercare.com',
  roles: [UserRole.SUPER_ADMIN],
};

export const mockOpsManager: StaffSessionUser = {
  id: 'usr-ops-01',
  name: 'Vikram Mehta',
  email: 'vikram.ops@pocoeldercare.com',
  roles: [UserRole.OPS_MANAGER],
};

export const mockCareManager: StaffSessionUser = {
  id: 'usr-care-01',
  name: 'Pooja Nair',
  email: 'pooja.care@pocoeldercare.com',
  roles: [UserRole.CARE_MANAGER],
};

export const mockSalesLead: StaffSessionUser = {
  id: 'usr-sales-01',
  name: 'Rahul Varma',
  email: 'rahul.sales@pocoeldercare.com',
  roles: [UserRole.SALES_LEAD],
};

export const mockMultiRoleStaff: StaffSessionUser = {
  id: 'usr-multi-01',
  name: 'Priya Sundaram',
  email: 'priya.lead@pocoeldercare.com',
  roles: [UserRole.OPS_MANAGER, UserRole.CARE_MANAGER, UserRole.SALES_LEAD],
};
