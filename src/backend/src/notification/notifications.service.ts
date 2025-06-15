import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  async createNotification(dto: CreateNotificationDto) {
    return await this.notificationModel.create({
      userId: new Types.ObjectId(dto.userId),
      title: dto.title,
      content: dto.content,
      isRead: false,
    });
  }

  async getUserNotifications(userId: string) {
    const objectId = new Types.ObjectId(userId);
    return this.notificationModel
      .find({ userId: objectId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async markAsRead(notificationId: string) {
    return this.notificationModel.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true },
    ).exec();
  }
}
