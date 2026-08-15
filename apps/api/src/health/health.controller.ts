import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  @Get()
  @ApiOperation({ summary: "Check health status of Aksesara Backend API" })
  check() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "Aksesara API",
      version: "0.1.0"
    };
  }
}
