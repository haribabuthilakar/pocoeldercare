import { LeadStage } from '@poco/constants';
import type { Result } from '../common/result';
import { ok, err } from '../common/result';
import { DomainError, DomainErrorCode } from '../common/errors';

export interface LeadData {
  id: string;
  contactName: string;
  phone: string;
  email?: string | null;
  stage: LeadStage;
  addressLine1?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
}

export interface LeadConversionInput {
  packageVersionId: string;
  householdName: string;
  latitude: number;
  longitude: number;
  initialSeniorName: string;
  initialSeniorDob: Date;
  initialSeniorGender: string;
}

export interface ConvertedHouseholdPayload {
  leadId: string;
  householdName: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  primaryContact: {
    name: string;
    phone: string;
    email?: string | null;
  };
  initialSenior: {
    name: string;
    dateOfBirth: Date;
    gender: string;
  };
  subscription: {
    packageVersionId: string;
  };
}

/**
 * Validates lead conversion into active Household and initial subscription per D-62.
 */
export function validateLeadConversion(
  lead: LeadData,
  conversionInput: LeadConversionInput
): Result<ConvertedHouseholdPayload, DomainError> {
  if (lead.stage === LeadStage.CONVERTED) {
    return err(
      new DomainError(
        DomainErrorCode.INVALID_STATE_TRANSITION,
        `Lead ${lead.id} is already converted into an active household`
      )
    );
  }

  if (lead.stage === LeadStage.LOST) {
    return err(
      new DomainError(
        DomainErrorCode.INVALID_STATE_TRANSITION,
        `Cannot convert lost lead ${lead.id}`
      )
    );
  }

  if (!lead.addressLine1 || !lead.city || !lead.postalCode) {
    return err(
      new DomainError(
        DomainErrorCode.INVALID_INPUT,
        'Lead is missing required address details for household conversion'
      )
    );
  }

  if (!conversionInput.packageVersionId) {
    return err(
      new DomainError(
        DomainErrorCode.INVALID_INPUT,
        'An initial subscription package must be selected for conversion'
      )
    );
  }

  return ok({
    leadId: lead.id,
    householdName: conversionInput.householdName || `${lead.contactName}'s Household`,
    addressLine1: lead.addressLine1,
    city: lead.city,
    state: lead.state || 'Karnataka',
    postalCode: lead.postalCode,
    latitude: conversionInput.latitude,
    longitude: conversionInput.longitude,
    primaryContact: {
      name: lead.contactName,
      phone: lead.phone,
      email: lead.email
    },
    initialSenior: {
      name: conversionInput.initialSeniorName,
      dateOfBirth: conversionInput.initialSeniorDob,
      gender: conversionInput.initialSeniorGender
    },
    subscription: {
      packageVersionId: conversionInput.packageVersionId
    }
  });
}
