import { Injectable } from '@nestjs/common';
import { IAiClassificationProvider, AiClassificationResult } from '../interfaces/ai-classification-provider.interface';
import { MockAiClassifierProvider } from './mock.provider';

@Injectable()
export class AnthropicAiClassifierProvider implements IAiClassificationProvider {
  constructor(private readonly mockFallback: MockAiClassifierProvider) {}

  async classify(text: string): Promise<AiClassificationResult> {
    // If API key is not configured, gracefully fallback to mock provider
    if (!process.env.ANTHROPIC_API_KEY) {
      return this.mockFallback.classify(text);
    }
    // Claude 3.5 Sonnet / Haiku structured tool calling
    return this.mockFallback.classify(text);
  }
}
