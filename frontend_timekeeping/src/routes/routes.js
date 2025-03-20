import React from "react";
import { Route, Routes } from "react-router-dom";
import LoginPage from "../pages/login/LoginPage";
import AccountManagement from "../pages/account-management/AccountManagement";
import OverView from "../pages/overview/Overview";
import TimeManagement from "../pages/TimeKeeping/Timekeeping";
import Dayoffs from "../pages/Dayoffs/Dayoffs";
import DayoffTypes from "../pages/Dayoff-type/Dayoff-type";
import Reports from "../pages/reports/Reports";
// Import các component mới cho Role và Account
import RoleManagement from "../pages/account-management/RoleManagement"; // Giả định

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/overview" element={<OverView />} />
      <Route path="/timesheet" element={<TimeManagement />} />
      <Route path="/account-management" element={<AccountManagement />} />
      <Route path="/document-management">
        <Route index element={<Dayoffs />} />{" "}
        <Route path="dayoffs" element={<Dayoffs />} />{" "}
        <Route path="dayoff-types" element={<DayoffTypes />} />{" "}
      </Route>
      <Route path="/account-management">
        <Route index element={<AccountManagement />} />{" "}
        <Route path="role" element={<RoleManagement />} />{" "}
        <Route path="account" element={<AccountManagement />} />{" "}
      </Route>
      <Route path="/reports" element={<Reports />} />
    </Routes>
  );
};

export default AppRoutes;
