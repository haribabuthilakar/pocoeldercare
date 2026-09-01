import { Injectable } from '@nestjs/common';
import { IAiClassificationProvider, AiClassificationResult } from '../interfaces/ai-classification-provider.interface';
import { MockAiClassifierProvider } from './mock.provider';

@Injectable()
export class OpenAiClassifierProvider implements IAiClassificationProvider {
  constructor(private readonly mockFallback: MockAiClassifierProvider) {}

  async classify(text: string): Promise<AiClassificationResult> {
    if (!process.env.OPENAI_API_KEY) {
      return this.mockFallback.classify(text);
    }
    return this.mockFallback.classify(text);
  }
}
