import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const SellerProfileForm = () => {
  const [form, setForm] = useState({
    storeName: "",
    phone: "",
    address: "",
    imageUrl: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/store-profiles/my-profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      .then((res) => {
        const {
          storeName = "",
          phone = "",
          address = "",
          imageUrl = "",
        } = res.data;

        setForm({ storeName, phone, address, imageUrl });

        if (imageUrl.startsWith("/store-profile")) {
          setPreviewImage(`http://localhost:5000/uploads${imageUrl}`);
        } else {
          setPreviewImage(`http://localhost:5000${imageUrl}`);
        }
      })
      .catch((err) => {
        console.error("Lỗi khi lấy hồ sơ:", err.response?.data || err.message);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("storeName", form.storeName);
    formData.append("phone", form.phone);
    formData.append("address", form.address);
    if (selectedFile) {
      formData.append("image", selectedFile);
    } else {
      formData.append("imageUrl", form.imageUrl);
    }

    try {
      await axios.post("http://localhost:5000/store-profiles", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Cập nhật hồ sơ thành công!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Cập nhật hồ sơ nhà cung cấp
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên cửa hàng
          </label>
          <input
            type="text"
            name="storeName"
            value={form.storeName}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số điện thoại
          </label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Địa chỉ
          </label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ảnh cửa hàng
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block"
          />
          {previewImage && (
            <img
              src={previewImage}
              alt="preview"
              className="w-32 h-32 mt-3 rounded-md border object-cover"
            />
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
        >
          Lưu thay đổi
        </button>
      </form>
    </div>
  );
};

export default SellerProfileForm;
