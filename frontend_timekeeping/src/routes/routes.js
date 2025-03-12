import React from "react";
import { Route, Routes } from "react-router-dom";
import LoginPage from "../pages/login/LoginPage";
import AccountManagement from "../pages/account-management/AccountManagement";
import OverView from "../pages/overview/Overview";
import TimeManagement from "../pages/time-management/TimeManagement";
import DocumentManagement from "../pages/document-management/DocumentManagement";
import Reports from "../pages/reports/Reports";


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/overview" element={<OverView />} />
      <Route path="/time-management" element={<TimeManagement />} />
      <Route path="/account-management" element={<AccountManagement />} />
      <Route path="/document-management" element={<DocumentManagement />} />
      <Route path="/reports" element={<Reports />} />
    </Routes>
  );
};

export default AppRoutes;
