import {
  ApartmentOutlined,
  BarChartOutlined,
  CameraOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  HomeOutlined,
  LockOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Typography } from "antd";
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_URL } from "../config/index";
import "./Sidebar.css"; // Import file CSS tùy chỉnh
import "../App.css";
const { Sider } = Layout;
const { Title } = Typography;


const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST"
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const menuItems = [
    {
      key: "1",
      icon: <HomeOutlined />,
      label: <Link to="/overview">Tổng quan</Link>,
      path: "/overview",
    },
    {
      key: "3",
      icon: <ClockCircleOutlined />,
      label: <Link to="/timesheet">Quản lý chấm công</Link>,
      path: "/timesheet",
    },
    {
      key: "2",
      icon: <ApartmentOutlined />,
      label: "Cơ quan",
      children: [
        {
          key: "2-1",
          label: <Link to="/departments">Phòng ban</Link>,
          path: "/departments",
        },
        {
          key: "2-2",
          label: <Link to="/positions">Chức vụ</Link>,
          path: "/positions",
        },
        {
          key: "2-3",
          label: <Link to="/shifts">Ca làm</Link>,
          path: "/shifts"
        },
        {
          key: "2-4",
          label: <Link to="/staffs">Người dùng</Link>,
          path: "/staffs",
        },
        {
          key: "2-5",
          label: <Link to="/roles">Quyền</Link>,
          path: "/roles",
        },
      ],
    },
    {
      key: "7",
      icon: <CameraOutlined />,
      label: <Link to="/staff/image-capture">Lấy mẫu khuôn mặt</Link>,
      path: "/staff/image-capture",
    },
    {
      key: "4",
      icon: <FileTextOutlined />,
      label: "Quản lý đơn từ",
      path: "/document-management",
      children: [
        {
          key: "4-1",
          label: <Link to="/Dayoffs">Danh sách đơn từ</Link>,
          path: "/Dayoffs",
        },
        {
          key: "4-2",
          label: <Link to="/Dayoff-types">Loại đơn từ</Link>,
          path: "/Dayoff-types",
        },
      ],
    },
    {
      key: "5",
      icon: <BarChartOutlined />,
      label: <Link to="/reports">Báo cáo thống kê</Link>,
      path: "/reports",
    },
    {
      key: "6",
      icon: <LockOutlined />, // Đổi sang icon khóa
      label: <Link to="/change-password">Đổi mật khẩu</Link>,
      path: "/change-password",
    }
  ];

  const getSelectedKey = () => {
    // Kiểm tra các menu con trước
    for (const item of menuItems) {
      if (item.children) {
        for (const child of item.children) {
          if (child.path === location.pathname) {
            return child.key; // Trả về key của menu con nếu khớp
          }
        }
      }
      // Kiểm tra menu cha
      if (item.path === location.pathname) {
        return item.key; // Trả về key của menu cha nếu khớp
      }
    }
    return "1"; // Mặc định là "Tổng quan"
  };

  const openKeys = menuItems
    .filter((item) => item.children?.some((child) => child.path === location.pathname))
    .map((item) => item.key);

  return (
    <Sider width={300} style={{ background: "#208f39" }}>
      <div style={{ padding: "16px", textAlign: "center", color: "white" }}>
        <Title level={3} style={{ color: "white" }}>
          HM
        </Title>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        defaultOpenKeys={openKeys}
        style={{ background: "#208f39" }}
        className="sidebar-menu"
        items={menuItems}
      />
    </Sider>
  );
};

export default Sidebar;