import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import { useDispatch, useSelector } from "react-redux";
import { resetCart } from "../../redux/orebiSlice";

const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch(); // ✅ Thêm useDispatch()
  const cartItems = useSelector((state) => state.orebiReducer.products);
  const token = localStorage.getItem("token");

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.productId.price * item.quantity,
    0
  );

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!token) throw new Error("Vui lòng đăng nhập để thanh toán");
      if (cartItems.length === 0) throw new Error("Giỏ hàng trống, vui lòng thêm sản phẩm");

      const paymentData = {
        paymentMethod,
        items: cartItems.map(item => ({
          productId: item.productId._id,
          quantity: item.quantity,
          price: item.productId.price
        })),
        amount: totalAmount
      };

      const response = await fetch("http://localhost:8000/api/order/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Thanh toán thất bại");

      if (paymentMethod === "VNPay" && data.payUrl) {
        window.location.href = data.payUrl;
        return;
      }

      // ✅ Xóa giỏ hàng trên server
      await fetch("http://localhost:8000/api/cart/clear", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

    
      // ✅ Chuyển về trang chủ
      navigate("/payment/success", { state: { orderId: data.data._id } });
    } catch (err) {
      console.error("Lỗi thanh toán:", err);
      setError(err.message || "Có lỗi xảy ra khi thanh toán");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-container mx-auto px-4">
      <Breadcrumbs title="Thanh toán" />
      <div className="pb-10 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Chi tiết thanh toán</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Tóm tắt đơn hàng</h3>
            <div className="border-b pb-4 mb-4">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div key={item.productId._id} className="flex justify-between mb-2">
                    <span>{item.productId.name} x {item.quantity}</span>
                    <span>{(item.productId.price * item.quantity).toLocaleString()} VND</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Không có sản phẩm nào trong giỏ hàng</p>
              )}
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Tổng cộng:</span>
              <span>{totalAmount.toLocaleString()} VND</span>
            </div>
          </div>

          <form onSubmit={handlePayment}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Phương thức thanh toán</label>
              <select
                className="w-full p-2 border rounded"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
              >
                <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                <option value="VNPay">Thanh toán qua VNPay</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-primeColor text-white py-3 rounded hover:bg-black transition duration-300"
              disabled={loading || cartItems.length === 0}
            >
              {loading ? "Đang xử lý..." : "Thanh toán ngay"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/cart" className="text-primeColor hover:underline">
              Quay lại giỏ hàng
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
