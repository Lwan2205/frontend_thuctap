import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import Breadcrumbs from "../../components/pageProps/Breadcrumbs";
import { resetCart, setCart } from "../../redux/orebiSlice";
import { emptyCart } from "../../assets/images/index";
import ItemCard from "./ItemCard";

const Cart = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.orebiReducer.products || []);
  const userId = useSelector((state) => state.orebiReducer.userInfo?._id);
  const [totalAmt, setTotalAmt] = useState(0);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

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
          const cartProducts = data.data?.products || [];
          console.log("Cart products from API:", cartProducts);
          dispatch(setCart(cartProducts));
        } else {
          dispatch(setCart([]));
          throw new Error(data.message || "Failed to fetch cart items");
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
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
    const total = products.reduce(
      (sum, item) => sum + ((item.productId?.price || item.price) || 0) * (item.quantity || 1),
      0
    );
    setTotalAmt(total);
    setShippingCharge(total <= 200 ? 30 : total <= 400 ? 25 : 20);
  }, [products]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!products.length) {
        setRecommendedProducts([]);
        return;
      }

      try {
        let allRecommendedIds = [];

        // Kiểm tra tất cả sản phẩm trong giỏ hàng
        for (const product of products) {
          const productId = product.productId?._id;
          if (!productId || typeof productId !== "string") {
            console.error("Invalid productId:", product);
            continue;
          }

          console.log("Fetching recommendations for productId:", productId);
          try {
            const response = await axios.get(`http://localhost:5000/recommend_apriori/${productId}`);
            const recommendedIds = response.data.recommended_products || [];
            allRecommendedIds = [...new Set([...allRecommendedIds, ...recommendedIds])];
          } catch (error) {
            console.warn(`No recommendations found for productId: ${productId}`, error.response?.status);
            // Bỏ qua lỗi 404 và tiếp tục với sản phẩm tiếp theo
          }
        }

        if (allRecommendedIds.length === 0) {
          console.log("No recommendations available for any product in cart.");
          setRecommendedProducts([]);
          return;
        }

        // Lấy chi tiết sản phẩm từ danh sách gợi ý
        const recommendedDetails = await Promise.all(
          allRecommendedIds.map(async (id) => {
            try {
              const productResponse = await axios.get(`http://localhost:8000/api/product/${id}`);
              return productResponse.data.data;
            } catch (error) {
              console.error(`Error fetching product ${id}:`, error);
              return null;
            }
          })
        );

        const validRecommendations = recommendedDetails
          .filter((p) => p && p._id)
          .reduce((unique, item) => {
            return unique.some((u) => u._id === item._id) ? unique : [...unique, item];
          }, []);
        console.log("Recommended products:", validRecommendations);
        setRecommendedProducts(validRecommendations);
      } catch (error) {
        console.error("Unexpected error in fetchRecommendations:", error);
        setRecommendedProducts([]);
      }
    };

    if (!loading && products.length > 0) {
      fetchRecommendations();
    }
  }, [products, loading]);

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

  const handleAddRecommendedToCart = async (product) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        dispatch(setCart(data.data.products));
      } else {
        throw new Error(data.message || "Failed to add product to cart");
      }
    } catch (error) {
      console.error("Error adding recommended product to cart:", error);
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
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
          <button
            onClick={handleClearCart}
            className="py-2 px-10 bg-red-500 text-white font-semibold uppercase mb-4 hover:bg-red-700 duration-300"
          >
            Clear Cart
          </button>
          <div className="flex justify-end">
            <Link to="/paymentgateway">
              <button className="w-52 h-10 bg-primeColor text-white hover:bg-black duration-300">
                Proceed to Checkout
              </button>
            </Link>
          </div>

          {/* Hiển thị sản phẩm gợi ý */}
          {recommendedProducts.length > 0 && (
            <div className="mt-10">
              <h2 className="text-2xl font-semibold mb-4">Recommended Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lgl:grid-cols-3 xl:grid-cols-4 gap-6">
                {recommendedProducts.map((product) => {
                  const imageUrl =
                    Array.isArray(product.images) && product.images.length > 0
                      ? product.images[0]
                      : typeof product.images === "string"
                        ? product.images
                        : "https://via.placeholder.com/150";

                  return (
                    <motion.div
                      key={product._id}
                      className="border p-4 rounded-lg shadow-md"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <img
                        src={imageUrl}
                        alt={product.name || "Product"}
                        className="w-full h-40 object-cover mb-2"
                        onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
                      />
                      <h3 className="text-lg font-medium">{product.name || "Unnamed Product"}</h3>
                      <p className="text-gray-600">${product.price || 0}</p>
                      <button
                        onClick={() => handleAddRecommendedToCart(product)}
                        className="mt-2 py-1 px-4 bg-primeColor text-white hover:bg-black duration-300"
                      >
                        Add to Cart
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
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