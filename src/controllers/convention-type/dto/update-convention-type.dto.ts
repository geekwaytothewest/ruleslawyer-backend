import { PartialType } from '@nestjs/swagger';
import { CreateConventionTypeDto } from './create-convention-type.dto';

// Every field optional so a caller can patch a subset of the convention type.
export class UpdateConventionTypeDto extends PartialType(CreateConventionTypeDto) {}
