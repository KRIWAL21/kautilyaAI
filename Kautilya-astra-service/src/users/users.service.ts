import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { User, UserRole } from './schemas/user.schema';

@Injectable()
export class UsersService {
  private twilioClient: Twilio;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    if (accountSid && authToken) {
        this.twilioClient = new Twilio(accountSid, authToken);
    }
  }

  async sendOtp(phone: string) {
    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp = '123456';
    const otpExpiry = new Date(Date.now() + 5 * 60000);

    let user = await this.userModel.findOne({ phoneNumber: phone });
    if (!user) {
      user = new this.userModel({ phoneNumber: phone, name: 'New User' });
    }
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // const twilioPhone = this.configService.get<string>('TWILIO_PHONE_NUMBER');
    // if (!this.twilioClient || !twilioPhone) {
    //     console.log(`[DEV MODE] Mock OTP for ${phone} is: ${otp}`);
    //     return { status: 'success', message: 'Mock OTP logged in console' };
    // }
    // 
    // try {
    //   await this.twilioClient.messages.create({
    //     body: `Your Chanakya Astra login code is: ${otp}. Do not share this code with anyone.`,
    //     from: twilioPhone,
    //     to: phone,
    //   });
    //   return { status: 'success', message: 'OTP sent via Twilio' };
    // } catch (error) {
    //   console.error('Twilio SMS Error:', error);
    //   throw new Error('Failed to send SMS');
    // }

    // Always log it and succeed for now
    console.log(`[DEV MODE] OTP for ${phone} is fixed to: ${otp}`);
    return { status: 'success', message: 'OTP generated successfully' };
  }

  async verifyOtpAndLogin(phone: string, otp: string) {
    const user = await this.userModel.findOne({ phoneNumber: phone });
    if (!user || user.otp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }
    if (user.otpExpiry && user.otpExpiry < new Date()) {
      throw new UnauthorizedException('OTP has expired');
    }

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Include profileComplete in JWT payload so frontend knows whether to show onboarding
    const payload = {
      sub: user._id,
      phone: user.phoneNumber,
      role: user.role ?? 'broker',
      profileComplete: user.profileComplete ?? false,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken, user };
  }

  /**
   * Called right after OTP verify when user hasn't completed their profile.
   * Requires name, role, city — updates DB and sets profileComplete = true.
   */
  async completeProfile(
    userId: string,
    data: { name: string; role: UserRole; city: string },
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    user.name = data.name.trim();
    user.role = data.role;
    user.city = data.city.trim();
    user.profileComplete = true;
    await user.save();

    return user;
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid user ID: "${id}"`);
    }
    const user = await this.userModel.findById(id).lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /** Updates user's portal role (BROKER | BUILDER | CLIENT) */
  async setRole(userId: string, role: UserRole) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: { role } },
      { new: true },
    ).lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(id: string, updateData: Partial<User>) {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
