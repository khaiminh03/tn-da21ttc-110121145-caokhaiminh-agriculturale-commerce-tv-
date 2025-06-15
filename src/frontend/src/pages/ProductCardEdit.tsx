// ... (rest of imports)
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  origin: string;
  description: string;
  categoryId: string;
  images: string[];
  unitType?: string;
  quantity?: string;
  rejectionReason?: string;
}

const SupplierRejectedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [newImage, setNewImage] = useState<File | null>(null);

  const fetchRejectedProducts = async () => {
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    const supplierId = userInfo._id;

    if (!supplierId) {
      alert('Không tìm thấy thông tin nhà cung cấp.');
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/products/by-supplier/${supplierId}/rejected`);
      setProducts(res.data);
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm bị từ chối:', err);
      alert('Không thể tải danh sách sản phẩm bị từ chối.');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Không thể tải danh mục:', err);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      origin: product.origin,
      description: product.description,
      categoryId: product.categoryId,
      unitType: product.unitType,
      quantity: product.quantity,
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage(e.target.files[0]);
    }
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;
    try {
      let updatedProduct = { ...formData };
      delete updatedProduct.rejectionReason;
      if (newImage) {
        const formDataImg = new FormData();
        formDataImg.append('image', newImage);
        const uploadRes = await axios.post(`http://localhost:5000/products/upload/${editingProduct._id}`, formDataImg);
        updatedProduct.images = [uploadRes.data.filename];
      }
      delete updatedProduct.rejectionReason;
      await axios.patch(`http://localhost:5000/products/${editingProduct._id}`, {
        ...updatedProduct,
        status: 'pending',
      });
      setEditingProduct(null);
      fetchRejectedProducts();
    } catch (err) {
      console.error('Lỗi cập nhật sản phẩm:', err);
      alert('Lỗi khi cập nhật sản phẩm.');
    }
  };

  useEffect(() => {
    fetchRejectedProducts();
    fetchCategories();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Sản phẩm bị từ chối</h2>

      {products.length === 0 ? (
        <p className="text-gray-600">Bạn không có sản phẩm nào bị từ chối.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
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
              <p className="text-sm text-gray-600 mb-1">Giá: {Number(p.price).toLocaleString()}₫</p>
              <p className="text-sm text-gray-600 mb-1">Tồn kho: {p.stock}</p>
              <p className="text-sm text-gray-600">Xuất xứ: {p.origin}</p>
              <p className="mt-3 text-sm text-red-700 bg-red-100 border border-red-200 px-4 py-1 rounded-full inline-block font-medium">
                Lý do từ chối: {p.rejectionReason || 'Không rõ'}
              </p>
              <button
                onClick={() => handleEditClick(p)}
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
              >
                Chỉnh sửa
              </button>
            </div>
          ))}
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">Chỉnh sửa sản phẩm</h3>

            <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} className="w-full mb-3 p-2 border rounded" placeholder="Tên sản phẩm" />
            <select name="categoryId" value={formData.categoryId || ''} onChange={handleInputChange} className="w-full mb-3 p-2 border rounded">
              <option value="">Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <textarea name="description" value={formData.description || ''} onChange={handleInputChange} className="w-full mb-3 p-2 border rounded" placeholder="Mô tả sản phẩm" rows={3} />
            <input type="number" name="price" value={formData.price || ''} onChange={handleInputChange} className="w-full mb-3 p-2 border rounded" placeholder="Giá" />
            <input type="number" name="stock" value={formData.stock || ''} onChange={handleInputChange} className="w-full mb-3 p-2 border rounded" placeholder="Tồn kho" />
            <input type="text" name="origin" value={formData.origin || ''} onChange={handleInputChange} className="w-full mb-3 p-2 border rounded" placeholder="Xuất xứ" />
            <input type="text" name="unitType" value={formData.unitType || ''} onChange={handleInputChange} className="w-full mb-3 p-2 border rounded" placeholder="Đơn vị tính" />
            <input type="text" name="quantity" value={formData.quantity || ''} onChange={handleInputChange} className="w-full mb-3 p-2 border rounded" placeholder="Số lượng" />
            <input type="file" onChange={handleFileChange} className="mb-3" />

            <div className="flex justify-end gap-3">
              <button onClick={() => setEditingProduct(null)} className="px-4 py-2 bg-gray-300 rounded">Hủy</button>
              <button onClick={handleUpdate} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Cập nhật</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierRejectedProducts;
