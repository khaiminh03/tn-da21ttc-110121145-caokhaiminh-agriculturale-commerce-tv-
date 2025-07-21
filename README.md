# 🌾 XÂY DỰNG SÀN THƯƠNG MẠI ĐIỆN TỬ LĨNH VỰC NÔNG SẢN Ở TRÀ VINH

## 📌 MỤC TIÊU ĐỒ ÁN

Xây dựng một hệ thống sàn thương mại điện tử chuyên biệt cho lĩnh vực **nông sản tại tỉnh Trà Vinh**
### Yêu cầu chức năng
Khách hàng
- Đăng ký/đăng nhập
- Tìm kiếm sản phẩm theo tên, danh mục, giá.
- Lọc sản phẩm theo các tiêu chí: giá, loại nông sản.
- Xem trang chi tiết sản phẩm: hình ảnh, mô tả.
- Thêm sản phẩm vào giỏ hàng, chỉnh sửa số lượng và thanh toán.
- Xem giỏ hàng, tính tổng tiền, phí vận chuyển (nếu có).
- Xem lịch sử đơn hàng với trạng thái: đang xử lý, đang giao, đã giao, đã hủy.
- Xem chi tiết từng đơn: sản phẩm, số lượng, tổng tiền, thời gian.
- Đánh giá sao (1-5) cho từng sản phẩm đã mua.
Nhà cung cấp
- Thêm mới sản phẩm: tên, ảnh, mô tả, thành phần, giá bán, số lượng tồn kho.
- Sửa, xoá sản phẩm đã đăng.
- Cập nhật trạng thái sản phẩm: còn hàng, hết hàng, tạm ngừng bán..
- Xem danh sách đơn hàng mới, đang xử lý, đã giao.
- Cập nhật trạng thái đơn hàng (Chờ xác nhận, Đã xác nhận, Đang giao hàng, Giao thất bại, Hoàn thành, Đã hủy).
- Thống kê doanh thu.
Quản trị
- Xem danh sách tất cả khách hàng và nhà cung cấp.
- Khóa/mở khóa tài khoản người dùng.
- Quản lý danh mục nông sản (thêm,sửa).
- Xem và quản lý tất cả sản phẩm trên sàn.
- Xem chi tiết đơn hàng, trạng thái xử lý của đơn hàng.
- Duyệt sản phẩm mà nhà cung cấp đăng bán.
- Xem tất cả các đánh giá về sản phẩm, có thể xóa nếu không phù hợp.
- Thống kê doanh thu.
---
## 🏗️ KIẾN TRÚC HỆ THỐNG

Hệ thống sử dụng mô hình **Client-Server** gồm 2 phần chính:

### 1. Frontend (Giao diện người dùng)
- **Công nghệ**: [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **Chức năng**: Hiển thị giao diện, thực hiện các thao tác như đăng nhập, đặt hàng, thanh toán...

### 2. Backend (Máy chủ API)
- **Công nghệ**: [NestJS](https://nestjs.com/) + [MongoDB](https://www.mongodb.com/)
- **Chức năng**: Xử lý nghiệp vụ (auth, sản phẩm, đơn hàng, thanh toán...), cung cấp RESTful API.

### ⚙️ Sơ đồ kiến trúc tổng quan:

```text
                ┌────────────┐       HTTP API        ┌────────────┐
                │  Frontend  │ <───────────────────> │  Backend   │
                │  (Vite)    │                       │ (NestJS)   │
                └────────────┘                       └────────────┘
                                                            │
                                                            ▼
                                                    ┌────────────┐
                                                    │  MongoDB   │
                                                    └────────────┘
