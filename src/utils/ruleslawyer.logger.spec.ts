import { RuleslawyerLogger } from './ruleslawyer.logger';

describe('RuleslawyerLogger', () => {
  let logger: RuleslawyerLogger;
  let underlying: any;

  beforeEach(() => {
    logger = new RuleslawyerLogger('TestContext');
    // Make the traceId deterministic instead of relying on a real CLS context.
    (logger as any).cls = { getId: () => 'trace-1' };
    underlying = (logger as any).logger;
    jest.spyOn(underlying, 'error').mockImplementation(() => {});
    jest.spyOn(underlying, 'warn').mockImplementation(() => {});
    jest.spyOn(underlying, 'debug').mockImplementation(() => {});
    jest.spyOn(underlying, 'verbose').mockImplementation(() => {});
    jest.spyOn(underlying, 'fatal').mockImplementation(() => {});
    jest.spyOn(underlying, 'log').mockImplementation(() => {});
  });

  it('appends the traceId on error', () => {
    logger.error('boom', 'extra');
    expect(underlying.error).toHaveBeenCalledWith('boom; traceId=trace-1', [
      'extra',
    ]);
  });

  it('appends the traceId on warn', () => {
    logger.warn('careful');
    expect(underlying.warn).toHaveBeenCalledWith('careful; traceId=trace-1', []);
  });

  it('appends the traceId on debug', () => {
    logger.debug!('details');
    expect(underlying.debug).toHaveBeenCalledWith('details; traceId=trace-1', []);
  });

  it('appends the traceId on verbose', () => {
    logger.verbose!('noisy');
    expect(underlying.verbose).toHaveBeenCalledWith('noisy; traceId=trace-1', []);
  });

  it('appends the traceId on fatal', () => {
    logger.fatal!('dead');
    expect(underlying.fatal).toHaveBeenCalledWith('dead; traceId=trace-1', []);
  });

  it('appends the traceId on log', () => {
    logger.log('hello');
    expect(underlying.log).toHaveBeenCalledWith('hello; traceId=trace-1');
  });
});
