import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const ip = request.ip;
    
    // In a real app, this comes from the JWT AuthGuard injecting request.user
    const brokerId = request.user?.id || 'anonymous_or_pending_auth';

    return next.handle().pipe(
      tap(() => {
        // Fire and forget log saving (asynchronous, doesn't block the API response!)
        this.auditService.logAction({
          brokerId,
          action: method,
          resource: url,
          ipAddress: ip,
          metadata: { body: request.body, query: request.query },
        }).catch(err => console.error('Failed to save audit log:', err));
      }),
    );
  }
}
