import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose'; // ✅ thêm isValidObjectId
import { StoreProfile, StoreProfileDocument } from './schemas/store-profile.schema';
import { CreateStoreProfileDto } from './dto/create-store-profile.dto';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class StoreProfileService {
  constructor(
    @InjectModel(StoreProfile.name) private storeProfileModel: Model<StoreProfileDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findByUserId(userId: string): Promise<StoreProfileDocument | null> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('userId không hợp lệ');
    }
    return this.storeProfileModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
  }

  async create(userId: string, dto: CreateStoreProfileDto): Promise<StoreProfileDocument> {
    const exists = await this.findByUserId(userId);
    if (exists) {
      throw new BadRequestException('Bạn đã đăng ký nhà cung cấp rồi');
    }

    const created = new this.storeProfileModel({
      userId: new Types.ObjectId(userId),
      ...dto,
      isApproved: false,
    });

    return created.save();
  }

async createOrUpdate(userId: string, dto: CreateStoreProfileDto): Promise<StoreProfileDocument> {
  if (!isValidObjectId(userId)) {
    throw new BadRequestException('userId không hợp lệ');
  }

  const existing = await this.storeProfileModel.findOne({ userId: new Types.ObjectId(userId) });

  if (existing) {
    existing.storeName = dto.storeName;
    existing.phone = dto.phone;
    existing.address = dto.address;
    existing.imageUrl = dto.imageUrl ?? '';

    // Nếu đã bị từ chối => cho phép sửa và gửi lại -> reset trạng thái
    if (existing.isRejected) {
      existing.isRejected = false;
      existing.isApproved = false;
    }

    return existing.save();
  } else {
    // Nếu chưa có hồ sơ => tạo mới
    const created = new this.storeProfileModel({
      userId: new Types.ObjectId(userId),
      ...dto,
      isApproved: false,
      isRejected: false,
    });
    return created.save();
  }
}


  async findAll(): Promise<StoreProfileDocument[]> {
    return this.storeProfileModel.find().populate('userId', 'name email').exec();
  }

  async approveProfile(id: string): Promise<StoreProfileDocument> {
    const profile = await this.storeProfileModel.findById(id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    profile.isApproved = true;
    await profile.save();

    await this.userModel.findByIdAndUpdate(profile.userId, { role: 'supplier' });

    return profile;
  }

  async findById(id: string): Promise<StoreProfile | null> {
    return this.storeProfileModel.findById(id).exec();
  }

  async findApprovedStores(): Promise<StoreProfileDocument[]> {
  return this.storeProfileModel
    .find({ isApproved: true })
    .populate('userId', 'name email')
    .exec();
}
async rejectProfile(id: string): Promise<StoreProfileDocument> {
  const profile = await this.storeProfileModel.findById(id);
  if (!profile) {
    throw new NotFoundException('Không tìm thấy hồ sơ');
  }

  profile.isApproved = false;
  profile.isRejected = true;
  await profile.save();

  return profile;
}

}
