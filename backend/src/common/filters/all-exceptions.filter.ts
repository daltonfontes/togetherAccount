import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

interface ErrorResponseBody {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error: string;
  details?: unknown;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionsHandler');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message, error, details } = this.resolveException(exception);

    const body: ErrorResponseBody = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
      ...(details !== undefined ? { details } : {}),
    };

    if (statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.url} -> ${statusCode}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`${request.method} ${request.url} -> ${statusCode}: ${message}`);
    }

    response.status(statusCode).json(body);
  }

  private resolveException(exception: unknown): {
    statusCode: number;
    message: string | string[];
    error: string;
    details?: unknown;
  } {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null) {
        const responseObj = response as Record<string, unknown>;
        const message =
          typeof responseObj.message === 'string' || Array.isArray(responseObj.message)
            ? (responseObj.message as string | string[])
            : exception.message;
        const error = typeof responseObj.error === 'string' ? responseObj.error : exception.name;

        // Some exceptions (e.g. Terminus HealthCheckError) carry a structured
        // payload beyond `message`/`error`/`statusCode` — e.g. `status`, `info`,
        // `details`, or a non-string `error` describing which checks failed and
        // why. Surface it instead of silently discarding it.
        const rest: Record<string, unknown> = { ...responseObj };
        delete rest.message;
        delete rest.statusCode;
        if (typeof rest.error === 'string') {
          delete rest.error;
        }

        return {
          statusCode: exception.getStatus(),
          message,
          error,
          details: Object.keys(rest).length > 0 ? rest : undefined,
        };
      }
      return {
        statusCode: exception.getStatus(),
        message: exception.message,
        error: exception.name,
      };
    }

    if (exception instanceof QueryFailedError) {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: 'Database constraint violation',
        error: 'QueryFailedError',
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'InternalServerError',
    };
  }
}
