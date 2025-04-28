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
    Table,
    Tag,
    notification,
    TablePaginationConfig,
    Select,
    Tabs,
    Empty,
} from "antd";
import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../../layouts/MainLayout";
import { ColumnType } from "antd/es/table";
import { API_URL } from "../../config/index";

// Định nghĩa kiểu dữ liệu
interface Staff {
    ID: number;
    Fullname: string;
    Code: string;
    Email: string;
    Username: string;
    Gender: string;
    DayOfBirth: string;
    RoleID: number;
    Role?: { ID: number; Name: string };
    stt?: number;
    key?: number;
}

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

interface StaffShift {
    ID: number;
    StaffID: number;
    ShiftID: number;
    Staff?: Staff;
    Shift?: Shift;
    stt?: number;
    key?: number;
}

const { Content } = Layout;
const { Option } = Select;
const { TabPane } = Tabs;

const StaffShiftManagement: React.FC = () => {
    const [staffShifts, setStaffShifts] = useState<StaffShift[]>([]);
    const [staffs, setStaffs] = useState<Staff[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [form] = Form.useForm();
    const [searchForm] = Form.useForm();
    const [editingStaffShift, setEditingStaffShift] = useState<StaffShift | null>(null);
    const [pagination, setPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [shiftPagination, setShiftPagination] = useState<TablePaginationConfig>({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [notificationApi, contextHolder] = notification.useNotification();

    // Lấy danh sách ca làm việc
    const fetchShifts = async (search?: string, page = 1, pageSize = 10) => {
        try {
            setLoading(true);
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
            setShiftPagination({
                current: paginationData.page,
                pageSize: paginationData.pageSize,
                total: paginationData.total,
            });
        } catch (error: any) {
            console.error("Lỗi khi lấy danh sách ca làm việc:", error);
            notificationApi.error({
                message: "Lỗi khi lấy danh sách ca làm việc",
                description: error.response?.data?.error || "Không thể tải danh sách ca làm việc.",
                placement: "topRight",
            });
            setShifts([]);
        } finally {
            setLoading(false);
        }
    };

    // Lấy danh sách phân công ca làm việc
    const fetchStaffShifts = async (
        searchCriteria: { name?: string; staffId?: number; shiftId?: number },
        page = 1,
        pageSize = 10
    ) => {
        try {
            setLoading(true);
            const params: any = { page, pageSize };
            if (searchCriteria.staffId) params.staffId = searchCriteria.staffId;
            if (searchCriteria.shiftId) params.shiftId = searchCriteria.shiftId;
            if (searchCriteria.name) params.name = searchCriteria.name;

            const response = await axios.get(`${API_URL}/api/staffshift`, { params });
            let staffShiftsData = [];
            let paginationData = { page, pageSize, total: 0, totalPages: 0 };

            if (response.data && response.data.data) {
                staffShiftsData = response.data.data;
                if (response.data.pagination) {
                    paginationData = response.data.pagination;
                }
            } else if (Array.isArray(response.data)) {
                staffShiftsData = response.data;
            }

            // Ghi log để kiểm tra giá trị Type_shift
            console.log("Dữ liệu phân công ca làm việc:", staffShiftsData);
            staffShiftsData.forEach((shift: StaffShift, index: number) => {
                console.log(`Bản ghi ${index + 1} - Type_shift:`, shift.Shift?.Type_shift);
            });

            const mappedData = staffShiftsData.map((staffShift: StaffShift, index: number) => ({
                ...staffShift,
                stt: (page - 1) * pageSize + index + 1,
                key: staffShift.ID,
            }));

            setStaffShifts(mappedData);
            setPagination({
                current: paginationData.page,
                pageSize: paginationData.pageSize,
                total: paginationData.total,
            });
        } catch (error: any) {
            console.error("Lỗi khi lấy danh sách phân công ca làm việc:", error);
            notificationApi.error({
                message: "Lỗi khi lấy danh sách",
                description: error.response?.data?.error || "Không thể tải danh sách phân công ca làm việc.",
                placement: "topRight",
            });
            setStaffShifts([]);
        } finally {
            setLoading(false);
        }
    };

    // Lấy danh sách nhân viên
    const fetchStaffs = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/staffs`);
            let staffsData = [];
            if (response.data && response.data.data && Array.isArray(response.data.data)) {
                staffsData = response.data.data;
            } else if (Array.isArray(response.data)) {
                staffsData = response.data;
            }
            setStaffs(staffsData);
        } catch (error: any) {
            console.error("Lỗi khi lấy danh sách nhân viên:", error);
            notificationApi.error({
                message: "Lỗi khi lấy danh sách nhân viên",
                description: error.response?.data?.error || "Không thể tải danh sách nhân viên.",
                placement: "topRight",
            });
            setStaffs([]);
        }
    };

    useEffect(() => {
        fetchStaffs();
        fetchShifts();
        fetchStaffShifts({});
    }, []);

    const handleSearch = (values: { name?: string; staffId?: number; shiftId?: number }) => {
        fetchStaffShifts(values, 1, pagination.pageSize);
        searchForm.setFieldsValue(values);
    };

    const handleShiftSearch = (value: string) => {
        fetchShifts(value, shiftPagination.current, shiftPagination.pageSize);
    };

    const handleTableChange = (newPagination: TablePaginationConfig) => {
        const currentSearchValues = searchForm.getFieldsValue();
        fetchStaffShifts(currentSearchValues, newPagination.current, newPagination.pageSize);
    };

    const handleShiftTableChange = (newPagination: TablePaginationConfig) => {
        fetchShifts(searchForm.getFieldValue("name") || "", newPagination.current, newPagination.pageSize);
    };

    const showAddModal = () => {
        setEditingStaffShift(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const showEditModal = (staffShift: StaffShift) => {
        setEditingStaffShift(staffShift);
        form.setFieldsValue({
            StaffID: staffShift.StaffID,
            ShiftID: staffShift.ShiftID,
        });
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                StaffID: values.StaffID,
                ShiftID: values.ShiftID,
            };

            if (editingStaffShift) {
                await axios.put<StaffShift>(
                    `${API_URL}/api/staffshift/${editingStaffShift.ID}`,
                    payload
                );
                notificationApi.success({
                    message: "Cập nhật phân công ca làm việc",
                    description: "Phân công ca làm việc đã được cập nhật thành công.",
                    placement: "topRight",
                });
            } else {
                await axios.post<StaffShift>(`${API_URL}/api/staffshift`, payload);
                notificationApi.success({
                    message: "Thêm phân công ca làm việc",
                    description: "Phân công ca làm việc đã được thêm thành công.",
                    placement: "topRight",
                });
            }
            setIsModalVisible(false);
            const currentSearchValues = searchForm.getFieldsValue();
            fetchStaffShifts(currentSearchValues, pagination.current, pagination.pageSize);
        } catch (error: any) {
            console.error("Lỗi khi lưu phân công ca làm việc:", error);
            notificationApi.error({
                message: "Lỗi khi lưu phân công ca làm việc",
                description: error.response?.data?.error || "Không thể lưu phân công ca làm việc.",
                placement: "topRight",
            });
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`${API_URL}/api/staffshift/${id}`);
            notificationApi.success({
                message: "Xóa phân công ca làm việc",
                description: "Phân công ca làm việc đã được xóa thành công.",
                placement: "topRight",
            });
            const currentSearchValues = searchForm.getFieldsValue();
            fetchStaffShifts(currentSearchValues, pagination.current, pagination.pageSize);
        } catch (error: any) {
            console.error("Lỗi khi xóa phân công ca làm việc:", error);
            notificationApi.error({
                message: "Lỗi khi xóa phân công ca làm việc",
                description: error.response?.data?.error || "Không thể xóa phân công ca làm việc.",
                placement: "topRight",
            });
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingStaffShift(null);
        form.resetFields();
    };

    // Cột cho bảng phân công ca làm việc
    const staffShiftColumns: ColumnType<StaffShift>[] = [
        {
            title: "STT",
            dataIndex: "stt",
            key: "stt",
        },
        {
            title: "Tên nhân viên",
            key: "Fullname",
            render: (_: any, record: StaffShift) => record.Staff?.Fullname || "Không có dữ liệu",
        },
        {
            title: "Mã nhân viên",
            key: "Code",
            render: (_: any, record: StaffShift) => record.Staff?.Code || "Không có dữ liệu",
        },
        {
            title: "Tên ca",
            key: "ShiftName",
            render: (_: any, record: StaffShift) => record.Shift?.Name || "Không có dữ liệu",
        },
        {
            title: "Giờ vào",
            key: "Time_in",
            render: (_: any, record: StaffShift) => record.Shift?.Time_in || "Không có dữ liệu",
        },
        {
            title: "Giờ ra",
            key: "Time_out",
            render: (_: any, record: StaffShift) => record.Shift?.Time_out || "Không có dữ liệu",
        },
        {
            title: "Loại ca",
            key: "Type_shift",
            render: (_: any, record: StaffShift) => {
                const type = record.Shift?.Type_shift;
                const typeMap: { [key: string]: string } = {
                    "1": "Ca sáng",
                    "2": "Ca tối",
                };
                const color = type === "1" ? "blue" : type === "2" ? "purple" : "gray";
                const label = type && typeMap[type] ? typeMap[type] : "Không xác định";
                return <Tag color={color}>{label}</Tag>;
            },
            filters: [
                { text: "Ca sáng", value: "1" },
                { text: "Ca tối", value: "2" },
            ],
            onFilter: (value: any, record: StaffShift) => {
                const type = record.Shift?.Type_shift;
                // Xử lý trường hợp type là số hoặc chuỗi
                const normalizedType = type ? String(type) : "";
                const normalizedValue = String(value);
                console.log(`Lọc - Giá trị lọc: ${normalizedValue}, Type_shift: ${normalizedType}`);
                return normalizedType === normalizedValue;
            },
        },
        {
            title: "Tác vụ",
            key: "action",
            render: (_: any, record: StaffShift) => (
                <Space size="middle">
                    <Button icon={<FormOutlined />} onClick={() => showEditModal(record)} />
                    <Button icon={<RestOutlined />} onClick={() => handleDelete(record.ID)} />
                </Space>
            ),
        },
    ];

    // Cột cho bảng ca làm việc
    const shiftColumns: ColumnType<Shift>[] = [
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
            render: (type: string) => {
                const typeMap: { [key: string]: string } = {
                    "1": "Ca ngày",
                    "2": "Ca đêm",
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
        },
        {
            title: "Tổng thời gian",
            dataIndex: "Total_time",
            key: "Total_time",
        },
    ];

    return (
        <MainLayout title="Quản lý ca làm việc của nhân viên">
            {contextHolder}
            <Tabs defaultActiveKey="1">
                <TabPane tab="Danh sách ca làm việc" key="1">
                    <Row gutter={16} style={{ marginTop: "16px" }}>
                        <Col span={18}>
                            <Form
                                form={searchForm}
                                layout="inline"
                                onFinish={(values) => handleShiftSearch(values.name || "")}
                            >
                                <Form.Item name="name" style={{ marginBottom: 16 }}>
                                    <Input
                                        placeholder="Tìm kiếm theo tên ca"
                                        prefix={<SearchOutlined />}
                                        style={{ width: 200 }}
                                    />
                                </Form.Item>
                                <Form.Item style={{ marginBottom: 16 }}>
                                    <Button type="primary" htmlType="submit">
                                        Tìm kiếm
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Col>
                    </Row>
                    <Content style={{ margin: "16px" }}>
                        <Table
                            dataSource={shifts}
                            columns={shiftColumns}
                            pagination={{
                                current: shiftPagination.current,
                                pageSize: shiftPagination.pageSize,
                                total: shiftPagination.total,
                                pageSizeOptions: ["5", "10", "20", "50"],
                                showSizeChanger: true,
                                onChange: (page, pageSize) =>
                                    handleShiftTableChange({ current: page, pageSize }),
                                locale: {
                                    items_per_page: "/ trang",
                                },
                            }}
                            loading={loading}
                            locale={{
                                emptyText: <Empty description="Không có dữ liệu ca làm việc" />
                            }}
                        />
                    </Content>
                </TabPane>
                <TabPane tab="Phân công ca làm việc" key="2">
                    <Row gutter={16} style={{ marginTop: "16px" }}>
                        <Col span={18}>
                            <Form
                                form={searchForm}
                                layout="inline"
                                onFinish={handleSearch}
                            >
                                <Form.Item name="name" style={{ marginBottom: 16 }}>
                                    <Input
                                        placeholder="Tìm kiếm"
                                        prefix={<SearchOutlined />}
                                        style={{ width: 200 }}
                                    />
                                </Form.Item>
                                <Form.Item name="staffId" style={{ marginBottom: 16 }}>
                                    <Select
                                        placeholder="Chọn nhân viên"
                                        allowClear
                                        style={{ width: 200 }}
                                        showSearch
                                        optionFilterProp="children"
                                    >
                                        {Array.isArray(staffs) && staffs.length > 0 ? (
                                            staffs.map((staff) => (
                                                <Option key={staff.ID} value={staff.ID}>
                                                    {staff.Fullname}
                                                </Option>
                                            ))
                                        ) : (
                                            <Option value="" disabled>Không có dữ liệu</Option>
                                        )}
                                    </Select>
                                </Form.Item>
                                <Form.Item name="shiftId" style={{ marginBottom: 16 }}>
                                    <Select
                                        placeholder="Chọn ca làm việc"
                                        allowClear
                                        style={{ width: 200 }}
                                        showSearch
                                        optionFilterProp="children"
                                    >
                                        {Array.isArray(shifts) && shifts.length > 0 ? (
                                            shifts.map((shift) => (
                                                <Option key={shift.ID} value={shift.ID}>
                                                    {shift.Name}
                                                </Option>
                                            ))
                                        ) : (
                                            <Option value="" disabled>Không có dữ liệu</Option>
                                        )}
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
                                Phân công ca
                            </Button>
                        </Col>
                    </Row>
                    <Content style={{ margin: "16px" }}>
                        <Table
                            dataSource={staffShifts}
                            columns={staffShiftColumns}
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
                            loading={loading}
                            locale={{
                                emptyText: <Empty description="Không có dữ liệu phân công ca làm việc" />
                            }}
                        />
                    </Content>

                    {/* Modal thêm/sửa phân công ca làm việc */}
                    <Modal
                        title={editingStaffShift ? "Sửa phân công ca làm việc" : "Thêm phân công ca làm việc"}
                        visible={isModalVisible}
                        onOk={handleOk}
                        onCancel={handleCancel}
                        footer={null}
                    >
                        <Form form={form} layout="vertical">
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item
                                        name="StaffID"
                                        label="Nhân viên"
                                        rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
                                    >
                                        <Select
                                            placeholder="Chọn nhân viên"
                                            showSearch
                                            optionFilterProp="children"
                                        >
                                            {Array.isArray(staffs) && staffs.length > 0 ? (
                                                staffs.map((staff) => (
                                                    <Option key={staff.ID} value={staff.ID}>
                                                        {staff.Fullname} - {staff.Code}
                                                    </Option>
                                                ))
                                            ) : (
                                                <Option value="" disabled>Không có dữ liệu</Option>
                                            )}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item
                                        name="ShiftID"
                                        label="Ca làm việc"
                                        rules={[{ required: true, message: "Vui lòng chọn ca làm việc" }]}
                                    >
                                        <Select
                                            placeholder="Chọn ca làm việc"
                                            showSearch
                                            optionFilterProp="children"
                                        >
                                            {Array.isArray(shifts) && shifts.length > 0 ? (
                                                shifts.map((shift) => (
                                                    <Option key={shift.ID} value={shift.ID}>
                                                        {shift.Name} ({shift.Time_in} - {shift.Time_out})
                                                        {shift.Type_shift === "1" ? " - Ca sáng" : " - Ca tối"}
                                                    </Option>
                                                ))
                                            ) : (
                                                <Option value="" disabled>Không có dữ liệu</Option>
                                            )}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row justify="end">
                                <Space>
                                    <Button type="primary" onClick={handleOk}>
                                        {editingStaffShift ? "Cập nhật" : "Thêm mới"}
                                    </Button>
                                    <Button onClick={handleCancel}>Hủy bỏ</Button>
                                </Space>
                            </Row>
                        </Form>
                    </Modal>
                </TabPane>
            </Tabs>
        </MainLayout>
    );
};

export default StaffShiftManagement;