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
    Select,
} from "antd";
import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../../layouts/MainLayout";
import { ColumnType } from "antd/es/table";
import { API_URL } from "../../config/index";

// Định nghĩa kiểu cho Shift
interface Shift {
    ID: number;
    Name: string;
    Time_in: string;
    Time_out: string;
    Start_time_of: string;
    End_time_of: string;
    Is_default: number;
    Type_shift: string;
    Start_date: Date;
    Total_time: string;
    stt?: number;
    key?: number;
}

const { Content } = Layout;
const { Option } = Select;

const ShiftManagement: React.FC = () => {
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
            console.log("Fetching shifts from:", `${API_URL}/api/shifts`);
            const response = await axios.get(`${API_URL}/api/shifts`, {
                params: { name: search, page, pageSize },
            });
            const { data, pagination: paginationData } = response.data;
            setShifts(
                data.map((shift: Shift, index: number) => ({
                    ...shift,
                    stt: (page - 1) * pageSize + index + 1,
                    key: shift.ID,
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
                description: error.response?.data?.error || "Không thể tải danh sách ca làm việc.",
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

    const showEditModal = (shift: Shift) => {
        setEditingShift(shift);
        form.setFieldsValue({
            Name: shift.Name,
            Time_in: shift.Time_in,
            Time_out: shift.Time_out,
            Start_time_of: shift.Start_time_of,
            End_time_of: shift.End_time_of,
            Is_default: shift.Is_default === 1,
            Type_shift: shift.Type_shift,
            Start_date: shift.Start_date
                ? new Date(shift.Start_date).toISOString().split("T")[0]
                : undefined,
            Total_time: shift.Total_time,
        });
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                Name: values.Name as string,
                Time_in: values.Time_in as string,
                Time_out: values.Time_out as string,
                Start_time_of: values.Start_time_of as string,
                End_time_of: values.End_time_of as string,
                Is_default: values.Is_default ? 1 : 0,
                Type_shift: values.Type_shift as string,
                Start_date: values.Start_date ? new Date(values.Start_date).toISOString() : undefined,
                Total_time: values.Total_time as string,
            };

            if (editingShift) {
                const response = await axios.put<Shift>(
                    `${API_URL}/api/shifts/${editingShift.ID}`,
                    payload
                );
                setShifts(
                    shifts.map((shift) =>
                        shift.ID === editingShift.ID ? { ...shift, ...response.data } : shift
                    )
                );
                notificationApi.success({
                    message: "Cập nhật ca làm việc",
                    description: `Ca làm việc "${payload.Name}" đã được cập nhật thành công.`,
                    placement: "topRight",
                });
            } else {
                const response = await axios.post<Shift>(`${API_URL}/api/shifts`, payload);
                setShifts([...shifts, { ...response.data, stt: shifts.length + 1, key: response.data.ID }]);
                notificationApi.success({
                    message: "Thêm ca làm việc",
                    description: `Ca làm việc "${payload.Name}" đã được thêm thành công.`,
                    placement: "topRight",
                });
            }
            setIsModalVisible(false);
            fetchShifts(searchValue, pagination.current, pagination.pageSize);
        } catch (error: any) {
            console.error("Error saving shift:", error);
            notificationApi.error({
                message: "Lỗi khi lưu ca làm việc",
                description: error.response?.data?.error || "Không thể lưu ca làm việc.",
                placement: "topRight",
            });
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`${API_URL}/api/shifts/${id}`);
            const deletedShift = shifts.find((shift) => shift.ID === id);
            setShifts(shifts.filter((shift) => shift.ID !== id));
            notificationApi.success({
                message: "Xóa ca làm việc",
                description: `Ca làm việc "${deletedShift?.Name}" đã được xóa thành công.`,
                placement: "topRight",
            });
            fetchShifts(searchValue, pagination.current, pagination.pageSize);
        } catch (error: any) {
            console.error("Error deleting shift:", error);
            notificationApi.error({
                message: "Lỗi khi xóa ca làm việc",
                description: error.response?.data?.error || "Không thể xóa ca làm việc.",
                placement: "topRight",
            });
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingShift(null);
        form.resetFields();
    };

    const columns: ColumnType<Shift>[] = [
        {
            title: "STT",
            dataIndex: "stt",
            key: "stt",
        },
        {
            title: "Mã ca làm việc",
            dataIndex: "ID",
            key: "ID",
            sorter: (a: Shift, b: Shift) => a.ID - b.ID,
        },
        {
            title: "Tên ca làm việc",
            dataIndex: "Name",
            key: "Name",
        },
        {
            title: "Thời gian bắt đầu",
            dataIndex: "Time_in",
            key: "Time_in",
        },
        {
            title: "Thời gian kết thúc",
            dataIndex: "Time_out",
            key: "Time_out",
        },
        {
            title: "Loại ca",
            dataIndex: "Type_shift",
            key: "Type_shift",
            render: (type: string) => {
                const color = type === "1" ? "blue" : "purple";
                return <Tag color={color}>{type === "1" ? "Ca sáng" : "Ca tối"}</Tag>;
            },
            filters: [
                { text: "Ca sáng", value: "1" },
                { text: "Ca tối", value: "2" },
            ],
            onFilter: (value: any, record: Shift) => record.Type_shift === value,
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
        <MainLayout title="Quản lý ca làm việc">
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
                        locale: {
                            items_per_page: "/ trang",
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
                        <Col span={12}>
                            <Form.Item
                                name="Name"
                                label="Tên ca làm việc"
                                rules={[{ required: true, message: "Vui lòng nhập tên ca làm việc" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="Type_shift"
                                label="Loại ca"
                                rules={[{ required: true, message: "Vui lòng chọn loại ca" }]}
                            >
                                <Select placeholder="Chọn loại ca">
                                    <Option value="1">Ca sáng</Option>
                                    <Option value="2">Ca tối</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="Time_in"
                                label="Thời gian bắt đầu"
                                rules={[{ required: true, message: "Vui lòng nhập thời gian bắt đầu" }]}
                            >
                                <Input type="time" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="Time_out"
                                label="Thời gian kết thúc"
                                rules={[{ required: true, message: "Vui lòng nhập thời gian kết thúc" }]}
                            >
                                <Input type="time" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="Start_time_of"
                                label="Thời gian bắt đầu nghỉ trưa"
                                rules={[{ required: true, message: "Vui lòng nhập thời gian bắt đầu nghỉ trưa" }]}
                            >
                                <Input type="time" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="End_time_of"
                                label="Thời gian kết thúc nghỉ trưa"
                                rules={[{ required: true, message: "Vui lòng nhập thời gian kết thúc nghỉ trưa" }]}
                            >
                                <Input type="time" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="Start_date"
                                label="Ngày bắt đầu"
                                rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
                            >
                                <Input type="date" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="Total_time"
                                label="Tổng thời gian làm việc"
                                rules={[{ required: true, message: "Vui lòng nhập tổng thời gian làm việc" }]}
                            >
                                <Input placeholder="Ví dụ: 8 giờ" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="Is_default" label="Mặc định" valuePropName="checked">
                                <Switch checkedChildren="Có" unCheckedChildren="Không" />
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

export default ShiftManagement;