import {
  BarChartOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Typography } from "antd";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css"; // Import file CSS tùy chỉnh

import "../App.css";

const { Sider } = Layout;
const { Title } = Typography;

const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    {
      key: "1",
      icon: <HomeOutlined />,
      label: <Link to="/overview">Tổng quan</Link>,
      path: "/overview",
    },
    {
      key: "2",
      icon: <UserOutlined />,
      label: "Quản lý tài khoản",
      path: "/account-management",
      children: [
        {
          key: "2-1",
          label: <Link to="/account-management/role">Role</Link>,
          path: "/account-management/role",
        },
        {
          key: "2-2",
          label: <Link to="/account-management/account">Account</Link>,
          path: "/account-management/account",
        },
      ],
    },
    {
      key: "3",
      icon: <ClockCircleOutlined />,
      label: <Link to="/time-management">Quản lý chấm công</Link>,
      path: "/time-management",
    },
    {
      key: "4",
      icon: <FileTextOutlined />,
      label: <Link to="/document-management">Quản lý đơn từ</Link>,
      path: "/document-management",
    },
    {
      key: "5",
      icon: <BarChartOutlined />,
      label: <Link to="/reports">Báo cáo thống kê</Link>,
      path: "/reports",
    },
    {
      key: "6",
      icon: <LogoutOutlined />,
      label: <Link to="/logout">Đăng xuất</Link>,
      path: "/logout",
    },
  ];

  const getSelectedKey = () => {
    for (const item of menuItems) {
      if (item.path === location.pathname) return item.key;
      if (item.children) {
        for (const child of item.children) {
          if (child.path === location.pathname) return child.key;
        }
      }
    }
    return "1";
  };

  const openKeys = menuItems
    .filter(item => item.children?.some(child => child.path === location.pathname))
    .map(item => item.key);

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
        items={[
          {
            key: "1",
            icon: <HomeOutlined />,
            label: <Link to="/overview">Tổng quan</Link>, // Thêm href bằng Link
          },
          {
            key: "2",
            icon: <UserOutlined />,
            label: <Link to="/account-management">Quản lý tài khoản</Link>,
          },
          {
            key: "3",
            icon: <ClockCircleOutlined />,
            label: <Link to="/timesheet">Quản lý chấm công</Link>,
          },
          {
            key: "4",
            icon: <FileTextOutlined />,
            label: "Đơn từ",
            children: [
              {
                key: "4-1",
                label: <Link to="/Dayoffs">Danh sách đơn từ</Link>,
              },
              {
                key: "4-2",
                label: <Link to="/Dayoff-types">Loại đơn từ</Link>,
              },
            ],
          },
          {
            key: "5",
            icon: <BarChartOutlined />,
            label: <Link to="/reports">Báo cáo thống kê</Link>,
          },
          {
            key: "6",
            icon: <LogoutOutlined />,
            label: <Link to="/logout">Đăng xuất</Link>,
          },
        ]}
      />
    </Sider>
  );
};

export default Sidebar;