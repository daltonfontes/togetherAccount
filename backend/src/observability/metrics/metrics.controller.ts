import { Controller, Get, Header, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Public } from '@/modules/auth/decorators/public.decorator';
import { RawResponse } from '@/common/decorators/raw-response.decorator';
import { MetricsService } from './metrics.service';

@ApiExcludeController()
@Controller({ path: 'metrics', version: VERSION_NEUTRAL })
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Public()
  @RawResponse()
  @Get()
  @Header('Content-Type', 'text/plain')
  async getMetrics(): Promise<string> {
    return this.metricsService.registry.metrics();
  }
}
