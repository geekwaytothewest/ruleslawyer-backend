import { ApiProperty } from '@nestjs/swagger';
import { UserOrganizationPermissionsEntity } from './user-organization-permissions.entity';
import { UserConventionPermissionsEntity } from './user-convention-permissions.entity';
import { UserEntity } from './user.entity';
import { ConventionEntity } from './convention.entity';

// Organization permission row with its resolved user (getPermissionsBySearch).
export class UserOrganizationPermissionsWithUserEntity extends UserOrganizationPermissionsEntity {
  @ApiProperty({ type: () => UserEntity })
  user: UserEntity;
}

// Convention permission row with its resolved user (getPermissionsBySearch).
export class UserConventionPermissionsWithUserEntity extends UserConventionPermissionsEntity {
  @ApiProperty({ type: () => UserEntity })
  user: UserEntity;
}

// Convention permission row with its resolved convention
// (userConventionPermissions()).
export class UserConventionPermissionsWithConventionEntity extends UserConventionPermissionsEntity {
  @ApiProperty({ type: () => ConventionEntity })
  convention: ConventionEntity;
}
