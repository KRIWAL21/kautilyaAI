import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/schemas/user.schema';

export const ROLES_KEY = 'roles';

/**
 * Attach one or more allowed roles to a controller or route handler.
 * Usage: @Roles('BROKER', 'BUILDER')
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
