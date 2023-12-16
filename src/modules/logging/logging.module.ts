import { Module } from '@nestjs/common';
import { RuleslawyerLogger } from 'src/utils/ruleslawyer.logger';

@Module({
  providers: [RuleslawyerLogger],
  exports: [RuleslawyerLogger],
})
export class LoggingModule {}
