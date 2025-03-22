// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    // Kiểm tra token trong localStorage
    const token = localStorage.getItem('token');

    // Nếu không có token, chuyển hướng về trang login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Nếu có token, hiển thị các route con
    return <Outlet />;
};

export default ProtectedRoute;