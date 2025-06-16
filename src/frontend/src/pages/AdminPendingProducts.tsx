import { useEffect, useState } from 'react';
import axios from 'axios';

interface Product {
  _id: string;
  name: string;
  categoryId: string;
  price: number;
  inStock: boolean;
  images: string[];
  category: string;
  supplierId: string;
  supplierName?: string;
  supplierPhone?: string;
  origin: string;
  description?: string;
  stock?: number;
  unitType?: string;
  quantity?: string;
  rejectionReason?: string;
}

const AdminPendingProducts = () => {
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [rejectedProducts, setRejectedProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const fetchPendingProducts = async () => {
    const res = await axios.get('http://localhost:5000/products/admin?status=pending');
    setPendingProducts(res.data);
  };

  const fetchRejectedProducts = async () => {
    const res = await axios.get('http://localhost:5000/products/admin?status=rejected');
    setRejectedProducts(res.data);
  };

  const handleApprove = async (id: string) => {
    try {
      await axios.patch(`http://localhost:5000/products/${id}/status`, { status: 'approved' });
      fetchPendingProducts();
    } catch (err) {
      alert('Lỗi khi duyệt sản phẩm.');
    }
  };

  const openRejectModal = (productId: string) => {
    setSelectedProductId(productId);
    setRejectionReason('');
    setShowModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối.');
      return;
    }

    try {
      await axios.patch(`http://localhost:5000/products/${selectedProductId}/status`, {
        status: 'rejected',
        rejectionReason,
      });
      setShowModal(false);
      fetchPendingProducts();
      fetchRejectedProducts();
    } catch (err) {
      alert('Lỗi khi từ chối sản phẩm.');
    }
  };

  const openDetailModal = (product: Product) => {
    setDetailProduct(product);
  };

  const closeDetailModal = () => {
    setDetailProduct(null);
  };

  useEffect(() => {
    fetchPendingProducts();
    fetchRejectedProducts();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Duyệt sản phẩm</h2>

      {pendingProducts.length === 0 ? (
        <p className="text-gray-600">Không có sản phẩm chờ duyệt.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {pendingProducts.map((p) => (
            <div
              key={p._id}
              className="border border-gray-500/30 rounded-2xl p-5 shadow-md hover:shadow-xl transition duration-300 bg-white"
            >
              <img
                src={`http://localhost:5000/uploads/products/${p.images[0]}`}
                alt={p.name}
                className="h-40 w-full object-cover mb-4 rounded-md"
              />
              <h3 className="text-xl font-semibold mb-1">{p.name}</h3>
              <p className="text-sm text-gray-600 mb-1">Giá: {p.price.toLocaleString()}₫</p>
              <p className="text-sm text-gray-600 mb-1">Tồn kho: {p.stock}</p>
              <p className="text-sm text-gray-600">Xuất xứ: {p.origin}</p>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => handleApprove(p._id)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition"
                >
                  Duyệt
                </button>
                <button
                  onClick={() => openRejectModal(p._id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition"
                >
                  Từ chối
                </button>
                <button
                  onClick={() => openDetailModal(p)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                >
                  Chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-3xl font-bold mb-6 text-gray-800 mt-10">Sản phẩm bị từ chối</h2>

      {rejectedProducts.length === 0 ? (
        <p className="text-gray-600">Không có sản phẩm bị từ chối.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rejectedProducts.map((p) => (
            <div
              key={p._id}
              className="border border-red-300 rounded-2xl p-5 shadow-md bg-red-50 hover:shadow-lg transition duration-300"
            >
              <img
                src={`http://localhost:5000/uploads/products/${p.images[0]}`}
                alt={p.name}
                className="h-40 w-full object-cover mb-4 rounded-md"
              />
              <h3 className="text-xl font-semibold mb-1">{p.name}</h3>
              <p className="text-sm text-gray-600 mb-1">Giá: {p.price.toLocaleString()}₫</p>
              <p className="text-sm text-gray-600 mb-1">Tồn kho: {p.stock}</p>
              <p className="text-sm text-gray-600">Xuất xứ: {p.origin}</p>
              <p className="text-sm text-gray-600">Nhà cung cấp: {p.supplierName || 'Không rõ'}</p>
              <p className="mt-3 text-sm text-red-700 bg-red-100 border border-red-200 px-4 py-1 rounded-full inline-block font-medium">
                ❗ Lý do từ chối: {p.rejectionReason || 'Không có'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal từ chối */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Lý do từ chối sản phẩm</h3>
            <textarea
              className="w-full border rounded-md p-3 mb-4 text-sm"
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-lg transition"
              >
                Hủy
              </button>
              <button
                onClick={handleRejectSubmit}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chi tiết sản phẩm */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Chi tiết sản phẩm</h2>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <img
                src={`http://localhost:5000/uploads/products/${detailProduct.images[0]}`}
                alt={detailProduct.name}
                className="w-full md:w-1/2 max-h-64 object-contain rounded-lg border border-gray-500/30"
              />
              <div className="flex-1 text-sm text-gray-700 space-y-2">
                <p><span className="font-medium text-gray-900">Tên:</span> {detailProduct.name}</p>
                <p><span className="font-medium text-gray-900">Giá:</span> {detailProduct.price.toLocaleString('vi-VN')}₫</p>
                <p><span className="font-medium text-gray-900">Xuất xứ:</span> {detailProduct.origin}</p>
                <p><span className="font-medium text-gray-900">Danh mục:</span> {detailProduct.category}</p>
                <p><span className="font-medium text-gray-900">Nhà cung cấp:</span> {detailProduct.supplierName ?? 'Không rõ'}</p>
                <p><span className="font-medium text-gray-900">SĐT nhà cung cấp:</span> {detailProduct.supplierPhone ?? 'Không rõ'}</p>
                <p><span className="font-medium text-gray-900">Tồn kho:</span> {detailProduct.stock ?? 'Không rõ'}</p>
                <p><span className="font-medium text-gray-900">Đơn vị:</span> {detailProduct.unitType ?? 'Không rõ'}</p>
                <p><span className="font-medium text-gray-900">Mô tả:</span> {detailProduct.description ?? 'Không có mô tả'}</p>
              </div>
            </div>
            <div className="text-right mt-6">
              <button
                onClick={closeDetailModal}
                className="inline-flex items-center px-5 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPendingProducts;
