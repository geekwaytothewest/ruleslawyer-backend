import { Injectable, LogLevel, LoggerService, Logger } from '@nestjs/common';
import { ClsService, ClsServiceManager } from 'nestjs-cls';

export class RuleslawyerLogger implements LoggerService {
  private logger: Logger;
  private cls: ClsService;
  constructor(context: string) {
    this.logger = new Logger(context);
    this.cls = ClsServiceManager.getClsService();
  }
  error(message: any, ...optionalParams: any[]) {
    this.logger.error(
      `${message}; traceId=${this.cls.getId()}`,
      optionalParams,
    );
  }
  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(`${message}; traceId=${this.cls.getId()}`, optionalParams);
  }
  debug?(message: any, ...optionalParams: any[]) {
    this.logger.debug(
      `${message}; traceId=${this.cls.getId()}`,
      optionalParams,
    );
  }
  verbose?(message: any, ...optionalParams: any[]) {
    this.logger.verbose(
      `${message}; traceId=${this.cls.getId()}`,
      optionalParams,
    );
  }
  fatal?(message: any, ...optionalParams: any[]) {
    this.logger.fatal(
      `${message}; traceId=${this.cls.getId()}`,
      optionalParams,
    );
  }
  log(message: string) {
    this.logger.log(`${message}; traceId=${this.cls.getId()}`);
  }
}
