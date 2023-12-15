import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { MiddlewareRequest, MiddlewareResponse } from './request.middleware';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
	private readonly logger = new Logger(LoggerMiddleware.name);
	use(req: MiddlewareRequest, res: MiddlewareResponse, next: () => void) {

		const requestPayload = {
			message: 'application request',
			url: req.originalUrl,
			requestId: req.id
		};
		const responsePayload = {
			message: 'application request',
			requestId: req.id,
			statusCode: res.statusCode
		};
		this.logger.log(requestPayload);
		this.logger.log(responsePayload);
    next();
  }
}
