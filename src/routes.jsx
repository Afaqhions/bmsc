
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./Components/ProtectedRoute";

// Public Pages
import HomePage from "./Pages/landingPage";
import LoginPage from "./Pages/login";

// Dashboards
import AdminDashboard from "./Pages/Dashboards/Admin/AdminDashboard";
import ClientDashboard from "./Pages/Dashboards/ClientPages/ClientDashboard";
import VerifiedCampaigns from "./Pages/Dashboards/ClientPages/VerifiedCampaigns";
import ManagerDashboard from "./Pages/Dashboards/Admin/AdminDashboard";
import ServiceDashboard from "./Pages/Dashboards/ServiceMan/ServicemanDashboard";

// Admin Pages
import ManageBoards from "./Pages/Dashboards/Admin/ManageBoards";
import ManageUsers from "./Pages/Dashboards/Admin/ManageUsers";
import ManageCampaigns from "./Pages/Dashboards/Admin/ManageCampaigns";
import ViewBoardStats from "./Pages/Dashboards/Admin/ViewBoardStats";
import VerifyUploads from "./Pages/Dashboards/Admin/VerifyUploads";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Pages (accessible to both admin and manager) */}
      <Route element={<ProtectedRoute allowedRoles={["admin", "manager"]} />}>
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/manage-boards" element={<ManageBoards />} />
        <Route path="/manage-users" element={<ManageUsers />} />
        <Route path="/manage-campaigns" element={<ManageCampaigns />} />
        <Route path="/view-board-stats" element={<ViewBoardStats />} />
        <Route path="/verify-campaigns" element={<VerifyUploads />} />
      </Route>

      {/* Client */}
      <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
        <Route path="/client-dashboard" element={<ClientDashboard />} />
        <Route path="/client/verified-campaigns" element={<VerifiedCampaigns />} />
      </Route>

      {/* Serviceman */}
      <Route element={<ProtectedRoute allowedRoles={["serviceman"]} />}>
        <Route path="/serviceman-dashboard" element={<ServiceDashboard />} />
      </Route>

      {/* Manager Dashboard (own page, not admin layout) */}
      <Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
