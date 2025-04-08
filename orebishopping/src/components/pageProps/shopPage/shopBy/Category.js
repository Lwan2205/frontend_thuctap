import React, { useState, useEffect } from "react";
import { ImPlus } from "react-icons/im";
import NavTitle from "./NavTitle";

const Category = () => {
  const [categories, setCategories] = useState([]); // State để lưu danh mục
  const [showSubCatOne, setShowSubCatOne] = useState(false); // Trạng thái của danh mục con
  const [selectedCategory, setSelectedCategory] = useState(null); // Category đang được chọn
  const [selectedSubCategory, setSelectedSubCategory] = useState(null); // Subcategory đang được chọn
  const [products, setProducts] = useState([]);

  // Lấy tất cả danh mục từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/category'); // API lấy danh mục
        const data = await response.json();
        setCategories(data.data); // Cập nhật danh sách danh mục từ response
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // Lấy sản phẩm theo danh mục
  const fetchProductsByCategory = async (categoryID, subCategoryID) => {
    try {
      const url = subCategoryID
        ? `http://localhost:8000/api/products/category/${categoryID}/subcategory/${subCategoryID}` // Nếu có subcategory
        : `http://localhost:8000/api/product/category/${categoryID}`; // Nếu chỉ có category
      const response = await fetch(url);
      const data = await response.json();
      setProducts(data.data); // Cập nhật danh sách sản phẩm theo danh mục
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // Xử lý khi nhấn vào danh mục
  const handleCategoryClick = (categoryID) => {
    setSelectedCategory(categoryID);
    fetchProductsByCategory(categoryID, null); // Lấy sản phẩm của category chính
    setShowSubCatOne(!showSubCatOne); // Chuyển trạng thái hiển thị subcategory
  };

  // Xử lý khi nhấn vào subcategory
  const handleSubCategoryClick = (subCategoryID) => {
    fetchProductsByCategory(selectedCategory, subCategoryID); // Lấy sản phẩm của subcategory
    setSelectedSubCategory(subCategoryID);
  };

  return (
    <div className="w-full">
      <NavTitle title="Shop by Category" icons={false} />
      <div>
        <ul className="flex flex-col gap-4 text-sm lg:text-base text-[#767676]">
          {categories.map(({ _id, name, subCategories, icons }) => (
            <li
              key={_id}
              className="border-b-[1px] border-b-[#F0F0F0] pb-2 flex items-center justify-between"
            >
              <span onClick={() => handleCategoryClick(_id)} className="cursor-pointer">
                {name} {/* Hiển thị tên danh mục */}
              </span>
              {icons && (
                <span
                  onClick={() => setShowSubCatOne(!showSubCatOne)}
                  className="text-[10px] lg:text-xs cursor-pointer text-gray-400 hover:text-primeColor duration-300"
                >
                  <ImPlus />
                </span>
              )}
              {/* Hiển thị subcategory nếu có */}
              {showSubCatOne && subCategories && (
                <ul className="ml-4 mt-2">
                  {subCategories.map((sub) => (
                    <li
                      key={sub._id}
                      className="cursor-pointer text-gray-500 hover:text-primeColor"
                      onClick={() => handleSubCategoryClick(sub._id)}
                    >
                      {sub.name} {/* Hiển thị tên của subcategory */}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Hiển thị sản phẩm theo danh mục hoặc subcategory đã chọn */}
      {selectedCategory && (
        <div className="mt-5">
          <h3>Products in this category:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product._id} className="product-item">
                {/* Hiển thị thông tin sản phẩm */}
                <img src={product.img} alt={product.productName} />
                <h4>{product.productName}</h4>
                <p>{product.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;
