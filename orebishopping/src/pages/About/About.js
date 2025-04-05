import React, { useEffect, useState } from "react";
import axios from "axios";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";

const About = () => {
  const [orders, setOrders] = useState([]);
  const [ratings, setRatings] = useState({});
  const [prevLocation, setPrevLocation] = useState("home");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/order/my-order", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setOrders(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy đơn hàng", error);
      }
    };

    fetchOrders();
  }, []);

  const handleRatingSubmit = async (productId) => {
    const rating = ratings[productId];
    if (!rating) return;

    try {
      await axios.post(
        "http://localhost:8000/api/order/rate",
        { productId, rating },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("🎉 Đánh giá thành công!");
    } catch (error) {
      alert(error?.response?.data?.message || "❌ Lỗi khi đánh giá.");
    }
  };

  return (
    <div className="max-w-container mx-auto px-4">
      <Breadcrumbs title="My Orders" prevLocation={prevLocation} />
      <div className="py-6">
        <h1 className="text-xl font-bold mb-4">Đơn hàng của bạn</h1>
        {orders.length === 0 ? (
          <p>Không có đơn hàng nào.</p>
        ) : (
          orders.map((order) =>
            order.products.map((item) => {
              const product = item.productId;

              // 🔒 Kiểm tra nếu product không tồn tại (null do bị xóa)
              if (!product) return null;

              return (
                <div
                  key={item._id}
                  className="flex items-center gap-6 border-b py-4"
                >
                  <img
                    src={product.images}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">{product.name}</h2>
                    <p className="text-sm text-gray-600">
                      Số lượng: {item.quantity}
                    </p>
                    {/* Thay đổi để hiển thị totalAmount của đơn hàng */}
                    <p className="text-sm text-gray-600">
                      Thành tiền: {order.totalAmount.toLocaleString()}đ
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <select
                        value={ratings[product._id] || ""}
                        onChange={(e) =>
                          setRatings({
                            ...ratings,
                            [product._id]: Number(e.target.value),
                          })
                        }
                        className="border px-2 py-1 rounded"
                      >
                        <option value="">Đánh giá sản phẩm</option>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <option key={num} value={num}>
                            {num} Sao
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleRatingSubmit(product._id)}
                        className="bg-primeColor text-white px-3 py-1 rounded hover:bg-black transition"
                      >
                        Gửi đánh giá
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )
        )}
      </div>
    </div>
  );
};

export default About;
