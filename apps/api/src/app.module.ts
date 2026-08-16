import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { HealthController } from './health/health.controller';
import { AiAssistanceController } from './ai-assistance/ai-assistance.controller';
import { AiAssistanceService } from './ai-assistance/ai-assistance.service';
import { MockAiProvider } from './ai-assistance/mock-ai.provider';
import { GeminiAiProvider } from './ai-assistance/gemini-ai.provider';
import { GroqAiProvider } from './ai-assistance/groq-ai.provider';
import { PublicIntegrationController } from './public-integration/public-integration.controller';
import { PublicIntegrationService } from './public-integration/public-integration.service';

@Module({
  imports: [],
  controllers: [HealthController, AiAssistanceController, PublicIntegrationController],
  providers: [
    PrismaService,
    AiAssistanceService,
    MockAiProvider,
    GeminiAiProvider,
    GroqAiProvider,
    PublicIntegrationService,
  ],
})
export class AppModule {}