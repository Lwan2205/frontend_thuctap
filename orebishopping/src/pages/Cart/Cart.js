import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import { resetCart, setCart } from "../../redux/orebiSlice";
import { emptyCart } from "../../assets/images/index";
import ItemCard from "./ItemCard";

const Cart = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.orebiReducer.products);
  const userId = useSelector((state) => state.orebiReducer.userInfo?._id);
  const [totalAmt, setTotalAmt] = useState(0);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await fetch(`http://localhost:8000/api/cart`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          // Xử lý trường hợp data.data.products là null hoặc undefined
          const products = data.data?.products || [];
          dispatch(setCart(products)); // Luôn dispatch một mảng, kể cả rỗng
        } else {
          // Nếu API trả về lỗi, reset giỏ hàng
          dispatch(setCart([]));
          throw new Error(data.message || "Failed to fetch cart items");
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
        // Khi có lỗi, reset giỏ hàng
        dispatch(setCart([]));
      } finally {
        setLoading(false);
      }
    };
    if (userId) {
      fetchCartItems();
    }
  }, [userId, dispatch]);


  useEffect(() => {
    const total = products.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalAmt(total);

    setShippingCharge(total <= 200 ? 30 : total <= 400 ? 25 : 20);
  }, [products]);

  const handleClearCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/cart/clear`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        dispatch(resetCart());
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  if (loading) return <div className="text-center py-10">Loading cart...</div>;

  return (
    <div className="max-w-container mx-auto px-4">
      <Breadcrumbs title="Cart" />
      {products.length > 0 ? (
        <div className="pb-20">
          <div className="mt-5">
            {products.map((item) => (
              <ItemCard key={item.productId} item={item} />
            ))}
          </div>
          <button onClick={handleClearCart} className="py-2 px-10 bg-red-500 text-white font-semibold uppercase mb-4 hover:bg-red-700 duration-300">
            Clear Cart
          </button>
          <div className="flex justify-end">
            <Link to="/paymentgateway">
              <button className="w-52 h-10 bg-primeColor text-white hover:bg-black duration-300">
                Proceed to Checkout
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <motion.div className="flex flex-col items-center">
          <img className="w-80 rounded-lg p-4 mx-auto" src={emptyCart} alt="emptyCart" />
          <Link to="/shop">
            <button className="bg-primeColor px-8 py-2 text-white">Continue Shopping</button>
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default Cart;
