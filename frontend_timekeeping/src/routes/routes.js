import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/login/LoginPage";
import AccountManagement from "../pages/account-management/AccountManagement";
import OverView from "../pages/overview/Overview";
import TimeManagement from "../pages/TimeKeeping/Timekeeping";
import Dayoffs from "../pages/Dayoffs/Dayoffs";
import DayoffTypes from "../pages/Dayoff-type/Dayoff-type";
import Reports from "../pages/reports/Reports";
// Import các component mới cho Role và Account
import RoleManagement from "../pages/account-management/RoleManagement"; // Giả định
import RegisterPage from "../pages/register/RegisterPage";
import ProtectedRoute from "./protectedRoute";
import ChangePassword from "../pages/change-password/ChangePassword";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes - Cần đăng nhập mới truy cập được */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<OverView />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/timesheet" element={<TimeManagement />} />
        <Route>
          <Route path="/dayoffs" element={<Dayoffs />} />
          <Route path="/dayoff-types" element={<DayoffTypes />} />
        </Route>

        <Route path="/reports" element={<Reports />} />

        {/* Nested routes */}
        <Route path="/account-management">
          <Route index element={<AccountManagement />} />
          <Route path="role" element={<RoleManagement />} />
          <Route path="account" element={<AccountManagement />} />
        </Route>
      </Route>

      {/* Fallback route - Chuyển hướng các đường dẫn không hợp lệ về login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
