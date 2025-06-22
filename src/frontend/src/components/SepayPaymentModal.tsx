import React from "react";

interface OrderInfo {
  _id: string;
  totalAmount: number;
}

interface SepayPaymentModalProps {
  open: boolean;
  onClose: () => void;
  orders: OrderInfo[];
}

const SepayPaymentModal: React.FC<SepayPaymentModalProps> = ({ open, onClose, orders }) => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Đã sao chép nội dung chuyển khoản!");
  };

  return (
    <div className={`fixed inset-0 bg-black/40 flex items-center justify-center z-50 ${open ? '' : 'hidden'}`}>
      <div className="bg-white p-6 rounded-xl w-full max-w-2xl shadow-lg overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-4 text-center">Quét mã để chuyển khoản</h2>

        <div className="space-y-6">
          {orders.map((order) => {
            const qrImageUrl = `https://qr.sepay.vn/img?acc=10001460847&bank=TPBank&amount=${order.totalAmount}&des=don ${order._id}`;
            return (
              <div key={order._id} className="border p-4 rounded-xl shadow-sm">
                <h3 className="font-semibold mb-2 text-center">Đơn hàng: <code>{order._id}</code></h3>
                <img src={qrImageUrl} alt={`QR đơn ${order._id}`} className="mx-auto max-w-xs rounded" />
                <div className="mt-4 text-sm">
                  <p><strong>Số tiền:</strong> {order.totalAmount.toLocaleString()} VND</p>
                  <p className="flex items-center gap-2">
                    <strong>Nội dung:</strong> <code>don {order._id}</code>
                    <button
                      onClick={() => handleCopy(`don ${order._id}`)}
                      className="ml-2 text-green-500 underline text-xs hover:text-green-400"
                    >
                      Sao chép
                    </button>
                  </p>
                  <p className="text-red-600 mt-2 text-sm">
                    ⚠️ Vui lòng chuyển đúng nội dung để hệ thống xác nhận đơn hàng.
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={onClose}
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-full transition"
          >
            Tôi đã chuyển khoản
          </button>
        </div>
      </div>
    </div>
  );
};

export default SepayPaymentModal;
