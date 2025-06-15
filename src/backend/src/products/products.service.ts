import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { StoreProfile, StoreProfileDocument } from '../store-profile/schemas/store-profile.schema';
import { Notification } from '../notification/schemas/notification.schema';

interface SupplierPopulated {
  _id: Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  storeName?: string;
  imageUrl?: string;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(StoreProfile.name) private storeProfileModel: Model<StoreProfileDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const createdProduct = new this.productModel({
      ...createProductDto,
      status: createProductDto.status || 'pending',
    });
    return createdProduct.save();
  }

  async findAll(): Promise<Product[]> {
  return this.productModel
    .find({ isActive: true, status: 'approved' }) // ✅ đã duyệt mới cho khách xem
    .sort({ createdAt: -1 })
    .exec();
}
 async findWithFilter(filter: any): Promise<any[]> {
  const products = await this.productModel
    .find(filter)
    .sort({ createdAt: -1 })
    .lean();

  // Lấy storeName từ bảng storeprofiles
  for (const product of products) {
    const supplierId = product.supplierId;
    const storeProfile = await this.storeProfileModel.findOne({ userId: supplierId }).lean();
    if (storeProfile) {
      (product as any).storeName = storeProfile.storeName;
    }
  }

  return products;
}



  async findOne(id: string): Promise<any> {
    const product = await this.productModel.findById(id)
      .populate('supplierId', 'name email phone address')
      .lean();

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    if (!product.supplierId) {
      return product;
    }

    const supplier = product.supplierId as unknown as SupplierPopulated;

    const storeProfile = await this.storeProfileModel.findOne({ userId: supplier._id }).lean();

    if (storeProfile) {
      supplier.storeName = storeProfile.storeName;
      supplier.imageUrl = storeProfile.imageUrl;
      supplier.address = storeProfile.address;
      supplier.phone = storeProfile.phone;
    }

    return product;
  }

  async getByCategoryId(categoryId: string): Promise<Product[]> {
    return this.productModel
      .find({
        categoryId: new Types.ObjectId(categoryId.trim()),
        isActive: true,
      })
      .exec();
  }

  async getProductsBySupplier(supplierId: Types.ObjectId): Promise<Product[]> {
    return this.productModel
      .find({ supplierId, isActive: true })
      .sort({ createdAt: -1 })
      .exec();
  }

 async searchByName(keyword: string): Promise<Product[]> {
  return this.productModel.find({
    name: { $regex: keyword, $options: 'i' },
    isActive: true,
    status: 'approved',
  }).exec();
}

async updateById(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
  const updateQuery: any = {
    ...updateProductDto,
  };

  // Nếu là gửi lại sản phẩm => xóa rejectionReason
  if (updateProductDto.status === 'pending') {
    updateQuery.$unset = { rejectionReason: '' };
  }

  const updated = await this.productModel.findByIdAndUpdate(id, updateQuery, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    throw new NotFoundException(`Product with id ${id} not found`);
  }

  // Nếu bị từ chối → tạo thông báo
  if (updateProductDto.status === 'rejected') {
    const supplierId = updated.supplierId;
    const title = 'Sản phẩm bị từ chối';
    const message = `Sản phẩm "${updated.name}" của bạn đã bị từ chối. Lý do: ${updateProductDto.rejectionReason}`;

    await this.notificationModel.create({
      userId: supplierId,
      title,
      content: message,
    });
  }

  return updated;
}


  async deleteById(id: string): Promise<{ deleted: boolean }> {
    const result = await this.productModel.deleteOne({ _id: id }).exec();
    return { deleted: result.deletedCount > 0 };
  }


}
