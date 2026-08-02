import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();
    const start = process.hrtime.bigint();
    const route = request.route?.path || request.path || 'unknown';

    return next.handle().pipe(
      tap({
        next: () => this.recordMetric(request.method, route, response.statusCode, start),
        error: () => this.recordMetric(request.method, route, response.statusCode || 500, start),
      }),
    );
  }

  private recordMetric(method: string, route: string, statusCode: number, start: bigint) {
    const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;
    const labels = { method, route, status_code: String(statusCode) };
    this.metricsService.httpRequestDuration.observe(labels, durationSeconds);
    this.metricsService.httpRequestsTotal.inc(labels);
  }
}
