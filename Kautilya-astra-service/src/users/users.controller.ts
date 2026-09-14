import { Controller, Post, Get, Body, Param, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from './schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  // ── OTP Auth ─────────────────────────────────────────────────
  @Post('auth/send-otp')
  async sendOtp(@Body() body: { phoneNumber: string }) {
    return this.usersService.sendOtp(body.phoneNumber);
  }

  @Post('auth/verify-otp')
  async verifyOtp(@Body() body: { phoneNumber: string; otp: string }) {
    const result = await this.usersService.verifyOtpAndLogin(body.phoneNumber, body.otp);
    return {
      status: 'success',
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
        // Tell the frontend whether to show the profile-completion step
        profileComplete: result.user.profileComplete ?? false,
      },
    };
  }

  // Alias kept for backward compatibility
  @Post('auth/login')
  async login(@Body() body: { phoneNumber: string; otp: string }) {
    const result = await this.usersService.verifyOtpAndLogin(body.phoneNumber, body.otp);
    return {
      status: 'success',
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
        profileComplete: result.user.profileComplete ?? false,
      },
    };
  }

  /**
   * POST /users/auth/select-role
   * Called from the RoleSelectPage after first login.
   * Sets the user's portal role (BROKER | BUILDER | CLIENT) and returns
   * a fresh JWT with the role embedded so the frontend routes correctly.
   */
  @Post('auth/select-role')
  async selectRole(@Request() req: any, @Body() body: { role: UserRole }) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }
    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.usersService.setRole(decoded.sub, body.role);

    // Re-issue token with updated role
    const payload = {
      sub: user._id,
      phone: user.phoneNumber,
      role: user.role,
      profileComplete: user.profileComplete ?? false,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      status: 'success',
      message: `Role set to ${body.role}`,
      data: { accessToken, refreshToken, user },
    };
  }

  // ── Profile Completion (Step 2 after OTP) ───────────────────
  /**
   * POST /users/profile/complete
   * Body: { userId, name, role, city }
   * Called by the frontend immediately after first-time OTP verify.
   */
  @Post('profile/complete')
  async completeProfile(
    @Body() body: { userId: string; name: string; role: UserRole; city: string },
  ) {
    const user = await this.usersService.completeProfile(body.userId, {
      name: body.name,
      role: body.role,
      city: body.city,
    });
    return {
      status: 'success',
      message: 'Profile completed successfully',
      data: { user },
    };
  }

  // ── Profile ──────────────────────────────────────────────────
  @Get('profile/me')
  async getMyProfile(@Request() req: any) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.usersService.findById(decoded.sub);
      return { status: 'success', data: user };
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  @Post('profile/me')
  async updateMyProfile(@Request() req: any, @Body() body: any) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.usersService.updateProfile(decoded.sub, body);
      return { status: 'success', data: user };
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  @Get('profile/:id')
  async getProfile(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return { status: 'success', data: user };
  }
}
