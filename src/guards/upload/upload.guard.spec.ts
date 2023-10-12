import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../services/user/user.service';
import { BadRequestException, ExecutionContext } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { UploadGuard } from './upload.guard';

describe('UploadGuard', () => {
  let guard: UploadGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [UploadGuard, UserService],
    }).compile();

    guard = module.get<UploadGuard>(UploadGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true with file', () => {
    const ctx = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          file: () => ({
            toBuffer: () => 'thisisabuffer',
            fields: ['an', 'array'],
          }),
          isMultipart: () => ({}),
        }),
      }),
    });

    const filed = guard.canActivate(ctx);

    expect(filed).toBeTruthy();
  });

  it('should return be a bad request', () => {
    const ctx = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          file: () => ({
            toBuffer: () => 'thisisabuffer',
            fields: ['an', 'array'],
          }),
          isMultipart: () => false,
        }),
      }),
    });

    expect(guard.canActivate(ctx)).rejects.toThrow(BadRequestException);
  });
});
