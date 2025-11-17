import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, logout } = useAuth();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      // Wait a bit in case user is still loading from localStorage
      setTimeout(() => {
        if (!user || !token) {
          logout();
          navigate("/login", { replace: true });
        }
      }, 100);
    } else if (!allowedRoles.includes(user.role)) {
      navigate("/", { replace: true });
    } else {
      setIsAuthorized(true);
    }
    setIsLoading(false);
  }, [user, token, allowedRoles, logout, navigate]);

  if (isLoading) return null; // Optional: Add a spinner or splash screen

  return isAuthorized ? <Outlet /> : null;
};

export default ProtectedRoute;
