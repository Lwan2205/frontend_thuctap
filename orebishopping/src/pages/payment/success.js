import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetCart } from "../../redux/orebiSlice"; // Import action resetCart

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("vnp_TxnRef");

  useEffect(() => {
    dispatch(resetCart()); // ✅ Xóa giỏ hàng khi vào trang này
    setTimeout(() => {
      navigate("/");
    }, 3000); // Chuyển về home sau 3 giây
  }, [dispatch, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h2 className="text-2xl font-semibold text-green-600">Thanh toán thành công!</h2>
      <p className="text-gray-700">Mã đơn hàng: <strong>{orderId}</strong></p>
      <p className="text-gray-500">Bạn sẽ được chuyển về trang chủ sau giây lát...</p>
    </div>
  );
};

export default PaymentSuccess;
