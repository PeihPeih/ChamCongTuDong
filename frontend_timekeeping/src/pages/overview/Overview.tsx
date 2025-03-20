import {
    CalendarOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import { Button, Calendar, Col, Input, Layout, Row, Typography } from "antd";
import React from "react";
import MainLayout from "../../layouts/MainLayout";

const { Content } = Layout;
const { Title, Text } = Typography;

const OverView: React.FC = () => {
    const renderDateCell = (value: any) => {
        const date = value.date();
        const month = value.month();
        const year = value.year();

        if (month === 2 - 1 && year === 2023) {
            if (date === 1) {
                return (
                    <div>
                        <Text strong={true}>08:23 - 17:45</Text>
                        <div>1</div>
                    </div>
                );
            } else if (date === 2) {
                return (
                    <div>
                        <Text strong={true}>08:45 - 17:15</Text>
                        <div>0.84</div>
                        <Text type="danger">Đi muộn - Về sớm</Text>
                    </div>
                );
            } else if (date === 4) {
                return (
                    <div>
                        <Text strong={true}>08:23 - 20:15</Text>
                        <div>1.35</div>
                        <Text type="success">Tăng ca - Làm thêm</Text>
                    </div>
                );
            } else if (date === 3) {
                return <Text type="danger">Nghỉ</Text>;
            }
        }
        return null;
    };

    return (
        <MainLayout title="Tổng quan">
            <Content style={{ margin: "16px" }}>
                <Row gutter={16} style={{ marginBottom: "16px" }}>
                    <Col flex="auto">
                        <Input size="large" placeholder="Tìm kiếm ngày chấm công" prefix={<SearchOutlined />} />
                    </Col>
                    <Col>
                        <Button type="primary" size="large" icon={<CalendarOutlined />}>
                            Chọn tháng
                        </Button>
                    </Col>
                </Row>
                <div style={{ background: "#fff", padding: "16px", borderRadius: "8px" }}>
                    <Title level={4} style={{ textAlign: "center" }}>
                        Bảng chấm công tháng 3, 2023
                    </Title>
                    <Text style={{ display: "block", textAlign: "center", marginBottom: "16px" }}>
                        01/03/2023 - 31/03/2023
                    </Text>
                    <Calendar dateCellRender={renderDateCell} />
                </div>
            </Content>
        </MainLayout>
    );
};

export default OverView;
