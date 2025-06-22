import React from "react";
import { Route, Routes, useLocation, matchPath } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages & Components
import Home from "./pages/Home";
import CategoryPage from './pages/CategoryPage';
import AddProduct from "./pages/AddProduct";
import RegisterForm from "./pages/RegisterForm";
import ProductDetail from "./pages/ProductDetail";
import Footer from "./components/Footer";
import Cart from "./pages/Cart";
import Navbar from "./components/Navbar";
import MyOrders from "./pages/MyOrders";
import ProductsByCategory from "./components/ProductByCategory";
import SellerLayout from "./pages/SellerLayout";
import ProductsPage from "./pages/ProductsPage";
import AllProducts from "./components/AllProducts";
import SearchPage from "./components/SearchPage";
import LoginForm from "./components/LoginForm";
import SupplierOrderManagement from "./pages/SupplierOrderManagement";
import SupplierRevenueDashboard from "./pages/SupplierRevenueDashboard";
import AdminLayout from "./pages/AdminLayout";
import AdminSupplierList from "./components/AdminSupplierList";
import UserManagement from "./components/UserManagement";
import AllProductPage from "./components/AllProductPage";
import AdminOrders from "./pages/AdminOrder";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPasswordForm from "./pages/ForgotPasswordForm";
import ResetPasswordForm from "./pages/ResetPasswordForm";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPendingProducts from "./pages/AdminPendingProducts";
import AdminReviewList from "./pages/AdminReviewList";
import ProductCardEdit from "./pages/ProductCardEdit";
import AdminCharts from "./pages/AdminCharts";
import SellerProfileForm from "./pages/SellerProfileForm";
import SupplierStore from "./pages/SupplierStore";

const App: React.FC = () => {
  const location = useLocation();

  // Danh sách route công khai
  const publicPatterns = [
    "/", "/add", "/sp", "/sign", "/login", "/cart", "/myorder",
    "/products", "/products/category/:categoryId", "/product/:id",
    "/search", "/verify-email", "/forgot-password", "/reset-password",
    "/supplier/:id"
  ];

  // Hiển thị Navbar/Footer nếu KHÔNG thuộc admin/seller và thuộc publicPatterns
  const isPublicRoute =
    !location.pathname.startsWith("/admin") &&
    !location.pathname.startsWith("/seller") &&
    publicPatterns.some((pattern) =>
      matchPath({ path: pattern, end: false }, location.pathname)
    );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar chỉ hiển thị khi là public route */}
      {isPublicRoute && <Navbar />}

      <div className="flex-1 px-6 md:px-16 lg:px-24 xl:px-32">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<CategoryPage />} />
          <Route path="/sp" element={<AddProduct />} />
          <Route path="/sign" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/myorder" element={<MyOrders />} />
          <Route path="/products/category/:categoryId" element={<ProductsByCategory />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/supplier/:id" element={<SupplierStore />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/reset-password" element={<ResetPasswordForm />} />

          {/* Seller (Supplier) Routes */}
          <Route
            path="/seller"
            element={
              <ProtectedRoute allowedRoles={["supplier"]}>
                <SellerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AddProduct />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="overview" element={<ProductsPage />} />
            <Route path="rejected" element={<ProductCardEdit />} />
            <Route path="order" element={<SupplierOrderManagement />} />
            <Route path="revenue" element={<SupplierRevenueDashboard />} />
            <Route path="profile" element={<SellerProfileForm />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<UserManagement />} />
            <Route path="add-user" element={<UserManagement />} />
            <Route path="supplier" element={<AdminSupplierList />} />
            <Route path="category" element={<CategoryPage />} />
            <Route path="allproduct" element={<AllProductPage />} />
            <Route path="adminorder" element={<AdminOrders />} />
            <Route path="adminstatus" element={<AdminPendingProducts />} />
            <Route path="adminreviews" element={<AdminReviewList />} />
            <Route path="adminrevenue" element={<AdminCharts />} />
          </Route>
        </Routes>
      </div>

      {/* Footer chỉ hiển thị khi là public route */}
      {isPublicRoute && <Footer />}

      {/* Thông báo Toast */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default App;
