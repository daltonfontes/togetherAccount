import { Injectable, OnModuleInit } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  public readonly registry = new client.Registry();

  public readonly httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  });

  public readonly httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  });

  public readonly activeUsers = new client.Gauge({
    name: 'together_account_active_users',
    help: 'Number of currently authenticated active sessions',
  });

  public readonly jobsProcessed = new client.Counter({
    name: 'together_account_jobs_processed_total',
    help: 'Total number of background jobs processed',
    labelNames: ['queue', 'status'],
  });

  onModuleInit() {
    client.collectDefaultMetrics({ register: this.registry });
    this.registry.registerMetric(this.httpRequestDuration);
    this.registry.registerMetric(this.httpRequestsTotal);
    this.registry.registerMetric(this.activeUsers);
    this.registry.registerMetric(this.jobsProcessed);
  }
}
