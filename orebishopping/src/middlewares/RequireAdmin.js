import { Navigate, Outlet } from "react-router-dom";

// Hàm lấy role từ localStorage
const getUserRole = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.role || "user"; // Mặc định là "user" nếu không có dữ liệu
};

// Component bảo vệ route admin
const RequireAdmin = () => {
  const role = getUserRole();

  if (role !== "admin") {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};

export default RequireAdmin;
