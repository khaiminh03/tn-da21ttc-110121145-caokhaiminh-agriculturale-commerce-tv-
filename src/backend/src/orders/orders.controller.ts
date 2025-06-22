import { Controller, Post, Body, Get, Param, Patch, Query, HttpException, HttpStatus } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './schemas/order.schema';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // 1. Tạo đơn hàng
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    try {
      return await this.ordersService.create(createOrderDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // 2. Lấy toàn bộ đơn hàng
  @Get()
  async getAll() {
    try {
      return await this.ordersService.getOrdersWithProductDetails();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 3. Lấy theo customer
  @Get('customer/:id')
  async getByCustomer(@Param('id') customerId: string) {
    try {
      return await this.ordersService.getOrdersByCustomerId(customerId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // 4. Lấy theo supplier
  @Get('supplier/:id')
  async getOrdersBySupplier(@Param('id') supplierId: string) {
    return this.ordersService.getOrdersBySupplierId(supplierId);
  }

  @Get('supplier/:id/revenue')
  async getRevenueBySupplier(
    @Param('id') supplierId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.ordersService.calculateRevenueBySupplier(supplierId, from, to);
  }

  @Get('supplier/:id/daily-revenue')
  async getDailyRevenue(
    @Param('id') supplierId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.ordersService.getDailyRevenue(supplierId, from, to);
  }

  @Get('supplier/:id/top-products')
  async getTopProducts(
    @Param('id') supplierId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.ordersService.getTopProducts(supplierId, from, to);
  }
  @Get('best-selling')
async getBestSellingProducts(@Query('limit') limit: string) {
  const limitNumber = parseInt(limit) || 10;
  return this.ordersService.getBestSellingProducts(limitNumber);
}

  @Get('supplier/:id/order-status')
  async getOrderStatusSummary(
    @Param('id') supplierId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.ordersService.getOrderStatusSummary(supplierId, from, to);
  }
// 📦 Thống kê trạng thái đơn hàng toàn hệ thống
@Get('order-status-summary')
async getAllOrderStatusSummary(
  @Query('from') from?: string,
  @Query('to') to?: string,
) {
  return this.ordersService.getAllOrderStatusSummary(from, to);
}
// 📦 Top sản phẩm bán chạy toàn hệ thống
@Get('top-products')
getTopProductsAllSystem(
  @Query('from') from?: string,
  @Query('to') to?: string,
  @Query('limit') limit?: string,
) {
  const parsedLimit = limit ? parseInt(limit) : 10; // Mặc định lấy 10 nếu không truyền
  return this.ordersService.getTopProductsAllSystem(from, to, parsedLimit);
}
@Patch(':id')
async updateOrder(@Param('id') id: string, @Body() updates: Partial<Order>) {
  return this.ordersService.updateOrder(id, updates);
}

  // 📊 Thống kê cho admin (KHÔNG THEO NHÀ CUNG CẤP)
  @Get('revenue-summary')
  getRevenueSummary(@Query('unit') unit: 'day' | 'month' | 'year') {
    return this.ordersService.getRevenueSummaryByPeriod(unit);
  }

  @Get('supplier-revenue')
  getRevenueBySuppliers() {
    return this.ordersService.getRevenueGroupedBySuppliers();
  }

  @Get('order-summary')
  getOrderSummary() {
    return this.ordersService.getOrderCountSummary();
  }

  @Get('product-count')
  getTotalApprovedProducts() {
    return this.ordersService.getTotalApprovedProducts();
  }

  @Get('stock-by-category')
  getStockByCategory() {
    return this.ordersService.getStockByCategory();
  }

  // 5. Cập nhật trạng thái đơn hàng
  @Patch(':orderId/status')
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body('status') status: string
  ) {
    return this.ordersService.updateOrderStatus(orderId, status);
  }

  @Patch(':id/shipping-status')
  updateShippingStatus(
    @Param('id') orderId: string,
    @Body('shippingStatus') shippingStatus: string,
  ) {
    return this.ordersService.updateShippingStatus(orderId, shippingStatus);
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    const order = await this.ordersService.findById(id);
    if (!order) {
      throw new HttpException('Đơn hàng không tồn tại', HttpStatus.NOT_FOUND);
    }
    return order;
  }
  @Patch(':id/cancel')
async cancelOrder(@Param('id') id: string) {
  return this.ordersService.cancelOrder(id);
}

}
