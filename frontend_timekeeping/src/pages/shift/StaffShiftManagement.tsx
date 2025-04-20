import {
    FormOutlined,
    PlusOutlined,
    RestOutlined,
    SearchOutlined,
    UserOutlined,
    CalendarOutlined,
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
    Collapse,
    List,
    Typography,
    Tooltip,
    Divider,
} from "antd";
import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../../layouts/MainLayout";
import { ColumnType } from "antd/es/table";
import { API_URL } from "../../config/index";

// Định nghĩa kiểu cho Staff
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

// Định nghĩa kiểu cho StaffShift
interface StaffShift {
    ID: number;
    StaffID: number;
    ShiftID: number;
    Staff?: Staff;
    Shift?: Shift;
    stt?: number;
    key?: number;
}

// Định nghĩa kiểu cho nhóm nhân viên với ca làm
interface StaffWithShifts {
    staff: Staff;
    shifts: Shift[];
    staffShifts: StaffShift[];
}

const { Content } = Layout;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Title, Text } = Typography;

const StaffShiftManagement: React.FC = () => {
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
    const [loading, setLoading] = useState<boolean>(false);
    const [notificationApi, contextHolder] = notification.useNotification();

    // Lấy danh sách phân công ca làm việc
    const fetchStaffShifts = async (staffId?: number, shiftId?: number, search?: string, page = 1, pageSize = 10) => {
        try {
            setLoading(true);
            const params: any = { page, pageSize };
            if (staffId) params.staffId = staffId;
            if (shiftId) params.shiftId = shiftId;
            if (search) params.name = search;

            const response = await axios.get(`${API_URL}/api/staffshift`, { params });
            
            // Xử lý dữ liệu trả về
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
            setStaffShifts([]); // Đặt mảng rỗng khi có lỗi
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
            
            // Xử lý dữ liệu trả về
            let staffsData = [];
            
            if (response.data && response.data.data && Array.isArray(response.data.data)) {
                staffsData = response.data.data;
            } else if (Array.isArray(response.data)) {
                staffsData = response.data;
            }
            
            console.log("Staff data:", staffsData); // Debug log
            setStaffs(staffsData);
        } catch (error: any) {
            console.error("Error fetching staffs:", error);
            notificationApi.error({
                message: "Lỗi khi lấy danh sách nhân viên",
                description: error.response?.data?.error || "Không thể tải danh sách nhân viên.",
                placement: "topRight",
            });
            setStaffs([]); // Đặt mảng rỗng khi có lỗi
        }
    };

    // Lấy danh sách ca làm việc
    const fetchShifts = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/shifts`);
            
            // Xử lý dữ liệu trả về
            let shiftsData = [];
            
            if (response.data && response.data.data && Array.isArray(response.data.data)) {
                shiftsData = response.data.data;
            } else if (Array.isArray(response.data)) {
                shiftsData = response.data;
            }
            
            console.log("Shifts data:", shiftsData); // Debug log
            setShifts(shiftsData);
        } catch (error: any) {
            console.error("Error fetching shifts:", error);
            notificationApi.error({
                message: "Lỗi khi lấy danh sách ca làm việc",
                description: error.response?.data?.error || "Không thể tải danh sách ca làm việc.",
                placement: "topRight",
            });
            setShifts([]); // Đặt mảng rỗng khi có lỗi
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

    const showAddModal = () => {
        setEditingStaffShift(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const showAddShiftModal = (staff: Staff) => {
        setSelectedStaffForShift(staff);
        shiftForm.resetFields();
        shiftForm.setFieldsValue({
            StaffID: staff.ID
        });
        setIsAddShiftModalVisible(true);
    };

    const handleAddShiftOk = async () => {
        try {
            const values = await shiftForm.validateFields();
            const payload = {
                StaffID: values.StaffID,
                ShiftID: values.ShiftID,
            };

            const response = await axios.post<StaffShift>(`${API_URL}/api/staffshift`, payload);
            
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
                description:
                    error.response?.data?.error || "Không thể thêm ca làm việc.",
                placement: "topRight",
            });
        }
    };

    const handleAddShiftCancel = () => {
        setIsAddShiftModalVisible(false);
        setSelectedStaffForShift(null);
        shiftForm.resetFields();
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
                const response = await axios.put<StaffShift>(
                    `${API_URL}/api/staffshift/${editingStaffShift.ID}`,
                    payload
                );
                
                notificationApi.success({
                    message: "Cập nhật phân công ca làm việc",
                    description: "Phân công ca làm việc đã được cập nhật thành công.",
                    placement: "topRight",
                });
            } else {
                const response = await axios.post<StaffShift>(`${API_URL}/api/staffshift`, payload);
                
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
                description:
                    error.response?.data?.error || "Không thể lưu phân công ca làm việc.",
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
                description:
                    error.response?.data?.error || "Không thể xóa phân công ca làm việc.",
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
        const { staff, shifts, staffShifts } = item;
        
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
                        onClick={() => showAddShiftModal(staff)}
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

    const columns: ColumnType<StaffShift>[] = [
        {
            title: "STT",
            dataIndex: "stt",
            key: "stt",
            width: 80,
        },
        {
            title: "Nhân viên",
            dataIndex: ["Staff", "Fullname"],
            key: "Staff",
            render: (_, record) => record.Staff?.Fullname || "N/A",
        },
        {
            title: "Mã nhân viên",
            dataIndex: ["Staff", "Code"],
            key: "StaffCode",
            render: (_, record) => record.Staff?.Code || "N/A",
        },
        {
            title: "Tên ca làm việc",
            dataIndex: ["Shift", "Name"],
            key: "Shift",
            render: (_, record) => record.Shift?.Name || "N/A",
        },
        {
            title: "Thời gian bắt đầu",
            dataIndex: ["Shift", "Time_in"],
            key: "TimeIn",
            render: (_, record) => record.Shift?.Time_in || "N/A",
        },
        {
            title: "Thời gian kết thúc",
            dataIndex: ["Shift", "Time_out"],
            key: "TimeOut",
            render: (_, record) => record.Shift?.Time_out || "N/A",
        },
        {
            title: "Loại ca",
            dataIndex: ["Shift", "Type_shift"],
            key: "TypeShift",
            render: (type, record) => {
                if (!record.Shift?.Type_shift) return "N/A";
                const Type:string|number = record.Shift.Type_shift;
                const shiftType = String(Type);
                const color = shiftType === "1" ? "blue" : "purple";
                return <Tag color={color}>{shiftType === "1" ? "Ca sáng" : "Ca tối"}</Tag>;
            },
        },
        {
            title: "Tác vụ",
            key: "action",
            width: 120,
            render: (_: any, record: StaffShift) => (
                <Space size="middle">
                    <Button icon={<RestOutlined />} onClick={() => handleDelete(record.ID)} />
                </Space>
            ),
        },
    ];

    return (
        <MainLayout title="Quản lý ca làm việc của nhân viên">
            {contextHolder}
            <Tabs defaultActiveKey="1">
                <TabPane tab="Phân công ca làm việc" key="1">
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
                    
                    {/* Modal thêm phân công ca làm việc */}
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
                        onOk={handleAddShiftOk}
                        onCancel={handleAddShiftCancel}
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
                                                    // Kiểm tra xem ca này đã được gán cho nhân viên chưa
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
                                    <Button type="primary" onClick={handleAddShiftOk}>
                                        Thêm ca
                                    </Button>
                                    <Button onClick={handleAddShiftCancel}>Hủy bỏ</Button>
                                </Space>
                            </Row>
                        </Form>
                    </Modal>
                </TabPane>
                <TabPane tab="Danh sách nhân viên theo ca" key="2">
                    <Row gutter={16} style={{ marginTop: "16px" }}>
                        <Col span={6}>
                            <Select
                                placeholder="Chọn ca làm việc"
                                style={{ width: "100%" }}
                                onChange={handleShiftChange}
                                allowClear
                                showSearch
                                optionFilterProp="children"
                            >
                                {Array.isArray(shifts) && shifts.length > 0 ? (
                                    shifts.map((shift) => (
                                        <Option key={shift.ID} value={shift.ID}>
                                            {shift.Name} ({shift.Type_shift === "1" ? "Ca sáng" : "Ca tối"})
                                        </Option>
                                    ))
                                ) : (
                                    <Option value="" disabled>Không có dữ liệu</Option>
                                )}
                            </Select>
                        </Col>
                    </Row>
                    <Content style={{ margin: "16px" }}>
                        <Table
                            dataSource={staffShifts}
                            columns={columns.filter((col) => col.key !== "action")}
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
                                emptyText: <Empty description="Không có dữ liệu" />
                            }}
                        />
                    </Content>
                </TabPane>
            </Tabs>
        </MainLayout>
    );
};

export default StaffShiftManagement;