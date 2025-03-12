import {
    BellOutlined,
} from "@ant-design/icons";
import { Button, Col, Row, Layout, Typography } from "antd";

const { Header, } = Layout;
const { Title, } = Typography;

const HeaderComponent: React.FC = () => {
  return (
    <Header style={{ background: "#fff", padding: 0 }}>
      <Row justify="space-between" align="middle" style={{ padding: "0 16px" }}>
        <Col>
          <Title level={3}>Tổng quan</Title>
        </Col>
        <Col>
          <Row align="middle">
            <Col>
              <Button type="link" icon={<BellOutlined />} />
            </Col>
            <Col>
              <Button type="primary" shape="circle" size="large">
                TP
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </Header>
  );
};

export default HeaderComponent;
