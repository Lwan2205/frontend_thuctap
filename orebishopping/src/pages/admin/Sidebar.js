import { Link } from "react-router-dom";
import { FaTachometerAlt, FaBox, FaUsers, FaSignOutAlt } from "react-icons/fa";

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-900 text-white h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
      <nav className="flex flex-col space-y-4">
        <Link
          to="/admin"
          className="flex items-center space-x-3 p-3 hover:bg-gray-700 rounded-lg"
        >
          <FaTachometerAlt />
          <span>Dashboard</span>
        </Link>
        <Link
          to="/admin/products"
          className="flex items-center space-x-3 p-3 hover:bg-gray-700 rounded-lg"
        >
          <FaBox />
          <span>Manage Products</span>
        </Link>
        <Link
          to="/admin/users"
          className="flex items-center space-x-3 p-3 hover:bg-gray-700 rounded-lg"
        >
          <FaUsers />
          <span>Manage Users</span>
        </Link>
      </nav>
      <div className="mt-auto">
        <Link
          to="/signin"
          className="flex items-center space-x-3 p-3 hover:bg-red-600 rounded-lg"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
