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

// Định nghĩa kiểu cho Role
interface Role {
    ID: number;
    Name: string;
    Is_default: number;
    stt?: number;
    key?: number;
}

const { Content } = Layout;

const RoleManagement: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [form] = Form.useForm();
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [searchValue, setSearchValue] = useState<string>("");
    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [notificationApi, contextHolder] = notification.useNotification();

    const REACT_APP_SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:3000";

    const fetchRoles = async (search?: string, page = 1, pageSize = 10) => {
        try {
            console.log("Fetching roles from:", `${REACT_APP_SERVER_URL}/api/roles`);
            const response = await axios.get(`${REACT_APP_SERVER_URL}/api/roles`, {
                params: { name: search, page, pageSize },
            });
            const { data, pagination: paginationData } = response.data;
            setRoles(
                data.map((role: Role, index: number) => ({
                    ...role,
                    stt: (page - 1) * pageSize + index + 1,
                    key: role.ID,
                }))
            );
            setPagination({
                current: paginationData.page,
                pageSize: paginationData.pageSize,
                total: paginationData.total,
            });
        } catch (error: any) {
            console.error("Error fetching roles:", error);
            notificationApi.error({
                message: "Lỗi khi lấy danh sách",
                description: error.response?.data?.error || "Không thể tải danh sách vai trò.",
                placement: "topRight",
            });
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleSearch = (value: string) => {
        setSearchValue(value);
        fetchRoles(value, pagination.current, pagination.pageSize);
    };

    const handleTableChange = (newPagination: TablePaginationConfig) => {
        fetchRoles(searchValue, newPagination.current, newPagination.pageSize);
    };

    const showAddModal = () => {
        setEditingRole(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const showEditModal = (role: Role) => {
        setEditingRole(role);
        form.setFieldsValue({
            Name: role.Name,
            Is_default: role.Is_default === 1,
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

            if (editingRole) {
                const response = await axios.put<Role>(
                    `${REACT_APP_SERVER_URL}/api/roles/${editingRole.ID}`,
                    payload
                );
                setRoles(
                    roles.map((role) =>
                        role.ID === editingRole.ID ? { ...role, ...response.data } : role
                    )
                );
                notificationApi.success({
                    message: "Cập nhật vai trò",
                    description: `Vai trò "${payload.Name}" đã được cập nhật thành công.`,
                    placement: "topRight",
                });
            } else {
                const response = await axios.post<Role>(`${REACT_APP_SERVER_URL}/api/roles`, payload);
                setRoles([...roles, { ...response.data, stt: roles.length + 1, key: response.data.ID }]);
                notificationApi.success({
                    message: "Thêm vai trò",
                    description: `Vai trò "${payload.Name}" đã được thêm thành công.`,
                    placement: "topRight",
                });
            }
            setIsModalVisible(false);
            fetchRoles(searchValue, pagination.current, pagination.pageSize);
        } catch (error: any) {
            console.error("Error saving role:", error);
            notificationApi.error({
                message: "Lỗi khi lưu vai trò",
                description: error.response?.data?.error || "Không thể lưu vai trò.",
                placement: "topRight",
            });
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`${REACT_APP_SERVER_URL}/api/roles/${id}`);
            const deletedRole = roles.find((role) => role.ID === id);
            setRoles(roles.filter((role) => role.ID !== id));
            notificationApi.success({
                message: "Xóa vai trò",
                description: `Vai trò "${deletedRole?.Name}" đã được xóa thành công.`,
                placement: "topRight",
            });
            fetchRoles(searchValue, pagination.current, pagination.pageSize);
        } catch (error: any) {
            console.error("Error deleting role:", error);
            notificationApi.error({
                message: "Lỗi khi xóa vai trò",
                description: error.response?.data?.error || "Không thể xóa vai trò.",
                placement: "topRight",
            });
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingRole(null);
        form.resetFields();
    };

    // Khai báo kiểu rõ ràng cho columns
    const columns: ColumnType<Role>[] = [
        {
            title: "STT",
            dataIndex: "stt",
            key: "stt",
        },
        {
            title: "Mã vị trí",
            dataIndex: "ID",
            key: "ID",
            sorter: (a: Role, b: Role) => a.ID - b.ID,
        },
        {
            title: "Tên vị trí",
            dataIndex: "Name",
            key: "Name",
        },
        {
            title: "Mặc định",
            dataIndex: "Is_default",
            key: "Is_default",
            render: (state: number) => {
                const color = state === 1 ? "green" : "gray";
                return <Tag color={color}>{state === 1 ? "Có" : "Không"}</Tag>;
            },
            filters: [
                { text: "Có", value: 1 },
                { text: "Không", value: 0 },
            ],
            onFilter: (value: any, record: Role) => record.Is_default === value,
        },
        {
            title: "Tác vụ",
            key: "action",
            render: (_: any, record: Role) => (
                <Space size="middle">
                    <Button icon={<FormOutlined />} onClick={() => showEditModal(record)} />
                    <Button icon={<RestOutlined />} onClick={() => handleDelete(record.ID)} />
                </Space>
            ),
        },
    ];

    return (
        <MainLayout title="Quản lý vai trò">
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
                    dataSource={roles}
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
                title={editingRole ? "Sửa vai trò" : "Tạo mới vai trò"}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={null}
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="Name"
                                label="Tên vị trí"
                                rules={[{ required: true, message: "Vui lòng nhập tên vị trí" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="Is_default" label="Mặc định" valuePropName="checked">
                                <Switch checkedChildren="Có" unCheckedChildren="Không" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify="end">
                        <Space>
                            <Button type="primary" onClick={handleOk}>
                                {editingRole ? "Cập nhật" : "Tạo mới"}
                            </Button>
                            <Button onClick={handleCancel}>Hủy bỏ</Button>
                        </Space>
                    </Row>
                </Form>
            </Modal>
        </MainLayout>
    );
};

export default RoleManagement;