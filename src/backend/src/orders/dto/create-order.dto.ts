import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsString()
  supplierId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  customerId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNumber()
  totalAmount: number;

  @IsString()
  shippingAddress: string;

  @IsString()
  paymentMethod: string;

  @IsEnum(['Chưa thanh toán', 'Đã thanh toán', 'Đã huỷ'])
  status: string;
}
