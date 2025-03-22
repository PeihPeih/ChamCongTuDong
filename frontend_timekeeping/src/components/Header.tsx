import { BellOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Col, Row, Layout, Typography, Dropdown, Menu, Space } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;
const { Title } = Typography;

const API_URL = "http://localhost:3000"

type User = {
  id: string;
  username: string;
  Fullname: string;
  role: string;
  Email: string;
};

const HeaderComponent: React.FC<{ title: string }> = ({ title }) => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const userInfo = (
    <Menu>
      <Menu.Item key="1">
        <strong>Họ tên:</strong> {user ? user.Fullname : ""}
      </Menu.Item>
      <Menu.Item key="2">
        <strong>Tên đăng nhập:</strong> {user ? user.Email : ""}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="4" icon={<LogoutOutlined />} onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <Header style={{ background: "#fff", padding: 0, marginBottom: "16px" }}>
      <Row justify="space-between" align="middle" style={{ padding: "0 16px" }}>
        <Col>
          <Title level={3}>{title}</Title>
        </Col>
        <Col>
          <Row align="middle">
            <Col>
              <Button type="link" icon={<BellOutlined />} />
            </Col>
            <Col>
              <Dropdown overlay={userInfo} trigger={["click"]} onVisibleChange={setVisible} visible={visible}>
                <Button type="primary" shape="circle" size="large">
                  TP
                </Button>
              </Dropdown>
            </Col>
          </Row>
        </Col>
      </Row>
    </Header>
  );
};

export default HeaderComponent;
