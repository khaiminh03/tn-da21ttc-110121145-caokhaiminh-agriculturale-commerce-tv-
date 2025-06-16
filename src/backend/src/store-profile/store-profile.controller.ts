import {
  Controller, Get, Post, Body, Req, UseGuards, Patch, Param,
  UploadedFile, UseInterceptors, UnauthorizedException
} from '@nestjs/common';
import { StoreProfileService } from './store-profile.service';
import { CreateStoreProfileDto } from './dto/create-store-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

interface JwtRequest extends Request {
  user: { userId: string; role: string };
}

@Controller('store-profiles')
export class StoreProfileController {
  constructor(private readonly storeProfileService: StoreProfileService) {}

  // ======= 1. Hồ sơ của người dùng hiện tại =======
  @UseGuards(JwtAuthGuard)
  @Get('my-profile')
  async getMyProfile(@Req() req: JwtRequest) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('Thiếu thông tin người dùng');
    }

    const profile = await this.storeProfileService.findByUserId(req.user.userId);
    if (!profile) {
      return { message: 'Chưa đăng ký nhà cung cấp', isComplete: false, isApproved: false };
    }

    const isComplete = !!profile.storeName && !!profile.phone && !!profile.address;

    return {
      storeName: profile.storeName,
      phone: profile.phone,
      address: profile.address,
      imageUrl: profile.imageUrl,
      isApproved: profile.isApproved,
      isRejected: profile.isRejected,
      isComplete,
    };
  }

  // ======= 2. Tạo hoặc cập nhật hồ sơ nhà cung cấp =======
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './uploads/store-profile';
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async create(
    @Req() req: JwtRequest,
    @Body() dto: CreateStoreProfileDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('Thiếu thông tin người dùng');
    }

    const imageUrl = image
    ? `/store-profile/${image.filename}`
    : dto.imageUrl ?? '';
    return this.storeProfileService.createOrUpdate(req.user.userId, {
      ...dto,
      imageUrl,
    });
  }
@UseGuards(JwtAuthGuard)
@Get('admin/all')
async getAllProfiles() {
  return this.storeProfileService.findAll();
}
  // ======= 3. Duyệt hồ sơ =======
  @Patch(':id/approve')
  async approve(@Param('id') id: string) {
    return this.storeProfileService.approveProfile(id);
  }

  // ======= 4. Lấy hồ sơ theo userId hoặc id =======
  @Get('by-user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    const profile = await this.storeProfileService.findByUserId(userId);
    if (!profile) {
      return { message: 'Không tìm thấy hồ sơ nhà cung cấp' };
    }
    return profile;
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const profile = await this.storeProfileService.findById(id);
    if (!profile) {
      return { message: 'Không tìm thấy hồ sơ nhà cung cấp' };
    }
    return profile;
  }

  // ======= 5. Lấy danh sách hồ sơ =======
  @Get() // Trả về chỉ các hồ sơ đã được duyệt
  async getApprovedStores() {
    return this.storeProfileService.findApprovedStores();
  }
@Patch(':id/reject')
async reject(@Param('id') id: string) {
  return this.storeProfileService.rejectProfile(id);
}
}
