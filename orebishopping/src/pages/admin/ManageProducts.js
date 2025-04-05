import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/product";
const CATEGORY_API_URL = "http://localhost:8000/api/category";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    image: "", // Changed to 'image' for consistency with backend
    category: "",
    tags: "",
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalProducts: 0,
  });

  // Lấy token từ localStorage
  const getToken = () => localStorage.getItem("token");

  // Lấy danh sách danh mục
  const fetchCategories = async () => {
    try {
      const token = getToken();
      const response = await axios.get(CATEGORY_API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách danh mục:", error);
      setCategories([]);
    }
  };

  // Lấy danh sách sản phẩm và phân trang
  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await axios.get(API_BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: pagination.limit },
      });
      setProducts(response.data.data);
      setPagination({
        ...pagination,
        page,
        totalPages: response.data.pagination.totalPages,
        totalProducts: response.data.pagination.totalProducts,
      });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts(pagination.page);
  }, [pagination.page]);

  // Lấy tên danh mục từ ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : "Không xác định";
  };

  // Xử lý form thay đổi
  const handleChange = (e) => {
    if (e.target.name === "image") {
      setForm({ ...form, image: e.target.files[0] }); // Handle file upload
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  // Thêm hoặc cập nhật sản phẩm
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("quantity", form.quantity);
      formData.append("category", form.category);
      formData.append("tags", form.tags);
      formData.append("image", form.image); // Appending file as 'image'

      if (editingProduct) {
        await axios.put(`${API_BASE_URL}/${editingProduct._id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await axios.post(`${API_BASE_URL}/add`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      fetchProducts(pagination.page);
      resetForm();
    } catch (error) {
      console.error("Lỗi khi thêm/cập nhật sản phẩm:", error.response?.data || error.message);
    }
  };

  // Reset form sau khi thêm/sửa
  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      quantity: "",
      image: "",
      category: "",
      tags: "",
    });
    setEditingProduct(null);
  };

  // Xóa sản phẩm
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
      try {
        const token = getToken();
        await axios.delete(`${API_BASE_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchProducts(pagination.page);
      } catch (error) {
        console.error("Lỗi khi xóa sản phẩm:", error);
      }
    }
  };

  // Chỉnh sửa sản phẩm
  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      ...product,
      tags: product.tags || "", // Ensure tags field is properly set
    });
  };

  // Điều hướng phân trang
  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination({ ...pagination, page });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Quản lý Sản phẩm</h2>

      {/* Form thêm/sửa sản phẩm */}
      <form className="bg-white p-4 rounded shadow-md mb-6" onSubmit={handleSubmit}>
        <h3 className="text-xl font-semibold mb-3">{editingProduct ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</h3>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" name="name" placeholder="Tên sản phẩm" value={form.name} onChange={handleChange} className="border p-2 rounded" required />
          <input type="number" name="price" placeholder="Giá" value={form.price} onChange={handleChange} className="border p-2 rounded" required />
          <input type="number" name="quantity" placeholder="Số lượng" value={form.quantity} onChange={handleChange} className="border p-2 rounded" required />
          <select name="category" value={form.category} onChange={handleChange} className="border p-2 rounded" required>
            <option value="">Chọn danh mục</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>{category.name}</option>
            ))}
          </select>
          <input type="text" name="tags" placeholder="Tags sản phẩm" value={form.tags} onChange={handleChange} className="border p-2 rounded" required />
          <input type="file" name="image" onChange={handleChange} className="border p-2 rounded" required /> {/* File upload */}
        </div>
        <textarea name="description" placeholder="Mô tả sản phẩm" value={form.description} onChange={handleChange} className="border p-2 rounded w-full mt-2" required />
        <div className="flex gap-4 mt-3">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">{editingProduct ? "Cập nhật" : "Thêm"}</button>
          {editingProduct && (
            <button type="button" onClick={resetForm} className="bg-gray-400 text-white px-4 py-2 rounded">Hủy</button>
          )}
        </div>
      </form>

      {/* Danh sách sản phẩm */}
      {loading ? (
        <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300 shadow-md bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Hình ảnh</th>
              <th className="border p-2">Tên</th>
              <th className="border p-2">Giá</th>
              <th className="border p-2">Số lượng</th>
              <th className="border p-2">Danh mục</th>
              <th className="border p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product._id} className="text-center">
                  <td className="border p-2">
                    <img src={product.images} alt={product.name} className="w-16 h-16 object-cover mx-auto" />
                  </td>
                  <td className="border p-2">{product.name}</td>
                  <td className="border p-2">{product.price} đ</td>
                  <td className="border p-2">{product.quantity}</td>
                  <td className="border p-2">{getCategoryName(product.category)}</td>
                  <td className="border p-2">
                    <button onClick={() => handleEdit(product)} className="bg-yellow-500 text-white px-3 py-1 rounded mr-2">Sửa</button>
                    <button onClick={() => handleDelete(product._id)} className="bg-red-500 text-white px-3 py-1 rounded">Xóa</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-4">Không có sản phẩm nào</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Pagination controls */}
      <div className="mt-4 flex justify-center gap-2">
        <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page <= 1} className="px-4 py-2 bg-blue-500 text-white rounded">Trang trước</button>
        <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="px-4 py-2 bg-blue-500 text-white rounded">Trang sau</button>
      </div>
    </div>
  );
};

export default ManageProducts;
