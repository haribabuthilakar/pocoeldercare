export interface AiClassificationResult {
  intent: 'EMERGENCY' | 'SERVICE_REQUEST' | 'FEEDBACK' | 'GENERAL_QUERY';
  priority: 'EMERGENCY' | 'URGENT' | 'ROUTINE';
  confidenceScore: number;
  extractedServices: Array<{ serviceCode: string; notes?: string }>;
  summary: string;
}

export interface IAiClassificationProvider {
  classify(text: string): Promise<AiClassificationResult>;
}
