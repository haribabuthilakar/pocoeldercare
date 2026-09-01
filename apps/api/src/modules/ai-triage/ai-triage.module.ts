import { Module } from '@nestjs/common';
import { AiTriageService } from './ai-triage.service';
import { MockAiClassifierProvider } from './providers/mock.provider';
import { AnthropicAiClassifierProvider } from './providers/anthropic.provider';
import { OpenAiClassifierProvider } from './providers/openai.provider';

@Module({
  providers: [
    AiTriageService,
    MockAiClassifierProvider,
    AnthropicAiClassifierProvider,
    OpenAiClassifierProvider,
  ],
  exports: [AiTriageService],
})
export class AiTriageModule {}
