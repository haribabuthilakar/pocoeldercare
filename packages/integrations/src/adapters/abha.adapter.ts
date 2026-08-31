import { PartnerCode } from '@poco/constants';
import type {
  AbhaGenerateOtpReqDto,
  AbhaGenerateOtpResDto,
  AbhaVerifyOtpReqDto,
  AbhaProfileResDto,
  AbhaConsentInitReqDto,
  AbhaConsentStatusDto,
  AbhaFhirRecordDto
} from '@poco/validation';
import {
  createMockAbhaProfile,
  createMockAbhaFhirRecord
} from '@poco/validation';
import { BasePartnerAdapter } from '../core/base-partner.adapter';
import type { FaultInjectorService } from '../core/fault-injector.service';
import type { OutboundLoggerService } from '../core/outbound-logger.service';
import type { CallbackSchedulerService } from '../core/callback-scheduler.service';
import type { PartnerExecutionOptions } from '../interfaces/partner-adapter.interface';

export class AbhaAdapter extends BasePartnerAdapter<
  AbhaGenerateOtpReqDto | AbhaVerifyOtpReqDto | AbhaConsentInitReqDto | { consentRequestId: string },
  AbhaGenerateOtpResDto | AbhaProfileResDto | AbhaConsentStatusDto | AbhaFhirRecordDto
> {
  constructor(
    faultInjector: FaultInjectorService,
    outboundLogger: OutboundLoggerService,
    private readonly scheduler?: CallbackSchedulerService
  ) {
    super(PartnerCode.ABHA, '/v1/registration/aadhaar/generateOtp', faultInjector, outboundLogger);
  }

  protected async handleMockExecution(
    endpoint: string,
    payload: AbhaGenerateOtpReqDto | AbhaVerifyOtpReqDto | AbhaConsentInitReqDto | { consentRequestId: string },
    _options?: PartnerExecutionOptions
  ): Promise<AbhaGenerateOtpResDto | AbhaProfileResDto | AbhaConsentStatusDto | AbhaFhirRecordDto> {
    // M1: Generate OTP
    if (endpoint.includes('generateOtp')) {
      const req = payload as AbhaGenerateOtpReqDto;
      const masked = req.aadhaarNumber ? `XXXX-XXXX-${req.aadhaarNumber.slice(-4)}` : 'XXXX-XXXX-1234';
      return {
        txnId: `txn_${Math.random().toString(36).substring(2, 12)}`,
        message: 'OTP sent successfully to Aadhaar-linked mobile number',
        mobileMasked: `+91-XXXXX-${masked.slice(-4)}`
      };
    }

    // M1: Verify OTP
    if (endpoint.includes('verifyOtp')) {
      return createMockAbhaProfile();
    }

    // M2: Consent Initialization
    if (endpoint.includes('consent-requests/init') || endpoint.includes('consent')) {
      const consentReq = payload as AbhaConsentInitReqDto;
      const consentStatus: AbhaConsentStatusDto = {
        consentRequestId: `CR-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'GRANTED',
        consentArtefactId: `CA-${Math.floor(100000 + Math.random() * 900000)}`,
        seniorAbhaAddress: consentReq.seniorAbhaAddress ?? 'senior.sharma@abdm',
        grantedAt: new Date()
      };

      if (this.scheduler) {
        this.scheduler.scheduleCallback(
          PartnerCode.ABHA,
          'consent-status',
          consentStatus as unknown as Record<string, unknown>,
          2000
        );
      }

      return consentStatus;
    }

    // M3: Health Information Exchange (FHIR R4)
    return createMockAbhaFhirRecord();
  }
}
