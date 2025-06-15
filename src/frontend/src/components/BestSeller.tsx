import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import axios from 'axios';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  origin: string;
  status: 'pending' | 'approved' | 'rejected';
  categoryId: string;
  supplierId: string;
}

interface BestSellerItem {
  productId: string;
  totalSold: number;
  name: string;
  images: string[];
}

const BestSeller = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchBestSellingProducts = async () => {
      try {
        const response = await axios.get<BestSellerItem[]>('http://localhost:5000/orders/best-selling?limit=5');

        const productDetails = await Promise.all(
          response.data.map(async (item) => {
            const productRes = await axios.get<Product>(`http://localhost:5000/products/${item.productId}`);
            return productRes.data;
          })
        );

        setProducts(productDetails);
      } catch (error) {
        console.error('Error fetching best-selling products:', error);
      }
    };

    fetchBestSellingProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const index = cart.findIndex((item: any) => item._id === product._id);

    if (index !== -1) {
      cart[index].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  return (
    <div className="mt-16">
      <p className="text-2xl md:text-3xl font-medium mb-8">SẢN PHẨM BÁN CHẠY</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 mt-6">
        {products.map(product => (
          <ProductCard
            key={product._id}
            product={product}
            onAddToCart={() => handleAddToCart(product)}
          />
        ))}
      </div>
    </div>
  );
};

export default BestSeller;
