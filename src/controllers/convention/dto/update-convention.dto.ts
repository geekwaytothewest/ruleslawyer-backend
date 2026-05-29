import { PartialType } from '@nestjs/swagger';
import { CreateConventionDto } from './create-convention.dto';

// Every field optional so a caller can patch a subset of the convention.
export class UpdateConventionDto extends PartialType(CreateConventionDto) {}
