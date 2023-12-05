import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
	use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
		const requestId = uuidv4();
		const requestPayload = {
			message: 'request',
			urL: req.url,
			requestId: requestId
		};
		const responsePayload = {
			message: 'response',
			requestId: requestId,
			status: res.statusCode
		};

		Logger.log(requestPayload);
		Logger.log(responsePayload);
    next();
  }
}
