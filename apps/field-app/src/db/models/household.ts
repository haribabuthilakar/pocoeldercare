export interface HouseholdRecord {
  id: string;
  name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  status: 'PENDING_ONBOARDING' | 'ACTIVE' | 'SUSPENDED' | 'CHURNED';
  assigned_care_officer_id: string;
  created_at: number;
  updated_at: number;
}

export class HouseholdModel {
  static table = 'households';

  constructor(public raw: HouseholdRecord) {}

  get id(): string {
    return this.raw.id;
  }
  get name(): string {
    return this.raw.name;
  }
  get addressLine1(): string {
    return this.raw.address_line1;
  }
  get addressLine2(): string | undefined {
    return this.raw.address_line2;
  }
  get city(): string {
    return this.raw.city;
  }
  get pincode(): string {
    return this.raw.pincode;
  }
  get latitude(): number | undefined {
    return this.raw.latitude;
  }
  get longitude(): number | undefined {
    return this.raw.longitude;
  }
  get status(): HouseholdRecord['status'] {
    return this.raw.status;
  }
  get assignedCareOfficerId(): string {
    return this.raw.assigned_care_officer_id;
  }
  get fullAddress(): string {
    return [this.addressLine1, this.addressLine2, this.city, this.pincode]
      .filter(Boolean)
      .join(', ');
  }
}
