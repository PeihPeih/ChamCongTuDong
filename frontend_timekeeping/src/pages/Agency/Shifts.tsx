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
    DatePicker,
    InputNumber,
} from "antd";
import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../../layouts/MainLayout";
import { ColumnType } from "antd/es/table";
import { API_URL } from "../../config/index";
import { TimePicker, Select } from "antd";
import moment from "moment";

// Định nghĩa kiểu cho Shift
interface Shift {
    ID: number;
    Name: string;
    Time_in: string;
    Time_out: string;
    Start_time_of: string;
    End_time_of: string;
    Is_default: number;
    Type_shift: number;
    Start_date: string;
    Total_time: number;
    stt?: number;
    key?: number;
}

const { Content } = Layout;
const { Option } = Select;

const Shift: React.FC = () => {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [form] = Form.useForm();
    const [searchForm] = Form.useForm();
    const [editingShift, setEditingShift] = useState<Shift | null>(null);
    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [notificationApi, contextHolder] = notification.useNotification();

    const fetchShifts = async (
        searchCriteria: { name?: string; type_shift?: number },
        page = 1,
        pageSize = 10
    ) => {
        try {
            const response = await axios.get(`${API_URL}/api/shifts`, {
                params: {
                    name: searchCriteria.name,
                    type_shift: searchCriteria.type_shift,
                    page,
                    pageSize,
                },
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
                description: error.response?.data?.error || "Không thể tải danh sách ca làm.",
                placement: "topRight",
            });
        }
    };

    useEffect(() => {
        fetchShifts({});
    }, []);

    const handleSearch = (values: { name?: string; type_shift?: number }) => {
        fetchShifts(values, 1, pagination.pageSize);
        searchForm.setFieldsValue(values);
    };

    const handleTableChange = (newPagination: TablePaginationConfig) => {
        const currentSearchValues = searchForm.getFieldsValue();
        fetchShifts(currentSearchValues, newPagination.current, newPagination.pageSize);
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
            Time_in: shift.Time_in ? moment(shift.Time_in, "HH:mm") : null,
            Time_out: shift.Time_out ? moment(shift.Time_out, "HH:mm") : null,
            Start_time_of: shift.Start_time_of ? moment(shift.Start_time_of, "HH:mm") : null,
            End_time_of: shift.End_time_of ? moment(shift.End_time_of, "HH:mm") : null,
            Type_shift: shift.Type_shift,
            Start_date: shift.Start_date ? moment(shift.Start_date) : null,
            Total_time: shift.Total_time,
            Is_default: shift.Is_default === 1,
        });
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                Name: values.Name,
                Time_in: values.Time_in ? values.Time_in.format("HH:mm") : null,
                Time_out: values.Time_out ? values.Time_out.format("HH:mm") : null,
                Start_time_of: values.Start_time_of ? values.Start_time_of.format("HH:mm") : null,
                End_time_of: values.End_time_of ? values.End_time_of.format("HH:mm") : null,
                Type_shift: values.Type_shift ? values.Type_shift.toString() : null, // Chuyển thành chuỗi
                Start_date: values.Start_date ? values.Start_date.format("YYYY-MM-DD HH:mm:ss") : null,
                Total_time: values.Total_time,
                Is_default: values.Is_default ? 1 : 0,
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
                    message: "Cập nhật ca làm",
                    description: `Ca làm "${payload.Name}" đã được cập nhật thành công.`,
                    placement: "topRight",
                });
            } else {
                const response = await axios.post<Shift>(`${API_URL}/api/shifts`, payload);
                setShifts([...shifts, { ...response.data, stt: shifts.length + 1, key: response.data.ID }]);
                notificationApi.success({
                    message: "Thêm ca làm",
                    description: `Ca làm "${payload.Name}" đã được thêm thành công.`,
                    placement: "topRight",
                });
            }
            setIsModalVisible(false);
            const currentSearchValues = searchForm.getFieldsValue();
            fetchShifts(currentSearchValues, pagination.current, pagination.pageSize);
        } catch (error: any) {
            console.error("Error saving shift:", error);
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
            const deletedShift = shifts.find((shift) => shift.ID === id);
            setShifts(shifts.filter((shift) => shift.ID !== id));
            notificationApi.success({
                message: "Xóa ca làm",
                description: `Ca làm "${deletedShift?.Name}" đã được xóa thành công.`,
                placement: "topRight",
            });
            const currentSearchValues = searchForm.getFieldsValue();
            fetchShifts(currentSearchValues, pagination.current, pagination.pageSize);
        } catch (error: any) {
            console.error("Error deleting shift:", error);
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
            title: "Thời gian bắt đầu nghỉ trưa",
            dataIndex: "Start_time_of",
            key: "Start_time_of",
        },
        {
            title: "Thời gian kết thúc nghỉ trưa",
            dataIndex: "End_time_of",
            key: "End_time_of",
        },
        {
            title: "Loại ca",
            dataIndex: "Type_shift",
            key: "Type_shift",
            render: (type: number) => {
                const typeMap: { [key: number]: string } = {
                    1: "Ca sáng",
                    2: "Ca tối",
                };
                const color = type === 1 ? "blue" : "purple";
                return <Tag color={color}>{typeMap[type] || "Không xác định"}</Tag>;
            },
            filters: [
                { text: "Ca sáng", value: "1" },
                { text: "Ca tối", value: "2" },
            ],
            onFilter: (value: any, record: Shift) => String(record.Type_shift) === value,
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
            title: "Ngày bắt đầu",
            dataIndex: "Start_date",
            key: "Start_date",
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
                <Col span={18}>
                    <Form
                        form={searchForm}
                        layout="inline"
                        onFinish={handleSearch}
                    >
                        <Form.Item name="name" style={{ marginBottom: 16 }}>
                            <Input
                                placeholder="Tên ca"
                                prefix={<SearchOutlined />}
                                style={{ width: 200 }}
                            />
                        </Form.Item>
                        <Form.Item name="type_shift" style={{ marginBottom: 16 }}>
                            <Select
                                placeholder="Chọn loại ca"
                                allowClear
                                style={{ width: 200 }}
                            >
                                <Option value={1}>Ca sáng</Option>
                                <Option value={2}>Ca tối</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 16 }}>
                            <Button type="primary" htmlType="submit">
                                Tìm kiếm
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
                <Col span={6} style={{ textAlign: "right" }}>
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
                        <Col span={12}>
                            <Form.Item
                                name="Start_time_of"
                                label="Thời gian bắt đầu nghỉ trưa"
                                rules={[{ required: true, message: "Vui lòng chọn thời gian bắt đầu nghỉ trưa" }]}
                            >
                                <TimePicker format="HH:mm" style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="End_time_of"
                                label="Thời gian kết thúc nghỉ trưa"
                                rules={[{ required: true, message: "Vui lòng chọn thời gian kết thúc nghỉ trưa" }]}
                            >
                                <TimePicker format="HH:mm" style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="Start_date"
                                label="Ngày bắt đầu"
                                rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
                            >
                                <DatePicker
                                    format="YYYY-MM-DD HH:mm:ss"
                                    showTime
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="Total_time"
                                label="Tổng thời gian (giờ)"
                                rules={[{ required: true, message: "Vui lòng nhập tổng thời gian" }]}
                            >
                                <InputNumber style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="Type_shift"
                                label="Loại ca"
                                rules={[{ required: true, message: "Vui lòng chọn loại ca" }]}
                            >
                                <Select placeholder="Chọn loại ca">
                                    <Option value={1}>Ca sáng</Option>
                                    <Option value={2}>Ca tối</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="Is_default"
                                label="Mặc định"
                                valuePropName="checked"
                                rules={[{ required: false }]}
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