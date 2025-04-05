import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import AdminHeader from "../components/admin/AdminHeader";
import AdminSidebar from "../components/admin/AdminSidebar";

const AdminLayout = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.orebi.userInfo);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/signin");
    }
  }, [user, navigate]);

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <Outlet /> {/* Đảm bảo Outlet đã được import */}
      </div>
    </div>
  );
};

export default AdminLayout;
