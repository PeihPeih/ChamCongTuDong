import {
    FormOutlined,
    PlusOutlined,
    RestOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import {
    Button,
    Col,
    Form,
    Input,
    Layout,
    Modal,
    Row,
    Space,
    Switch,
    Table,
    Tag,
    notification,
    TablePaginationConfig,
} from "antd";
import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../../layouts/MainLayout";
import { ColumnType } from "antd/es/table";
import { API_URL } from "../../config/index";

// Định nghĩa kiểu cho Role
interface Position {
    ID: number;
    Name: string;
    stt?: number;
    key?: number;
}

const { Content } = Layout;

const Position: React.FC = () => {
    const [positions, setPositions] = useState<Position[]>([]);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [form] = Form.useForm();
    const [editingPosition, setEditingPosition] = useState<Position | null>(null);
    const [searchValue, setSearchValue] = useState<string>("");
    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [notificationApi, contextHolder] = notification.useNotification();

    const fetchPositions = async (search?: string, page = 1, pageSize = 10) => {
        try {
            const response = await axios.get(`${API_URL}/api/positions`, {
                params: { name: search, page, pageSize },
            });
            const { data, pagination: paginationData } = response.data;
            setPositions(
                data.map((pos: Position, index: number) => ({
                    ...pos,
                    stt: (page - 1) * pageSize + index + 1,
                    key: pos.ID,
                }))
            );
            setPagination({
                current: paginationData.page,
                pageSize: paginationData.pageSize,
                total: paginationData.total,
            });
        } catch (error: any) {
            notificationApi.error({
                message: "Lỗi khi lấy danh sách",
                description: error.response?.data?.error || "Không thể tải danh sách chức vụ.",
                placement: "topRight",
            });
        }
    };

    useEffect(() => {
        fetchPositions();
    }, []);

    const handleSearch = (value: string) => {
        setSearchValue(value);
        fetchPositions(value, pagination.current, pagination.pageSize);
    };

    const handleTableChange = (newPagination: TablePaginationConfig) => {
        fetchPositions(searchValue, newPagination.current, newPagination.pageSize);
    };

    const showAddModal = () => {
        setEditingPosition(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const showEditModal = (pos: Position) => {
        setEditingPosition(pos);
        form.setFieldsValue({
            Name: pos.Name,
        });
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                Name: values.Name as string,
                Is_default: values.Is_default ? 1 : 0,
            };

            if (editingPosition) {
                const response = await axios.put<Position>(
                    `${API_URL}/api/positionss/${editingPosition.ID}`,
                    payload
                );
                setPositions(
                    positions.map((pos) =>
                        pos.ID === editingPosition.ID ? { ...pos, ...response.data } : pos
                    )
                );
                notificationApi.success({
                    message: "Cập nhật chức vụ",
                    description: `chức vụ "${payload.Name}" đã được cập nhật thành công.`,
                    placement: "topRight",
                });
            } else {
                const response = await axios.post<Position>(`${API_URL}/api/positions`, payload);
                setPositions([...positions, { ...response.data, stt: positions.length + 1, key: response.data.ID }]);
                notificationApi.success({
                    message: "Thêm chức vụ",
                    description: `chức vụ "${payload.Name}" đã được thêm thành công.`,
                    placement: "topRight",
                });
            }
            setIsModalVisible(false);
            fetchPositions(searchValue, pagination.current, pagination.pageSize);
        } catch (error: any) {
            console.error("Error saving role:", error);
            notificationApi.error({
                message: "Lỗi khi lưu chức vụ",
                description: error.response?.data?.error || "Không thể lưu chức vụ.",
                placement: "topRight",
            });
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`${API_URL}/api/positions/${id}`);
            const deletedPosition = positions.find((pos) => pos.ID === id);
            setPositions(positions.filter((pos) => pos.ID !== id));
            notificationApi.success({
                message: "Xóa chức vụ",
                description: `chức vụ "${deletedPosition?.Name}" đã được xóa thành công.`,
                placement: "topRight",
            });
            fetchPositions(searchValue, pagination.current, pagination.pageSize);
        } catch (error: any) {
            console.error("Error deleting role:", error);
            notificationApi.error({
                message: "Lỗi khi xóa chức vụ",
                description: error.response?.data?.error || "Không thể xóa chức vụ.",
                placement: "topRight",
            });
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingPosition(null);
        form.resetFields();
    };

    // Khai báo kiểu rõ ràng cho columns
    const columns: ColumnType<Position>[] = [
        {
            title: "STT",
            dataIndex: "stt",
            key: "stt",
        },
        {
            title: "Tên",
            dataIndex: "Name",
            key: "Name",
        },
        {
            title: "Tác vụ",
            key: "action",
            render: (_: any, record: Position) => (
                <Space size="middle">
                    <Button icon={<FormOutlined />} onClick={() => showEditModal(record)} />
                    <Button icon={<RestOutlined />} onClick={() => handleDelete(record.ID)} />
                </Space>
            ),
        },
    ];

    return (
        <MainLayout title="Quản lý chức vụ">
            {contextHolder}
            <Row gutter={16} style={{ marginTop: "16px" }}>
                <Col span={6}></Col>
                <Col span={12}>
                    <Input
                        placeholder="Tìm kiếm theo tên"
                        value={searchValue}
                        onChange={(e) => handleSearch(e.target.value)}
                        prefix={<SearchOutlined />}
                        style={{ width: "100%" }}
                    />
                </Col>
                <Col span={4}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
                        Thêm mới
                    </Button>
                </Col>
            </Row>
            <Content style={{ margin: "16px" }}>
                <Table
                    dataSource={positions}
                    columns={columns}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        pageSizeOptions: ["5", "10", "20", "50"],
                        showSizeChanger: true,
                        onChange: (page, pageSize) =>
                            handleTableChange({ current: page, pageSize }),
                        // showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} trang`, // Tùy chọn nếu bạn muốn
                        locale: {
                            items_per_page: "/ trang", // Tùy chỉnh văn bản "per page" thành "trang"
                        },
                    }}
                />
            </Content>
            <Modal
                title={editingPosition ? "Sửa chức vụ" : "Tạo mới chức vụ"}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={null}
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="Name"
                                label="Tên chức vụ"
                                rules={[{ required: true, message: "Vui lòng nhập tên chức vụ" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify="end">
                        <Space>
                            <Button type="primary" onClick={handleOk}>
                                {editingPosition ? "Cập nhật" : "Tạo mới"}
                            </Button>
                            <Button onClick={handleCancel}>Hủy bỏ</Button>
                        </Space>
                    </Row>
                </Form>
            </Modal>
        </MainLayout>
    );
};

export default Position;