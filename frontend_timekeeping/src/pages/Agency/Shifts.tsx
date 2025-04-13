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
import { TimePicker, Select } from "antd";

// Định nghĩa kiểu cho Role
interface Shift {
    ID: number;
    Name: string;
    Time_in: string;
    Time_out: string;
    Is_default: number;
    Type_shift: number;
    Start_date: string;
    Total_time: string;
    stt?: number;
    key?: number;
}

const { Content } = Layout;
const { Option } = Select;

const Shift: React.FC = () => {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [form] = Form.useForm();
    const [editingShift, setEditingShift] = useState<Shift | null>(null);
    const [searchValue, setSearchValue] = useState<string>("");
    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [notificationApi, contextHolder] = notification.useNotification();

    const fetchShifts = async (search?: string, page = 1, pageSize = 10) => {
        try {
            const response = await axios.get(`${API_URL}/api/shifts`, {
                params: { name: search, page, pageSize },
            });
            const { data, pagination: paginationData } = response.data;
            setShifts(
                data.map((Shift: Shift, index: number) => ({
                    ...Shift,
                    stt: (page - 1) * pageSize + index + 1,
                    key: Shift.ID,
                }))
            );
            setPagination({
                current: paginationData.page,
                pageSize: paginationData.pageSize,
                total: paginationData.total,
            });
        } catch (error: any) {
            console.error("Error fetching shifts:", error);
            notificationApi.error({
                message: "Lỗi khi lấy danh sách",
                description: error.response?.data?.error || "Không thể tải danh sách ca làm.",
                placement: "topRight",
            });
        }
    };

    useEffect(() => {
        fetchShifts();
    }, []);

    const handleSearch = (value: string) => {
        setSearchValue(value);
        fetchShifts(value, pagination.current, pagination.pageSize);
    };

    const handleTableChange = (newPagination: TablePaginationConfig) => {
        fetchShifts(searchValue, newPagination.current, newPagination.pageSize);
    };

    const showAddModal = () => {
        setEditingShift(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const showEditModal = (Shift: Shift) => {
        setEditingShift(Shift);
        form.setFieldsValue({
            Name: Shift.Name,
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

            if (editingShift) {
                const response = await axios.put<Shift>(
                    `${API_URL}/api/shifts/${editingShift.ID}`,
                    payload
                );
                setShifts(
                    shifts.map((Shift) =>
                        Shift.ID === editingShift.ID ? { ...Shift, ...response.data } : Shift
                    )
                );
                notificationApi.success({
                    message: "Cập nhật ca làm",
                    description: `ca làm "${payload.Name}" đã được cập nhật thành công.`,
                    placement: "topRight",
                });
            } else {
                const response = await axios.post<Shift>(`${API_URL}/api/shifts`, payload);
                setShifts([...shifts, { ...response.data, stt: shifts.length + 1, key: response.data.ID }]);
                notificationApi.success({
                    message: "Thêm ca làm",
                    description: `ca làm "${payload.Name}" đã được thêm thành công.`,
                    placement: "topRight",
                });
            }
            setIsModalVisible(false);
            fetchShifts(searchValue, pagination.current, pagination.pageSize);
        } catch (error: any) {
            console.error("Error saving role:", error);
            notificationApi.error({
                message: "Lỗi khi lưu ca làm",
                description: error.response?.data?.error || "Không thể lưu ca làm.",
                placement: "topRight",
            });
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`${API_URL}/api/shifts/${id}`);
            const deletedShift = shifts.find((Shift) => Shift.ID === id);
            setShifts(shifts.filter((Shift) => Shift.ID !== id));
            notificationApi.success({
                message: "Xóa ca làm",
                description: `ca làm "${deletedShift?.Name}" đã được xóa thành công.`,
                placement: "topRight",
            });
            fetchShifts(searchValue, pagination.current, pagination.pageSize);
        } catch (error: any) {
            console.error("Error deleting role:", error);
            notificationApi.error({
                message: "Lỗi khi xóa ca làm",
                description: error.response?.data?.error || "Không thể xóa ca làm.",
                placement: "topRight",
            });
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingShift(null);
        form.resetFields();
    };

    // Khai báo kiểu rõ ràng cho columns
    const columns: ColumnType<Shift>[] = [
        {
            title: "STT",
            dataIndex: "stt",
            key: "stt",
        },
        {
            title: "Tên ca",
            dataIndex: "Name",
            key: "Name",
        },
        {
            title: "Giờ vào",
            dataIndex: "Time_in",
            key: "Time_in",
        },
        {
            title: "Giờ ra",
            dataIndex: "Time_out",
            key: "Time_out",
        },
        {
            title: "Loại ca",
            dataIndex: "Type_shift",
            key: "Type_shift",
            render: (type: number) => {
                const typeMap: { [key: number]: string } = {
                    1: "Ca ngày",
                    2: "Ca đêm",
                };
                return typeMap[type] || "Không xác định";
            },
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
            onFilter: (value: any, record: Shift) => record.Is_default === value,
        },
        {
            title: "Tổng thời gian",
            dataIndex: "Total_time",
            key: "Total_time",
        },
        {
            title: "Tác vụ",
            key: "action",
            render: (_: any, record: Shift) => (
                <Space size="middle">
                    <Button icon={<FormOutlined />} onClick={() => showEditModal(record)} />
                    <Button icon={<RestOutlined />} onClick={() => handleDelete(record.ID)} />
                </Space>
            ),
        },
    ];

    return (
        <MainLayout title="Quản lý ca làm">
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
                    dataSource={shifts}
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
                title={editingShift ? "Sửa ca làm việc" : "Tạo mới ca làm việc"}
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
                                label="Tên ca"
                                rules={[{ required: true, message: "Vui lòng nhập tên ca" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="Time_in"
                                label="Giờ vào"
                                rules={[{ required: true, message: "Vui lòng chọn giờ vào" }]}
                            >
                                <TimePicker format="HH:mm" style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="Time_out"
                                label="Giờ ra"
                                rules={[{ required: true, message: "Vui lòng chọn giờ ra" }]}
                            >
                                <TimePicker format="HH:mm" style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="Type_shift"
                                label="Loại ca"
                                rules={[{ required: true, message: "Vui lòng chọn loại ca" }]}
                            >
                                <Select placeholder="Chọn loại ca">
                                    <Select.Option value={1}>Ca ngày</Select.Option>
                                    <Select.Option value={2}>Ca đêm</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="Is_default"
                                label="Mặc định"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify="end">
                        <Space>
                            <Button type="primary" onClick={handleOk}>
                                {editingShift ? "Cập nhật" : "Tạo mới"}
                            </Button>
                            <Button onClick={handleCancel}>Hủy bỏ</Button>
                        </Space>
                    </Row>
                </Form>
            </Modal>
        </MainLayout>
    );
};

export default Shift;