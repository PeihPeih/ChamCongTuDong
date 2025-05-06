import {
    FormOutlined,
    PlusOutlined,
    RestOutlined,
    SearchOutlined,
    UserOutlined,
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
    Card,
    List,
    Typography,
    Switch,
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

interface StaffWithShifts {
    staff: Staff;
    shifts: Shift[];
    staffShifts: StaffShift[];
}

const { Content } = Layout;
const { Option } = Select;
const { TabPane } = Tabs;
const { Text } = Typography;

const Shift: React.FC = () => {
    const [staffShifts, setStaffShifts] = useState<StaffShift[]>([]);
    const [staffs, setStaffs] = useState<Staff[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [groupedData, setGroupedData] = useState<StaffWithShifts[]>([]);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isAddShiftModalVisible, setIsAddShiftModalVisible] = useState<boolean>(false);
    const [form] = Form.useForm();
    const [shiftForm] = Form.useForm();
    const [editingStaffShift, setEditingStaffShift] = useState<StaffShift | null>(null);
    const [selectedStaffForShift, setSelectedStaffForShift] = useState<Staff | null>(null);
    const [searchValue, setSearchValue] = useState<string>("");
    const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
    const [selectedShift, setSelectedShift] = useState<number | null>(null);
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
    const [editingShift, setEditingShift] = useState<Shift | null>(null);
    const [isShiftModalVisible, setIsShiftModalVisible] = useState<boolean>(false);

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
            console.error("Error fetching shifts:", error);
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
    const fetchStaffShifts = async (staffId?: number, shiftId?: number, search?: string, page = 1, pageSize = 10) => {
        try {
            setLoading(true);
            const params: any = { page, pageSize };
            if (staffId) params.staffId = staffId;
            if (shiftId) params.shiftId = shiftId;
            if (search) params.name = search;

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

            // Nhóm dữ liệu theo nhân viên
            groupDataByStaff(mappedData);
        } catch (error: any) {
            console.error("Error fetching staff shifts:", error);
            notificationApi.error({
                message: "Lỗi khi lấy danh sách",
                description: error.response?.data?.error || "Không thể tải danh sách phân công ca làm việc.",
                placement: "topRight",
            });
            setStaffShifts([]);
            setGroupedData([]);
        } finally {
            setLoading(false);
        }
    };

    // Nhóm dữ liệu theo nhân viên
    const groupDataByStaff = (data: StaffShift[]) => {
        const staffMap = new Map<number, StaffWithShifts>();
        data.forEach(staffShift => {
            if (staffShift.Staff && staffShift.Shift) {
                const staffId = staffShift.Staff.ID;
                if (!staffMap.has(staffId)) {
                    staffMap.set(staffId, {
                        staff: staffShift.Staff,
                        shifts: [],
                        staffShifts: []
                    });
                }
                const staffGroup = staffMap.get(staffId);
                if (staffGroup) {
                    staffGroup.shifts.push(staffShift.Shift);
                    staffGroup.staffShifts.push(staffShift);
                }
            }
        });
        setGroupedData(Array.from(staffMap.values()));
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
            console.error("Error fetching staffs:", error);
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
        fetchStaffShifts();
    }, []);

    const handleSearch = (value: string) => {
        setSearchValue(value);
        fetchStaffShifts(selectedStaff || undefined, selectedShift || undefined, value, 1, pagination.pageSize);
    };

    const handleShiftSearch = (value: string) => {
        setSearchValue(value);
        fetchShifts(value, shiftPagination.current, shiftPagination.pageSize);
    };

    const handleStaffChange = (value: number | null) => {
        setSelectedStaff(value);
        fetchStaffShifts(value || undefined, selectedShift || undefined, searchValue, 1, pagination.pageSize);
    };

    const handleShiftChange = (value: number | null) => {
        setSelectedShift(value);
        fetchStaffShifts(selectedStaff || undefined, value || undefined, searchValue, 1, pagination.pageSize);
    };

    const handleTableChange = (newPagination: TablePaginationConfig) => {
        fetchStaffShifts(
            selectedStaff || undefined,
            selectedShift || undefined,
            searchValue,
            newPagination.current,
            newPagination.pageSize
        );
    };

    const handleShiftTableChange = (newPagination: TablePaginationConfig) => {
        fetchShifts(searchValue, newPagination.current, newPagination.pageSize);
    };

    const showAddModal = () => {
        setEditingStaffShift(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const showAddShiftModal = () => {
        setEditingShift(null);
        shiftForm.resetFields();
        setIsShiftModalVisible(true);
    };

    const showAddStaffShiftModal = (staff: Staff) => {
        setSelectedStaffForShift(staff);
        shiftForm.resetFields();
        shiftForm.setFieldsValue({
            StaffID: staff.ID
        });
        setIsAddShiftModalVisible(true);
    };

    const showEditShiftModal = (shift: Shift) => {
        setEditingShift(shift);
        shiftForm.setFieldsValue({
            Name: shift.Name,
            Time_in: shift.Time_in,
            Time_out: shift.Time_out,
            Is_default: shift.Is_default === 1,
            Type_shift: shift.Type_shift,
            Start_date: shift.Start_date
                ? new Date(shift.Start_date).toISOString().split("T")[0]
                : undefined,
            Total_time: shift.Total_time,
        });
        setIsShiftModalVisible(true);
    };

    const handleShiftOk = async () => {
        try {
            const values = await shiftForm.validateFields();
            const payload = {
                Name: values.Name,
                Time_in: values.Time_in,
                Time_out: values.Time_out,
                Is_default: values.Is_default ? 1 : 0,
                Type_shift: values.Type_shift,
                Start_date: values.Start_date ? new Date(values.Start_date).toISOString() : undefined,
                Total_time: values.Total_time,
            };

            if (editingShift) {
                await axios.put<Shift>(`${API_URL}/api/shifts/${editingShift.ID}`, payload);
                notificationApi.success({
                    message: "Cập nhật ca làm việc",
                    description: "Ca làm việc đã được cập nhật thành công.",
                    placement: "topRight",
                });
            } else {
                await axios.post<Shift>(`${API_URL}/api/shifts`, payload);
                notificationApi.success({
                    message: "Thêm ca làm việc",
                    description: "Ca làm việc đã được thêm thành công.",
                    placement: "topRight",
                });
            }
            setIsShiftModalVisible(false);
            fetchShifts(searchValue, shiftPagination.current, shiftPagination.pageSize);
        } catch (error: any) {
            console.error("Error saving shift:", error);
            notificationApi.error({
                message: "Lỗi khi lưu ca làm việc",
                description: error.response?.data?.error || "Không thể lưu ca làm việc.",
                placement: "topRight",
            });
        }
    };

    const handleShiftCancel = () => {
        setIsShiftModalVisible(false);
        setEditingShift(null);
        shiftForm.resetFields();
    };

    const handleAddStaffShiftCancel = () => {
        setIsAddShiftModalVisible(false);
        setSelectedStaffForShift(null);
        shiftForm.resetFields();
    };

    const handleDeleteShift = async (id: number) => {
        try {
            await axios.delete(`${API_URL}/api/shifts/${id}`);
            const deletedShift = shifts.find((shift) => shift.ID === id);
            setShifts(shifts.filter((shift) => shift.ID !== id));
            notificationApi.success({
                message: "Xóa ca làm việc",
                description: `Ca làm việc "${deletedShift?.Name}" đã được xóa thành công.`,
                placement: "topRight",
            });
            fetchShifts(searchValue, shiftPagination.current, shiftPagination.pageSize);
        } catch (error: any) {
            console.error("Error deleting shift:", error);
            notificationApi.error({
                message: "Lỗi khi xóa ca làm việc",
                description: error.response?.data?.error || "Không thể xóa ca làm việc.",
                placement: "topRight",
            });
        }
    };

    const handleAddStaffShiftOk = async () => {
        try {
            const values = await shiftForm.validateFields();
            const payload = {
                StaffID: values.StaffID,
                ShiftID: values.ShiftID,
            };

            await axios.post<StaffShift>(`${API_URL}/api/staffshift`, payload);
            notificationApi.success({
                message: "Thêm ca làm việc",
                description: "Ca làm việc đã được thêm thành công.",
                placement: "topRight",
            });
            setIsAddShiftModalVisible(false);
            fetchStaffShifts(
                selectedStaff || undefined,
                selectedShift || undefined,
                searchValue,
                pagination.current,
                pagination.pageSize
            );
        } catch (error: any) {
            console.error("Error adding shift:", error);
            notificationApi.error({
                message: "Lỗi khi thêm ca làm việc",
                description: error.response?.data?.error || "Không thể thêm ca làm việc.",
                placement: "topRight",
            });
        }
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
            fetchStaffShifts(
                selectedStaff || undefined,
                selectedShift || undefined,
                searchValue,
                pagination.current,
                pagination.pageSize
            );
        } catch (error: any) {
            console.error("Error saving staff shift:", error);
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
            fetchStaffShifts(
                selectedStaff || undefined,
                selectedShift || undefined,
                searchValue,
                pagination.current,
                pagination.pageSize
            );
        } catch (error: any) {
            console.error("Error deleting staff shift:", error);
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

    // Render ca làm việc với nút quản lý
    const renderShiftItem = (staffShift: StaffShift, shift: Shift) => {
        const shiftType = String(shift.Type_shift);
        const color = shiftType === "1" ? "blue" : "purple";
        return (
            <List.Item
                key={staffShift.ID}
                actions={[
                    <Button
                        type="text"
                        danger
                        icon={<RestOutlined />}
                        onClick={() => handleDelete(staffShift.ID)}
                    />
                ]}
            >
                <Space>
                    <Tag color={color}>
                        {shiftType === "1" ? "Ca sáng" : "Ca tối"}
                    </Tag>
                    <Text>{shift.Name}</Text>
                    <Text type="secondary">{shift.Time_in} - {shift.Time_out}</Text>
                </Space>
            </List.Item>
        );
    };

    // Render từng khối nhân viên với danh sách ca
    const renderStaffCard = (item: StaffWithShifts) => {
        const { staff, staffShifts } = item;
        return (
            <Card
                key={staff.ID}
                title={
                    <Space>
                        <UserOutlined />
                        <span>{staff.Fullname}</span>
                        <Tag color="default">{staff.Code}</Tag>
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => showAddStaffShiftModal(staff)}
                    >
                        Thêm ca
                    </Button>
                }
                style={{ marginBottom: 16 }}
            >
                <List
                    itemLayout="horizontal"
                    dataSource={staffShifts}
                    renderItem={(staffShift, index) =>
                        staffShift.Shift ? renderShiftItem(staffShift, staffShift.Shift) : null
                    }
                    locale={{ emptyText: "Chưa có ca làm việc nào" }}
                />
            </Card>
        );
    };

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
            render: (type: string | number) => {
                const typeStr = String(type);
                const color = typeStr === "1" ? "blue" : "purple";
                return <Tag color={color}>{typeStr === "1" ? "Ca sáng" : "Ca tối"}</Tag>;
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
        },
        {
            title: "Tổng thời gian",
            dataIndex: "Total_time",
            key: "Total_time",
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_, record: Shift) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<FormOutlined />}
                        onClick={() => showEditShiftModal(record)}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<RestOutlined />}
                        onClick={() => handleDeleteShift(record.ID)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <MainLayout title="Quản lý ca làm việc của nhân viên">
            {contextHolder}
            <Tabs defaultActiveKey="1" style={{ margin: "16px"}}>
                <TabPane tab="Danh sách ca làm việc" key="1">
                    <Row gutter={16} style={{ marginTop: "16px" }}>
                        <Col span={12}>
                            <Input
                                placeholder="Tìm kiếm theo tên ca"
                                value={searchValue}
                                onChange={(e) => handleShiftSearch(e.target.value)}
                                prefix={<SearchOutlined />}
                                style={{ width: "100%" }}
                            />
                        </Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                            <Button type="primary" icon={<PlusOutlined />} onClick={showAddShiftModal}>
                                Thêm ca làm việc
                            </Button>
                        </Col>
                    </Row>
                    <Content style={{ marginTop: "16px" }}>
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

                    {/* Modal thêm/sửa ca làm việc */}
                    <Modal
                        title={editingShift ? "Cập nhật ca làm việc" : "Thêm ca làm việc mới"}
                        visible={isShiftModalVisible}
                        onOk={handleShiftOk}
                        onCancel={handleShiftCancel}
                        footer={null}
                    >
                        <Form form={shiftForm} layout="vertical">
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item
                                        name="Name"
                                        label="Tên ca làm việc"
                                        rules={[{ required: true, message: "Vui lòng nhập tên ca làm việc" }]}
                                    >
                                        <Input placeholder="Nhập tên ca làm việc" />
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
                                <Col span={12}>
                                    <Form.Item
                                        name="Is_default"
                                        label="Ca mặc định"
                                        valuePropName="checked"
                                    >
                                        <Switch />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item
                                        name="Start_date"
                                        label="Ngày bắt đầu"
                                        rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
                                    >
                                        <Input type="date" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item
                                        name="Total_time"
                                        label="Tổng thời gian"
                                        rules={[{ required: true, message: "Vui lòng nhập tổng thời gian" }]}
                                    >
                                        <Input placeholder="Nhập tổng thời gian (giờ)" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row justify="end">
                                <Space>
                                    <Button type="primary" onClick={handleShiftOk}>
                                        {editingShift ? "Cập nhật" : "Thêm mới"}
                                    </Button>
                                    <Button onClick={handleShiftCancel}>Hủy bỏ</Button>
                                </Space>
                            </Row>
                        </Form>
                    </Modal>
                </TabPane>
                <TabPane tab="Phân công ca làm việc" key="2">
                    <Row gutter={16} style={{ marginTop: "16px" }}>
                        <Col span={6}>
                            <Select
                                placeholder="Chọn nhân viên"
                                style={{ width: "100%" }}
                                onChange={handleStaffChange}
                                allowClear
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
                        </Col>
                        <Col span={12}>
                            <Input
                                placeholder="Tìm kiếm"
                                value={searchValue}
                                onChange={(e) => handleSearch(e.target.value)}
                                prefix={<SearchOutlined />}
                                style={{ width: "100%" }}
                            />
                        </Col>
                        <Col span={6}>
                            <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
                                Phân công ca
                            </Button>
                        </Col>
                    </Row>
                    <Content style={{ margin: "16px" }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '30px' }}>Đang tải dữ liệu...</div>
                        ) : (
                            <>
                                {groupedData.length > 0 ? (
                                    groupedData.map(item => renderStaffCard(item))
                                ) : (
                                    <Empty description="Không có dữ liệu phân công ca làm việc" />
                                )}
                            </>
                        )}
                    </Content>

                    {/* Modal thêm/sửa phân công ca làm việc */}
                    <Modal
                        title="Phân công ca làm việc"
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

                    {/* Modal thêm ca làm việc cho nhân viên */}
                    <Modal
                        title={`Thêm ca làm việc cho ${selectedStaffForShift?.Fullname || ''}`}
                        visible={isAddShiftModalVisible}
                        onOk={handleAddStaffShiftOk}
                        onCancel={handleAddStaffShiftCancel}
                        footer={null}
                    >
                        <Form form={shiftForm} layout="vertical">
                            <Form.Item
                                name="StaffID"
                                hidden
                            >
                                <Input />
                            </Form.Item>
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
                                                shifts.map((shift) => {
                                                    const isAssigned = staffShifts.some(
                                                        ss => ss.StaffID === selectedStaffForShift?.ID && ss.ShiftID === shift.ID
                                                    );
                                                    return (
                                                        <Option
                                                            key={shift.ID}
                                                            value={shift.ID}
                                                            disabled={isAssigned}
                                                        >
                                                            {shift.Name} ({shift.Time_in} - {shift.Time_out})
                                                            {shift.Type_shift === "1" ? " - Ca sáng" : " - Ca tối"}
                                                            {isAssigned ? " (Đã phân công)" : ""}
                                                        </Option>
                                                    );
                                                })
                                            ) : (
                                                <Option value="" disabled>Không có dữ liệu</Option>
                                            )}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row justify="end">
                                <Space>
                                    <Button type="primary" onClick={handleAddStaffShiftOk}>
                                        Thêm ca
                                    </Button>
                                    <Button onClick={handleAddStaffShiftCancel}>Hủy bỏ</Button>
                                </Space>
                            </Row>
                        </Form>
                    </Modal>
                </TabPane>
            </Tabs>
        </MainLayout>
    );
};

export default Shift;