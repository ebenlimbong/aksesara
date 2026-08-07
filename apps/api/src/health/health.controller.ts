import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Mengecek status kesehatan server REST API' })
  check() {
    return {
      status: 'ok',
      service: 'aksesara-api',
      timestamp: new Date().toISOString(),
    };
  }
}
