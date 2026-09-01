import { Injectable } from '@nestjs/common';
import { IAiClassificationProvider, AiClassificationResult } from '../interfaces/ai-classification-provider.interface';

@Injectable()
export class MockAiClassifierProvider implements IAiClassificationProvider {
  async classify(text: string): Promise<AiClassificationResult> {
    const lower = text.toLowerCase();

    // 1. Emergency Detection
    if (
      lower.includes('chest pain') ||
      lower.includes('heart attack') ||
      lower.includes('fell') ||
      lower.includes('unconscious') ||
      lower.includes('ambulance') ||
      lower.includes('emergency')
    ) {
      return {
        intent: 'EMERGENCY',
        priority: 'EMERGENCY',
        confidenceScore: 0.95,
        extractedServices: [{ serviceCode: 'EMERGENCY_AMBULANCE', notes: 'Urgent emergency response' }],
        summary: `Emergency alert extracted from message: "${text.substring(0, 80)}"`,
      };
    }

    // 2. Doctor / Medical Visit
    if (lower.includes('doctor') || lower.includes('fever') || lower.includes('cough') || lower.includes('medicine')) {
      return {
        intent: 'SERVICE_REQUEST',
        priority: 'URGENT',
        confidenceScore: 0.88,
        extractedServices: [{ serviceCode: 'DOCTOR_HOME_VISIT', notes: 'Doctor home visit request' }],
        summary: `Medical consultation request: "${text.substring(0, 80)}"`,
      };
    }

    // 3. Logistics / Transport
    if (lower.includes('cab') || lower.includes('hospital visit') || lower.includes('driver')) {
      return {
        intent: 'SERVICE_REQUEST',
        priority: 'ROUTINE',
        confidenceScore: 0.82,
        extractedServices: [{ serviceCode: 'LOGISTICS_TRANSPORT', notes: 'Transport assistance' }],
        summary: `Logistics transport request: "${text.substring(0, 80)}"`,
      };
    }

    // Default conversational
    return {
      intent: 'GENERAL_QUERY',
      priority: 'ROUTINE',
      confidenceScore: 0.45,
      extractedServices: [],
      summary: 'Conversational chat message',
    };
  }
}
