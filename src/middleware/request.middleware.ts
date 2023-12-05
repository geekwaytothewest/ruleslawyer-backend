import { FastifyRequest, FastifyReply } from 'fastify';

export interface MiddlewareRequest extends FastifyRequest {
	id: string; 
	originalUrl: string;
	traceId?: string;
}

export interface MiddlewareResponse extends FastifyReply {
	statusCode: number;
	traceId: string;
}