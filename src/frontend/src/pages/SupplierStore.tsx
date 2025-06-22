import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard'; // điều chỉnh nếu đường dẫn khác

interface StoreProfile {
  storeName: string;
  phone: string;
  address: string;
  imageUrl: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
  images: string[];
  categoryId: string;
}

const SupplierPage = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<StoreProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/store-profiles/by-user/${id}`);
        setProfile(res.data);
      } catch {
        setProfile(null);
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/products/by-supplier/${id}`);
        setProducts(res.data);
      } catch {
        setProducts([]);
      }
    };

    const loadData = async () => {
      await Promise.all([fetchProfile(), fetchProducts()]);
      setLoading(false);
    };

    loadData();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Đang tải thông tin cửa hàng...</p>;

  return (
    <div className="max-w-6xl px-6 mx-auto mt-16">
      {profile ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-10">
          <div className="flex items-center gap-4">
            {profile.imageUrl ? (
              <img
                src={`http://localhost:5000/uploads${profile.imageUrl}`}
                alt="Ảnh cửa hàng"
                className="w-20 h-20 rounded-full object-cover border border-green-400"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                N/A
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-green-700">{profile.storeName}</h1>
              <p className="text-sm text-gray-600">📍 {profile.address}</p>
              <p className="text-sm text-gray-600">📞 {profile.phone}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-red-500">Không tìm thấy thông tin cửa hàng.</p>
      )}

      <h2 className="text-xl font-bold mb-4">Sản phẩm của cửa hàng</h2>
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 mt-6">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">Cửa hàng này chưa có sản phẩm nào.</p>
      )}
    </div>
  );
};

export default SupplierPage;
