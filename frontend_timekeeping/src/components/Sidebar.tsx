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
import { Link, useNavigate } from "react-router-dom"; // Thêm useNavigate và Link

const { Sider } = Layout;
const { Title } = Typography;

const Sidebar: React.FC = () => {
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
        defaultSelectedKeys={["1"]}
        style={{ background: "#208f39" }}
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
            label: <Link to="/time-management">Quản lý chấm công</Link>,
          },
          {
            key: "4",
            icon: <FileTextOutlined />,
            label: <Link to="/document-management">Quản lý đơn từ</Link>,
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