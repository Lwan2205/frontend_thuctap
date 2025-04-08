import React, { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import Product from "../../home/Products/Product";

const Pagination = ({ itemsPerPage = 20 }) => {  // Set mặc định 20 sản phẩm mỗi trang
  const [itemOffset, setItemOffset] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/product/');

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
          throw new Error('Invalid data format from API');
        }

        // Giả sử dữ liệu sản phẩm có cấu trúc phù hợp
        setProducts(result.data);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        setProducts([]);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Tính toán số lượng sản phẩm hiện tại hiển thị trên trang
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = products.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(products.length / itemsPerPage);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % products.length;
    setItemOffset(newOffset);
  };

  if (loading) return <div className="text-center py-10">Loading products...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 mdl:gap-4 lg:gap-10">
        {currentItems.map((item) => (
          <div key={item._id} className="w-full">
            <Product
              _id={item._id}
              img={item.images || 'default-image-url.jpg'}  // Fallback ảnh nếu không có
              productName={item.name}
              price={item.price}
              color={item.tags || 'Default'}  // Default màu nếu không có tag
              badge={item.isFeatured}
              des={item.description}
            />
          </div>
        ))}
      </div>

      {/* Phân trang */}
      {pageCount > 1 && (  // Chỉ hiển thị phân trang nếu có nhiều hơn một trang
        <div className="flex flex-col mdl:flex-row justify-center mdl:justify-between items-center">
          <ReactPaginate
            nextLabel=">"
            previousLabel="<"
            breakLabel="..."
            onPageChange={handlePageClick}
            pageRangeDisplayed={5}  // Hiển thị nhiều số trang
            marginPagesDisplayed={2}  // Hiển thị số trang ở đầu và cuối
            pageCount={pageCount}
            pageLinkClassName="w-9 h-9 border-[1px] border-lightColor hover:border-gray-500 duration-300 flex justify-center items-center"
            containerClassName="flex text-base font-semibold font-titleFont py-10"
            activeClassName="bg-black text-white"
          />
        </div>
      )}

      <p className="text-base font-normal text-lightText">
        Products from {itemOffset + 1} to {Math.min(endOffset, products.length)} of {products.length}
      </p>
    </div>
  );
};

export default Pagination;
