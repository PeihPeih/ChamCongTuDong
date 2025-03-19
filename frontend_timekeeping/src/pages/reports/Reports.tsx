import {
    BellOutlined,
    CloseOutlined,
    FilterOutlined,
    HomeOutlined,
    PlusOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import {
    Button,
    Col,
    DatePicker,
    Form,
    Input,
    Layout,
    Menu,
    Modal,
    Row,
    Select,
    Space,
    Table,
    Tag,
    Typography,
} from "antd";
import React from "react";
import MainLayout from "../../layouts/MainLayout";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const dataSource = [
    {
        key: "1",
        stt: "01",
        maDon: "DT00001",
        loaiDon: "Nghỉ phép",
        nguoiDuyet: "Lê Hoàng Vũ",
        nguoiLienQuan: "Hoàng Văn Hải",
        ngayTao: "10/02/2023",
        trangThai: "WAIT",
    },
    // Add more data as needed
];

const columns = [
    {
        title: "STT",
        dataIndex: "stt",
        key: "stt",
    },
    {
        title: "Mã đơn",
        dataIndex: "maDon",
        key: "maDon",
    },
    {
        title: "Loại đơn",
        dataIndex: "loaiDon",
        key: "loaiDon",
    },
    {
        title: "Người duyệt",
        dataIndex: "nguoiDuyet",
        key: "nguoiDuyet",
    },
    {
        title: "Người liên quan",
        dataIndex: "nguoiLienQuan",
        key: "nguoiLienQuan",
    },
    {
        title: "Ngày tạo",
        dataIndex: "ngayTao",
        key: "ngayTao",
    },
    {
        title: "Trạng thái",
        dataIndex: "trangThai",
        key: "trangThai",
        render: (text: any) => {
            const color =
                text === "WAIT" ? "gold" : text === "APPROVED" ? "green" : "red";
            return <Tag color={color}>{text}</Tag>;
        },
    },
    {
        title: "Tác vụ",
        key: "action",
        render: () => (
            <Space size="middle">
                <Button icon={<SearchOutlined />} />
                <Button icon={<CloseOutlined />} />
            </Space>
        ),
    },
];

const Reports: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = React.useState(false);

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <MainLayout title="Báo cáo thống kê">
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showModal}
            >
                + Thêm mới
            </Button>
            <Content style={{ margin: "16px" }}>
                <Table
                    dataSource={dataSource}
                    columns={columns}
                    pagination={{ pageSize: 10 }}
                />
            </Content>
            <Modal
                title="Tạo mới đơn từ"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={null}
            >
                <Form layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Họ và tên" required>
                                <Input value="Phạm Văn Hòa" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Tiêu đề đơn" required>
                                <Input placeholder="Nhập Tiêu đề đơn" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Loại đơn" required>
                                <Select placeholder="Chọn loại đơn">
                                    <Option value="nghiPhep">Nghỉ phép</Option>
                                    <Option value="tangCa">Tăng ca</Option>
                                    <Option value="lamBu">Làm bù</Option>
                                    <Option value="xacNhanCong">Xác nhận công</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Người liên quan" required>
                                <Input placeholder="Nhấn @ để chọn tên người liên quan" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Người duyệt" required>
                                <Input placeholder="Nhấn @ để chọn tên người duyệt" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Từ ngày" required>
                                <DatePicker style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Đến ngày" required>
                                <DatePicker style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Ghi chú">
                                <Input placeholder="Nhập ghi chú" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify="end">
                        <Space>
                            <Button type="primary" onClick={handleOk}>
                                Gửi
                            </Button>
                            <Button onClick={handleCancel}>Hủy bỏ</Button>
                        </Space>
                    </Row>
                </Form>
            </Modal>
        </MainLayout>
    );
};

export default Reports;
