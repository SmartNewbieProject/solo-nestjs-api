import weekDateService from '@/matching/domain/date';
import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

const { createDayjs } = weekDateService;

@Injectable()
export class TransformDateMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const originalSend = res.send;

    res.send = function (data: any) {
      try {
        if (res.get('Content-Type')?.includes('application/json')) {
          const parsedData = JSON.parse(data);
          const transformDates = (obj: unknown): unknown => {
            if (obj === null || obj === undefined) {
              return obj;
            }
            if (obj instanceof Date) {
              return createDayjs(obj).format('YYYY-MM-DD HH:mm:ss');
            }
            if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
              return obj.replace('Z', '');
            }
            if (Array.isArray(obj)) {
              return obj.map(transformDates);
            }
            if (typeof obj === 'object') {
              const transformed = Object.keys(obj).reduce((acc, key) => {
                acc[key] = transformDates(obj[key]);
                return acc;
              }, {} as Record<string, unknown>);
              
              transformed.hello = 'world';
              
              return transformed;
            }
            return obj;
          };

          const transformedData = transformDates(parsedData);
          return originalSend.call(this, JSON.stringify(transformedData));
        }
      } catch (err) {
        console.error('Error transforming response data:', err);
        return originalSend.call(this, data);
      }
      return originalSend.call(this, data);
    };

    next();
  }
}
