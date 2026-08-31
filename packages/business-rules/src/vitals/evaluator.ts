import { VitalType, VitalSeverity } from '@poco/constants';

export interface VitalReadingInput {
  vitalType: VitalType;
  numericValue: number;
  secondaryValue?: number; // e.g. Diastolic for BP
  unit?: string;
}

export interface VitalSeverityEvaluation {
  severity: VitalSeverity;
  isEmergency: boolean;
  alertMessage?: string;
}

/**
 * Pure function evaluating clinical bounds of senior vital readings per D-61.
 */
export function evaluateVitalReadingSeverity(reading: VitalReadingInput): VitalSeverityEvaluation {
  switch (reading.vitalType) {
    case VitalType.FALL_ALERT: {
      return {
        severity: VitalSeverity.CRITICAL,
        isEmergency: true,
        alertMessage: 'EMERGENCY: Fall detection trigger recorded for senior!'
      };
    }

    case VitalType.SPO2: {
      const val = reading.numericValue;
      if (val < 90) {
        return {
          severity: VitalSeverity.CRITICAL,
          isEmergency: true,
          alertMessage: `CRITICAL: SpO2 oxygen saturation dangerously low at ${val}% (< 90%)`
        };
      }
      if (val < 95) {
        return {
          severity: VitalSeverity.ATTENTION,
          isEmergency: false,
          alertMessage: `ATTENTION: SpO2 oxygen saturation suboptimal at ${val}% (90-94%)`
        };
      }
      return { severity: VitalSeverity.NORMAL, isEmergency: false };
    }

    case VitalType.BLOOD_PRESSURE: {
      const systolic = reading.numericValue;
      const diastolic = reading.secondaryValue ?? 80;

      if (systolic >= 180 || diastolic >= 120 || systolic < 80 || diastolic < 50) {
        return {
          severity: VitalSeverity.CRITICAL,
          isEmergency: true,
          alertMessage: `CRITICAL: Hypertensive crisis or severe hypotension (${systolic}/${diastolic} mmHg)`
        };
      }
      if (systolic >= 130 || diastolic >= 85) {
        return {
          severity: VitalSeverity.ATTENTION,
          isEmergency: false,
          alertMessage: `ATTENTION: Elevated blood pressure reading (${systolic}/${diastolic} mmHg)`
        };
      }
      return { severity: VitalSeverity.NORMAL, isEmergency: false };
    }

    case VitalType.HEART_RATE: {
      const val = reading.numericValue;
      if (val >= 120 || val < 50) {
        return {
          severity: VitalSeverity.CRITICAL,
          isEmergency: true,
          alertMessage: `CRITICAL: Extreme heart rate reading at ${val} bpm`
        };
      }
      if (val > 100 || val < 60) {
        return {
          severity: VitalSeverity.ATTENTION,
          isEmergency: false,
          alertMessage: `ATTENTION: Mild tachycardia or bradycardia at ${val} bpm`
        };
      }
      return { severity: VitalSeverity.NORMAL, isEmergency: false };
    }

    case VitalType.BLOOD_GLUCOSE: {
      const val = reading.numericValue;
      if (val >= 250 || val < 60) {
        return {
          severity: VitalSeverity.CRITICAL,
          isEmergency: true,
          alertMessage: `CRITICAL: Severe blood glucose anomaly at ${val} mg/dL`
        };
      }
      if (val >= 140 || val < 70) {
        return {
          severity: VitalSeverity.ATTENTION,
          isEmergency: false,
          alertMessage: `ATTENTION: Elevated blood glucose reading at ${val} mg/dL`
        };
      }
      return { severity: VitalSeverity.NORMAL, isEmergency: false };
    }

    case VitalType.BODY_TEMPERATURE: {
      const val = reading.numericValue;
      if (val >= 102.5 || val < 95.0) {
        return {
          severity: VitalSeverity.CRITICAL,
          isEmergency: true,
          alertMessage: `CRITICAL: High fever or hypothermia at ${val}°F`
        };
      }
      if (val >= 99.5) {
        return {
          severity: VitalSeverity.ATTENTION,
          isEmergency: false,
          alertMessage: `ATTENTION: Mild fever reading at ${val}°F`
        };
      }
      return { severity: VitalSeverity.NORMAL, isEmergency: false };
    }

    case VitalType.WEIGHT:
    default:
      return { severity: VitalSeverity.NORMAL, isEmergency: false };
  }
}
