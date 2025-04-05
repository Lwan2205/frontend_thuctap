import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo: null, // ✅ Lưu thông tin user
  products: [],
};

export const orebiSlice = createSlice({
  name: "orebi",
  initialState,
  reducers: {
    loginSuccess: (state, action) => { // ✅ Thêm loginSuccess
      state.userInfo = action.payload;
    },
    addToCart: (state, action) => {
      const item = state.products.find((item) => item._id === action.payload._id);
      if (item) {
        item.quantity += action.payload.quantity || 1;
      } else {
        state.products.push({ ...action.payload, quantity: action.payload.quantity || 1 });
      }
    },
    increaseQuantity: (state, action) => {
      const item = state.products.find((item) => item._id === action.payload._id);
      if (item) {
        item.quantity++;
      }
    },
    decreaseQuantity: (state, action) => { // ✅ Fix typo từ "drecreaseQuantity"
      const item = state.products.find((item) => item._id === action.payload._id);
      if (item && item.quantity > 1) {
        item.quantity--;
      }
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const itemIndex = state.products.findIndex(item => item.productId._id === productId);
    
      if (itemIndex !== -1) {
        state.products[itemIndex].quantity = quantity; // Cập nhật số lượng
      }
    },    
    deleteItem: (state, action) => {
      state.products = state.products.filter((item) => item.productId._id !== action.payload);
    },
    resetCart: (state) => {
      state.products = [];
    },
    setCart: (state, action) => {
      state.products = Array.isArray(action.payload) ? action.payload : [];
    },
  },
});

export const { loginSuccess, addToCart, increaseQuantity, decreaseQuantity, updateQuantity, deleteItem, resetCart, setCart } = orebiSlice.actions; // ✅ Thêm updateQuantity
export default orebiSlice.reducer;
