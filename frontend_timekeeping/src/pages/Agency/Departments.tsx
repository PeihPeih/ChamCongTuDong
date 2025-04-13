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
interface Department {
    ID: number;
    Name: string;
    stt?: number;
    key?: number;
}

const { Content } = Layout;

const Department: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [form] = Form.useForm();
    const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
    const [searchValue, setSearchValue] = useState<string>("");
    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [notificationApi, contextHolder] = notification.useNotification();

    const fetchDepartments = async (search?: string, page = 1, pageSize = 10) => {
        try {
            const response = await axios.get(`${API_URL}/api/departments`, {
                params: { name: search, page, pageSize },
            });
            const { data, pagination: paginationData } = response.data;
            setDepartments(
                data.map((department: Department, index: number) => ({
                    ...department,
                    stt: (page - 1) * pageSize + index + 1,
                    key: department.ID,
                }))
            );
            setPagination({
                current: paginationData.page,
                pageSize: paginationData.pageSize,
                total: paginationData.total,
            });
        } catch (error: any) {
            console.error("Error fetching departments:", error);
            notificationApi.error({
                message: "Lỗi khi lấy danh sách",
                description: error.response?.data?.error || "Không thể tải danh sách phòng ban.",
                placement: "topRight",
            });
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleSearch = (value: string) => {
        setSearchValue(value);
        fetchDepartments(value, pagination.current, pagination.pageSize);
    };

    const handleTableChange = (newPagination: TablePaginationConfig) => {
        fetchDepartments(searchValue, newPagination.current, newPagination.pageSize);
    };

    const showAddModal = () => {
        setEditingDepartment(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const showEditModal = (department: Department) => {
        setEditingDepartment(department);
        form.setFieldsValue({
            Name: department.Name,
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

            if (editingDepartment) {
                const response = await axios.put<Department>(
                    `${API_URL}/api/departments/${editingDepartment.ID}`,
                    payload
                );
                setDepartments(
                    departments.map((department) =>
                        department.ID === editingDepartment.ID ? { ...department, ...response.data } : department
                    )
                );
                notificationApi.success({
                    message: "Cập nhật phòng ban",
                    description: `phòng ban "${payload.Name}" đã được cập nhật thành công.`,
                    placement: "topRight",
                });
            } else {
                const response = await axios.post<Department>(`${API_URL}/api/departments`, payload);
                setDepartments([...departments, { ...response.data, stt: departments.length + 1, key: response.data.ID }]);
                notificationApi.success({
                    message: "Thêm phòng ban",
                    description: `phòng ban "${payload.Name}" đã được thêm thành công.`,
                    placement: "topRight",
                });
            }
            setIsModalVisible(false);
            fetchDepartments(searchValue, pagination.current, pagination.pageSize);
        } catch (error: any) {
            console.error("Error saving role:", error);
            notificationApi.error({
                message: "Lỗi khi lưu phòng ban",
                description: error.response?.data?.error || "Không thể lưu phòng ban.",
                placement: "topRight",
            });
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`${API_URL}/api/departments/${id}`);
            const deletedDepartment = departments.find((department) => department.ID === id);
            setDepartments(departments.filter((department) => department.ID !== id));
            notificationApi.success({
                message: "Xóa phòng ban",
                description: `phòng ban "${deletedDepartment?.Name}" đã được xóa thành công.`,
                placement: "topRight",
            });
            fetchDepartments(searchValue, pagination.current, pagination.pageSize);
        } catch (error: any) {
            console.error("Error deleting role:", error);
            notificationApi.error({
                message: "Lỗi khi xóa phòng ban",
                description: error.response?.data?.error || "Không thể xóa phòng ban.",
                placement: "topRight",
            });
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingDepartment(null);
        form.resetFields();
    };

    // Khai báo kiểu rõ ràng cho columns
    const columns: ColumnType<Department>[] = [
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
            render: (_: any, record: Department) => (
                <Space size="middle">
                    <Button icon={<FormOutlined />} onClick={() => showEditModal(record)} />
                    <Button icon={<RestOutlined />} onClick={() => handleDelete(record.ID)} />
                </Space>
            ),
        },
    ];

    return (
        <MainLayout title="Quản lý phòng ban">
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
                    dataSource={departments}
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
                title={editingDepartment ? "Sửa phòng ban" : "Tạo mới phòng ban"}
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
                                label="Tên phòng ban"
                                rules={[{ required: true, message: "Vui lòng nhập tên phòng ban" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify="end">
                        <Space>
                            <Button type="primary" onClick={handleOk}>
                                {editingDepartment ? "Cập nhật" : "Tạo mới"}
                            </Button>
                            <Button onClick={handleCancel}>Hủy bỏ</Button>
                        </Space>
                    </Row>
                </Form>
            </Modal>
        </MainLayout>
    );
};

export default Department;