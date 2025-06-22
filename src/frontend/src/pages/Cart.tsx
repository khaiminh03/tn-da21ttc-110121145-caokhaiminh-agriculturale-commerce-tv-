import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import SepayPaymentModal from "../components/SepayPaymentModal";

const Cart = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [address, setAddress] = useState("");
  const [showAddress, setShowAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [showSepayModal, setShowSepayModal] = useState(false);
  const [currentOrders, setCurrentOrders] = useState<any[]>([]);
   const [paidNotifiedOrders, setPaidNotifiedOrders] = useState<string[]>([]);
   const [orderStartTimes, setOrderStartTimes] = useState<Record<string, number>>({});

  const navigate = useNavigate();

  const getUserInfo = () => {
    const rawUser = JSON.parse(localStorage.getItem("user_info") || "{}");
    const userInfo = Array.isArray(rawUser) ? rawUser[0] : rawUser;
    if (userInfo.sub && !userInfo._id) {
      userInfo._id = userInfo.sub;
      localStorage.setItem("user_info", JSON.stringify(userInfo));
    }
    return userInfo;
  };

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setProducts(cart);

    const userInfo = getUserInfo();
    if (userInfo?.address && userInfo.address !== "No address found") {
      setAddress(userInfo.address);
    }
  }, []);

  const totalQuantity = products.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = products.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalWithTax = totalPrice;

  const updateQuantity = (index: number, newQty: number) => {
    const updatedProducts = [...products];
    updatedProducts[index].quantity = newQty;
    setProducts(updatedProducts);
    localStorage.setItem("cart", JSON.stringify(updatedProducts));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const removeProduct = (index: number) => {
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
    localStorage.setItem("cart", JSON.stringify(updatedProducts));
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success(`Đã thêm xóa sản phẩm!`);
  };

  const updateAddress = async (newAddress: string) => {
    if (newAddress.trim() === "") {
      toast.success(`Địa chỉ không được để trống`);
      return;
    }

    try {
      const userInfo = getUserInfo();
      const userId = userInfo._id;

      if (!userId) {
        toast.success(`Không thấy thông tin địa chỉ`);
        return;
      }

      const response = await fetch(`http://localhost:5000/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: newAddress }),
      });

      if (!response.ok) {
        toast.success(`Cập nhật địa chỉ thất bại`);
        return;
      }

      userInfo.address = newAddress;
      localStorage.setItem("user_info", JSON.stringify(userInfo));
      setAddress(newAddress);
      setShowAddress(false);
      toast.success("Cập nhật địa chỉ thành công!");
      window.dispatchEvent(new Event("userInfoUpdated"));
    } catch (error) {
      toast.success(`Cập nhật địa chỉ thất bại`);
    }
  };

  const placeOrder = async () => {
  if (products.length === 0) {
    toast.success("Giỏ hàng trống, vui lòng chọn sản phẩm trước khi đặt hàng.");
    return;
  }
  if (!address || address.trim() === "") {
    toast.success("Vui lòng nhập địa chỉ giao hàng hợp lệ!");
    return;
  }

  const userInfo = getUserInfo();
  const userId = userInfo._id;

  if (!userId) {
    toast.success("Thông tin người dùng chưa đầy đủ hoặc bị thiếu.");
    return;
  }

  if (!userInfo.phone || userInfo.phone.trim() === "") {
    toast.warn("Vui lòng cập nhật số điện thoại trước khi đặt hàng!");
    return;
  }

  const orderData = {
    customerId: userId,
    items: products.map((product) => ({
      productId: product._id,
      supplierId: String(product.supplierId && product.supplierId._id ? product.supplierId._id : product.supplierId).trim(),
      quantity: product.quantity,
      price: product.price,
    })),
    totalAmount: totalWithTax,
    shippingAddress: address,
    paymentMethod: paymentMethod === "Online" ? "Thanh toán trực tuyến" : "Thanh toán khi nhận hàng",
  };

  try {
    const response = await fetch("http://localhost:5000/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      alert("Đặt hàng không thành công!");
      return;
    }

    const newOrders = await response.json(); // newOrders: Array of orders
    console.log("🧾 Các đơn hàng đã tạo:", newOrders);

    if (paymentMethod === "Online") {
      setCurrentOrders(newOrders);
      setShowSepayModal(true);

      // ⏰ Huỷ tất cả đơn chưa thanh toán sau 1 phút
      setTimeout(async () => {
        try {
          for (const order of newOrders) {
            const res = await fetch(`http://localhost:5000/orders/${order._id}`);
            const currentOrder = await res.json();

            if (!currentOrder?.isPaid || currentOrder.status !== "Đã thanh toán") {
              await fetch(`http://localhost:5000/orders/${order._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  status: "Đã huỷ",
                  shippingStatus: "Đã hủy",
                }),
              });
            }
          }

          toast.warning("Các đơn hàng chưa thanh toán đã bị huỷ sau 1 phút.");
          setShowSepayModal(false);
          localStorage.removeItem("cart");
          window.dispatchEvent(new Event("cartUpdated"));
          navigate("/myorder");
        } catch (error) {
          console.error("Lỗi khi huỷ đơn:", error);
        }
      }, 60 * 1000);
    } else {
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));
      navigate("/myorder");
    }
  } catch (error) {
    console.error("Lỗi khi đặt hàng:", error);
    alert("Đặt hàng không thành công!");
  }
};

  // 🔁 Theo dõi trạng thái thanh toán


useEffect(() => {
  if (!showSepayModal || currentOrders.length === 0) return;

  // Khởi tạo thời điểm bắt đầu đếm ngược cho từng đơn hàng
  const now = Date.now();
  const startTimes: Record<string, number> = {};
  currentOrders.forEach((order) => {
    startTimes[order._id] = now;
  });
  setOrderStartTimes(startTimes);

  const interval = setInterval(async () => {
    try {
      const updatedOrders = await Promise.all(
        currentOrders.map(async (order) => {
          const res = await fetch(`http://localhost:5000/orders/${order._id}`);
          return res.json();
        })
      );

      const now = Date.now();
      let allFinalized = true;

      for (const order of updatedOrders) {
        if (order.isPaid && !paidNotifiedOrders.includes(order._id)) {
          toast.success(`✅ Đơn hàng ${order._id.slice(-5)} đã được thanh toán!`);
          setPaidNotifiedOrders((prev) => [...prev, order._id]);
        }

        if (!order.isPaid && now - (orderStartTimes[order._id] || 0) >= 60000) {
          // Nếu chưa thanh toán và quá 1 phút
          await fetch(`http://localhost:5000/orders/${order._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "Đã huỷ",
              shippingStatus: "Đã hủy",
            }),
          });
          toast.warning(`⏰ Đơn hàng ${order._id.slice(-5)} đã bị huỷ vì không thanh toán sau 1 phút.`);
          setPaidNotifiedOrders((prev) => [...prev, order._id]); // Đánh dấu đã xử lý để không kiểm tra lại
        }

        // Nếu đơn nào chưa thanh toán hoặc chưa hủy → tiếp tục chờ
        if (!order.isPaid && !paidNotifiedOrders.includes(order._id)) {
          allFinalized = false;
        }
      }

      if (allFinalized) {
        clearInterval(interval);
        setShowSepayModal(false);
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("cartUpdated"));
        navigate("/myorder");
      }
    } catch (error) {
      console.error("Lỗi kiểm tra đơn hàng:", error);
    }
  }, 5000);

  return () => clearInterval(interval);
}, [showSepayModal, currentOrders, paidNotifiedOrders, orderStartTimes]);

  return (
    <div className="flex flex-col md:flex-row py-16 max-w-6xl w-full px-6 mx-auto">
      <div className="flex-1 max-w-4xl">
        <h1 className="text-3xl font-medium mb-6">
          Giỏ hàng <span className="text-sm text-green-500">{totalQuantity} sản phẩm</span>
        </h1>
        <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
          <p className="text-left">Thông tin chi tiết sản phẩm</p>
          <p className="text-center">Thành tiền</p>
          <p className="text-center">Hủy</p>
        </div>

        {products.map((product, index) => (
          <div
            key={index}
            className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3"
          >
            <div className="flex items-center md:gap-6 gap-3">
              <div className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded">
                <img
                  className="max-w-full h-full object-cover"
                  src={`http://localhost:5000/uploads/products/${product.images?.[0]}`}
                  alt={product.name}
                />
              </div>
              <div>
                <p className="hidden md:block font-semibold">{product.name}</p>
                <div className="font-normal text-gray-500/70">
                  <p>Đóng gói: <span>{product.unitDisplay || "Không rõ"}</span></p>
                  <div className="flex items-center">
                    <p>Số lượng:</p>
                    <select
                      className="outline-none ml-2"
                      value={product.quantity}
                      onChange={(e) => updateQuantity(index, parseInt(e.target.value))}
                    >
                      {[...Array(10)].map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center">{(product.price * product.quantity).toLocaleString("vi-VN")}₫</p>
            <button className="cursor-pointer mx-auto" onClick={() => removeProduct(index)}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="m12.5 7.5-5 5m0-5 5 5m5.833-2.5a8.333 8.333 0 1 1-16.667 0 8.333 8.333 0 0 1 16.667 0"
                  stroke="#FF532E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        ))}

        <button
          onClick={() => navigate("/products")}
          className="group cursor-pointer flex items-center mt-8 gap-2 text-green-500 font-medium"
        >
          <img src={assets.arrow_right_icon_colored} alt="arrow" />
          Tiếp tục mua sắm
        </button>
      </div>

      <div className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70">
        <h2 className="text-xl font-medium">Thông tin đơn hàng</h2>
        <hr className="border-gray-300 my-5" />

        <div className="mb-6">
          <p className="text-sm font-medium uppercase">Địa chỉ giao hàng</p>
          <div className="relative flex justify-between items-start mt-2">
            <p className="text-gray-500">{address || "Chưa có địa chỉ"}</p>
            <button
              onClick={() => setShowAddress(!showAddress)}
              className="text-green-500 hover:underline cursor-pointer"
            >
              Thay đổi
            </button>
            {showAddress && (
              <div className="absolute top-12 py-1 bg-white border border-gray-300 text-sm w-full z-10">
                <input
                  type="text"
                  placeholder="Nhập địa chỉ"
                  className="w-full p-2 border-b outline-none"
                  onChange={(e) => setAddress(e.target.value)}
                  value={address}
                />
                <button
                  onClick={() => updateAddress(address)}
                  className="w-full text-green-500 text-center p-2 hover:bg-green-500/10"
                >
                  Lưu
                </button>
              </div>
            )}
          </div>

          <p className="text-sm font-medium uppercase mt-6">Phương thức thanh toán</p>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none"
          >
            <option value="COD">Tiền mặt khi nhận hàng</option>
            <option value="Online">Thanh toán trực tuyến</option>
          </select>
        </div>

        <hr className="border-gray-300" />

        <div className="text-gray-500 mt-4 space-y-2">
          <p className="flex justify-between">
            <span>Giá</span>
            <span>{totalPrice.toLocaleString("vi-VN")}₫</span>
          </p>
          <p className="flex justify-between">
            <span>Phí vận chuyển</span>
            <span className="text-green-600">Miễn phí</span>
          </p>
          <p className="flex justify-between text-lg font-medium mt-3">
            <span>Tổng tiền:</span>
            <span>{totalWithTax.toLocaleString("vi-VN")}₫</span>
          </p>
        </div>

        <button
          className="w-full py-3 mt-6 cursor-pointer bg-green-500 text-white font-medium hover:bg-green-400 transition rounded"
          onClick={placeOrder}
        >
          Thanh toán
        </button>

        {showSepayModal && currentOrders.length > 0 && (
        <SepayPaymentModal
          open={true}
          onClose={() => {
            setShowSepayModal(false);
            setCurrentOrders([]);
            window.dispatchEvent(new Event("cartUpdated"));
            navigate("/myorder");
            localStorage.removeItem("cart");
          }}
          orders={currentOrders}
        />
      )}
      </div>
    </div>
  );
};

export default Cart;
