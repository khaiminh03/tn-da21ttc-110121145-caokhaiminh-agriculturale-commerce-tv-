# tn-da21ttc-110121145-caokhaiminh-agriculturale-commerce-tv-
# 🌾 SÀN THƯƠNG MẠI ĐIỆN TỬ NÔNG SẢN TRÀ VINH

## 📌 MỤC TIÊU ĐỒ ÁN

Xây dựng một hệ thống sàn thương mại điện tử chuyên biệt cho lĩnh vực **nông sản tại tỉnh Trà Vinh**, hỗ trợ:

- **Người dùng (khách hàng)**: mua sắm, đặt hàng, thanh toán, đánh giá sản phẩm.
- **Nhà cung cấp (nông dân, HTX)**: đăng bán sản phẩm, quản lý đơn hàng.
- **Quản trị viên**: duyệt sản phẩm, kiểm soát nội dung, theo dõi hệ thống.
- Hỗ trợ **thanh toán trực tuyến**, **theo dõi đơn hàng thời gian thực**, và **chatbot chăm sóc khách hàng**.

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
