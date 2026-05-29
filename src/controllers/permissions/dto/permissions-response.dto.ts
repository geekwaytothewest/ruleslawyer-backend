import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../../common/entities/user.entity';
import { UserOrganizationPermissionsEntity } from '../../../common/entities/user-organization-permissions.entity';
import { UserConventionPermissionsEntity } from '../../../common/entities/user-convention-permissions.entity';

// Composite response for GET /permissions/:id — the user plus their scoped
// organization and convention permissions.
export class PermissionsResponseDto {
  @ApiProperty({ type: UserEntity })
  user: UserEntity;

  @ApiProperty({ type: UserOrganizationPermissionsEntity, isArray: true })
  organizations: UserOrganizationPermissionsEntity[];

  @ApiProperty({ type: UserConventionPermissionsEntity, isArray: true })
  conventions: UserConventionPermissionsEntity[];
}
