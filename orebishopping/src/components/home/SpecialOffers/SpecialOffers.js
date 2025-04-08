import React, { useState, useEffect } from "react";
import axios from "axios";
import Heading from "../Products/Heading"; // Import Heading
import Product from "../Products/Product"; // Import Product component
import { jwtDecode } from "jwt-decode"; // Import jwt-decode for decoding token
import {
  spfOne,
  spfTwo,
  spfThree,
  spfFour,
} from "../../../assets/images"; // Import images

const SpecialOffers = () => {
  const [topProducts, setTopProducts] = useState([]); // Lưu danh sách { productId, rating }
  const [productDetails, setProductDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false); // Phân biệt người dùng mới/cũ

  useEffect(() => {
    const fetchTopProducts = async () => {
      const token = localStorage.getItem("token"); // Lấy token từ localStorage

      if (!token) {
        console.error("No token found");
        setLoading(false);
        return;
      }

      try {
        // Giải mã token để lấy userId
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;

        // Lấy danh sách userIds đã có rating từ API /check_userids
        const userIdsResponse = await axios.get("http://localhost:5000/check_userids");
        const existingUserIds = userIdsResponse.data;

        let response;
        let topProductsData;

        if (existingUserIds.includes(userId)) {
          // Người dùng cũ: gọi /top10
          response = await axios.get(`http://localhost:5000/top10/${userId}`); // Sửa thành /top10
          setIsNewUser(false); // Người dùng cũ
          topProductsData = Object.entries(response.data).map(([productId, rating]) => ({
            productId,
            rating,
          }));
        } else {
          // Người dùng mới: gọi /recommend_new_user
          response = await axios.get(`http://localhost:5000/recommend_new_user/${userId}`);
          setIsNewUser(true); // Người dùng mới
          if (!response.data.recommended_products) {
            throw new Error("Invalid response from /recommend_new_user: missing recommended_products");
          }
          topProductsData = Object.entries(response.data.recommended_products).map(
            ([productId, rating]) => ({
              productId,
              rating,
            })
          );
        }

        console.log("Top products data:", topProductsData);

        setTopProducts(topProductsData); // Lưu danh sách { productId, rating }
        setLoading(false); // Tắt loading sau khi lấy dữ liệu

        // Gọi API để lấy chi tiết các sản phẩm
        const productDetailsArray = [];
        for (let { productId, rating } of topProductsData) {
          try {
            const productResponse = await axios.get(`http://localhost:8000/api/product/${productId}`);
            productDetailsArray.push({
              ...productResponse.data.data, // Chi tiết sản phẩm từ API
              rating, // Thêm rating trực tiếp từ topProductsData
            });
          } catch (productError) {
            console.error(`Error fetching product ${productId}:`, productError);
          }
        }
        setProductDetails(productDetailsArray); // Cập nhật chi tiết sản phẩm với rating
      } catch (error) {
        console.error("Error fetching top products:", error);
        setLoading(false); // Tắt loading nếu có lỗi
      }
    };

    fetchTopProducts();
  }, []); // Dependency array rỗng để chạy một lần khi component mount

  return (
    <div className="w-full pb-20">
      <Heading heading="Special Offers" />
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lgl:grid-cols-3 xl:grid-cols-4 gap-10">
        {loading ? (
          <p>Loading products...</p>
        ) : productDetails.length > 0 ? (
          productDetails.map((product) => (
            <Product
              key={product._id} // Giả sử sản phẩm có _id duy nhất
              _id={product._id}
              img={product.images} // URL ảnh thực tế của sản phẩm
              productName={product.name} // Tên sản phẩm thực tế
              price={product.price} // Giá thực tế
              color="Default color" // Thay bằng màu thực tế nếu có
              badge={product.isFeatured} // Hiển thị badge nếu sản phẩm nổi bật
              des={product.description} // Mô tả thực tế
              rating={product.rating} // Thêm rating vào props của Product
            />
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
};

export default SpecialOffers;