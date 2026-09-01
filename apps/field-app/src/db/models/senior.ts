export interface SeniorRecord {
  id: string;
  household_id: string;
  full_name: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  allergies?: string[];
  preferred_hospital?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  is_primary: boolean;
}

export class SeniorModel {
  static table = 'seniors';

  constructor(public raw: SeniorRecord) {}

  get id(): string {
    return this.raw.id;
  }
  get householdId(): string {
    return this.raw.household_id;
  }
  get fullName(): string {
    return this.raw.full_name;
  }
  get dateOfBirth(): string | undefined {
    return this.raw.date_of_birth;
  }
  get gender(): string | undefined {
    return this.raw.gender;
  }
  get bloodGroup(): string | undefined {
    return this.raw.blood_group;
  }
  get allergies(): string[] {
    return Array.isArray(this.raw.allergies) ? this.raw.allergies : [];
  }
  get preferredHospital(): string | undefined {
    return this.raw.preferred_hospital;
  }
  get emergencyContactName(): string | undefined {
    return this.raw.emergency_contact_name;
  }
  get emergencyContactPhone(): string | undefined {
    return this.raw.emergency_contact_phone;
  }
  get isPrimary(): boolean {
    return this.raw.is_primary;
  }
}
