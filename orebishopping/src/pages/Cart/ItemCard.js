import React from "react";
import { ImCross } from "react-icons/im";
import { useDispatch } from "react-redux";
import { deleteItem, updateQuantity } from "../../redux/orebiSlice";

const ItemCard = ({ item }) => {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/cart/remove/${item.productId._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        dispatch(deleteItem(item.productId._id)); // Cập nhật Redux store
      } else {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };
  

  const updateCartQuantity = async (action) => {
    try {
      const newQuantity = action === "increase" ? item.quantity + 1 : item.quantity - 1;
  
      if (newQuantity < 1) {
        handleDelete();
        return;
      }
  
      const response = await fetch(`http://localhost:8000/api/cart/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          productId: item.productId._id, 
          quantity: newQuantity 
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        dispatch(updateQuantity({ 
          productId: item.productId._id, 
          quantity: newQuantity 
        }));
      } else {
        console.error("Error updating quantity:", data.message);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };
  
  

  return (
    <div className="w-full grid grid-cols-5 mb-4 border py-2">
      <div className="flex col-span-5 mdl:col-span-2 items-center gap-4 ml-4">
        <ImCross
          onClick={handleDelete}
          className="text-primeColor hover:text-red-500 duration-300 cursor-pointer"
        />
        <img className="w-32 h-32" src={item.productId.images} alt="productImage" />
        <h1 className="font-titleFont font-semibold">{item.name}</h1>
      </div>
      <div className="col-span-5 mdl:col-span-3 flex items-center justify-between py-4 mdl:py-0 px-4 mdl:px-0 gap-6 mdl:gap-0">
        <div className="flex w-1/3 items-center text-lg font-semibold">
          ${item.productId.price}
        </div>
        <div className="w-1/3 flex items-center gap-6 text-lg">
          <span
            onClick={() => updateCartQuantity("decrease")}
            className="w-6 h-6 bg-gray-100 text-2xl flex items-center justify-center hover:bg-gray-300 cursor-pointer duration-300 border-[1px] border-gray-300"
          >
            -
          </span>
          <p>{item.quantity}</p>
          <span
            onClick={() => updateCartQuantity("increase")}
            className="w-6 h-6 bg-gray-100 text-2xl flex items-center justify-center hover:bg-gray-300 cursor-pointer duration-300 border-[1px] border-gray-300"
          >
            +
          </span>
        </div>
        <div className="w-1/3 flex items-center font-titleFont font-bold text-lg">
          <p>${item.quantity * item.productId.price}</p>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
