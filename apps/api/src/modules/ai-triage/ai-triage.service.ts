import { Injectable } from '@nestjs/common';
import { MockAiClassifierProvider } from './providers/mock.provider';
import { AnthropicAiClassifierProvider } from './providers/anthropic.provider';
import { OpenAiClassifierProvider } from './providers/openai.provider';
import { IAiClassificationProvider, AiClassificationResult } from './interfaces/ai-classification-provider.interface';

@Injectable()
export class AiTriageService {
  private activeProvider: IAiClassificationProvider;

  constructor(
    private readonly mockProvider: MockAiClassifierProvider,
    private readonly anthropicProvider: AnthropicAiClassifierProvider,
    private readonly openAiProvider: OpenAiClassifierProvider,
  ) {
    this.activeProvider = this.mockProvider;
  }

  async classifyMessage(text: string): Promise<AiClassificationResult> {
    return this.activeProvider.classify(text);
  }
}
