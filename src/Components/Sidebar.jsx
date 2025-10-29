import { Link, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useAuth } from "../context/AuthContext"; // 👈 import context

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth(); // 👈 use logout from context
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();            // clear user & token
    navigate("/login");  // redirect to login
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-40 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white p-6 shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:z-auto`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-600">Admin Panel</h2>
          <button className="md:hidden" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-col space-y-4 text-sm font-medium text-gray-700">
          <Link to="/admin-dashboard" className="hover:text-blue-600">
            Main Dashboard
          </Link>
          <Link to="/manage-users" className="hover:text-blue-600">
            Manage Users
          </Link>
          <Link to="/manage-campaigns" className="hover:text-blue-600">
            Manage Campaigns
          </Link>
          <Link to="/manage-boards" className="hover:text-blue-600">
            Manage Boards
          </Link>
          <Link to="/verify-campaigns" className="hover:text-blue-600">
            Verify Campaigns
          </Link>

          {/* 👇 Replaces Link with button for logout */}
          <button
            onClick={handleLogout}
            className="text-left hover:text-red-600 transition"
          >
            Logout
          </button>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
