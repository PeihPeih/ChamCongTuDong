import { BellOutlined, CloseOutlined, FilterOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, EditOutlined} from "@ant-design/icons";
import { App, Button, Col, DatePicker, Form, Input, Layout, Menu, Modal, Row, Select, Space, Table, Tag, Typography} from "antd";
import React, { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import { formatDate } from "../../utils/DateUtils";
import moment from "moment";
import { DATE_FORMAT } from "../../utils/DateUtils";
import { API_URL } from "../../config/index";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;


const employeeId = 3;
const managerId = 2;

enum Status {
    WAIT = 1,
    APPROVED = 2,
    REJECTED = 3,
}

const stt = Status;

interface Dayoff {
    ID?: string;
    Start_date: string; // Sửa thành string để hiển thị trong Table
    End_date: string;   // Sửa thành string để hiển thị trong Table
    Reason: string;
    Submission_date: Date;
    Approval_date: Date;
    Status: number;
    Employee: {
        ID: number;
        Code: string;
        Name: string;
    };
    Manager: {
        ID: number;
        Code: string;
        Name: string;
    };
    DayoffType: {
        ID: number;
        Name: string;
    };
}

interface DayoffCreateUpdate {
    ID?: number;
    Start_date: Date;
    End_date: Date;
    Reason?: string;
    Submission_date: Date;
    StaffID: number;
    ManagerID: number;
    DayOff_typeID: number;
    Status?: number;
    Approval_date?: Date | null;
}

const Dayoffs: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [dataSource, setDataSource] = useState<Dayoff[]>([]);
    const [dayoffTypes, setDayoffTypes] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [managers, setManagers] = useState<any[]>([]);
    const [start_date, setStart_date] = useState<moment.Moment | null>(null); 
    const [end_date, setEnd_date] = useState<moment.Moment | null>(null);    
    const [reason, setReason] = useState<string>("");
    const [employeeID, setEmployeeID] = useState<number | undefined>();
    const [managerID, setManagerID] = useState<number | undefined>();
    const [dayoffTypeID, setDayoffTypeID] = useState<number | undefined>();
    const [status, setStatus] = useState<number>(1);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState<Dayoff | null>(null);
    const [employee, setEmployee] = useState<{ID: number, Code: string, Fullname: string} | undefined>();
    const [manager, setManager] = useState<{ID: number, Code: string, Fullname: string} | undefined>();

    const columns = [
        {
            title: "STT",
            dataIndex: "stt",
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: "Loại đơn",
            dataIndex: ["DayoffType", "Name"],
            key: "type",
        },
        {
            title: "Người làm đơn",
            dataIndex: ["Employee", "Name"],
            key: "staff",
        },
        {
            title: "Lý do",
            dataIndex: "Reason",
            key: "reason",
        },
        {
            title: "Người duyệt",
            dataIndex: ["Manager", "Name"],
            key: "manager",
        },
        {
            title: "Ngày bắt đầu",
            dataIndex: "Start_date",
            key: "start_date",
        },
        {
            title: "Ngày kết thúc",
            dataIndex: "End_date",
            key: "end_date",
        },
        {
            title: "Trạng thái",
            dataIndex: "Status",
            key: "status",
            render: (status: any) => {
                let color = "", statusText = "";
                switch (status) {
                    case stt.WAIT:
                        color = "gold";
                        statusText = "Chờ duyệt";
                        break;
                    case stt.APPROVED:
                        color = "green";
                        statusText = "Đã duyệt";
                        break;
                    case stt.REJECTED:
                        color = "red";
                        statusText = "Từ chối";
                        break;
                    default:
                        break;
                }
                return <Tag color={color}>{statusText}</Tag>;
            },
        },
        {
            title: "Tác vụ",
            key: "action",
            render: (_: any, record: Dayoff) => (
              <Space size="middle">
                <Button 
                    icon={<EditOutlined />}
                    onClick={() => showEditModal(record)}
                />
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => deleteDayoff(record.ID || "")}
                />
              </Space>
            ),
        },
    ];

    const getDayoffs = async () => {
        try {
            let response = await fetch(`${API_URL}/api/dayoffs`);
            if (!response.ok) throw new Error("Lỗi khi lấy dữ liệu");
            let data = await response.json();
            const dayoffs = data.map((item: any) => ({
                ID: item.ID,
                Start_date: formatDate(item.Start_date),
                End_date: formatDate(item.End_date),
                Reason: item.Reason,
                Submission_date: new Date(item.Submission_date),
                Approval_date: new Date(item.Approval_date),
                Status: item.Status,
                Employee: {
                    ID: item.Employee.ID,
                    Code: item.Employee.Code,
                    Name: item.Employee.Fullname,
                },
                Manager: {
                    ID: item.Manager.ID,
                    Code: item.Manager.Code,
                    Name: item.Manager.Fullname,
                },
                DayoffType: {
                    ID: item.DayOffType.ID,
                    Name: item.DayOffType.Name,
                }
            }));
            setDataSource(dayoffs);
        } catch (error) {
            console.error(error);
        }
    }

    const getDayoffTypes = async () => {
        let response = await fetch(`${API_URL}/api/dayofftypes`);
        if (!response.ok) throw new Error("Lỗi khi lấy dữ liệu");
        let data = await response.json();
        setDayoffTypes(data);
    }

    const getEmployees = async () => {
        let response = await fetch(`${API_URL}/api/staffs/position/${employeeId}`);
        if (!response.ok) throw new Error("Lỗi khi lấy dữ liệu");
        let data = await response.json();
        setEmployees(data);
    }

    const getManagers = async () => {
        let response = await fetch(`${API_URL}/api/staffs/position/${managerId}`);
        if (!response.ok) throw new Error("Lỗi khi lấy dữ liệu");
        let data = await response.json();
        setManagers(data);
    }

    const showModal = () => {
        setIsModalVisible(true);
    };

    const createDayoff = async (newData: DayoffCreateUpdate) => {
        try {
            const response = await fetch(`${API_URL}/api/dayoffs`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(newData),
            });
            if (!response.ok) throw new Error("Lỗi khi tạo đơn từ");
            getDayoffs();
        } catch (error) {
          console.error(error);
        }
      };

      const deleteDayoff = async (id: string) => {
        if (!id) {
            alert("Không tìm thấy ID để xóa!");
            return;
        }
        try {
            const response = await fetch(`${API_URL}/api/dayoffs/${id}`, {
              method: "DELETE",
            });
            if (!response.ok) throw new Error("Lỗi khi xóa đơn từ");
            getDayoffs();
            alert("Xóa thành công!");
        } catch (error) {
          alert(error)
        }
      };

    const updateDayoff = async (updatedData: DayoffCreateUpdate) => {
        try {
            if (!editingRecord?.ID) throw new Error("Không tìm thấy ID để cập nhật");
            if (updatedData.Status === stt.APPROVED) {
                updatedData.Approval_date = moment().toDate();
            }
            const response = await fetch(`${API_URL}/api/dayoffs/${editingRecord.ID}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedData),
            });
            if (!response.ok) throw new Error("Lỗi khi cập nhật đơn từ");
            getDayoffs();
        } catch (error) {
            console.error(error);
        }
    };

    const showEditModal = (record: Dayoff) => {
        setIsEditModalVisible(true);
        setEditingRecord(record);
        setEmployeeID(record.Employee.ID);
        setManagerID(record.Manager.ID);
        setDayoffTypeID(record.DayoffType.ID);
        setReason(record.Reason);
        setStart_date(moment(record.Start_date, DATE_FORMAT));
        setEnd_date(moment(record.End_date, DATE_FORMAT));
        setStatus(record.Status);
        setEmployee({
            ID: record.Employee.ID,
            Code: record.Employee.Code,
            Fullname: record.Employee.Name,
        });
        setManager({
            ID: record.Manager.ID,
            Code: record.Manager.Code,
            Fullname: record.Manager.Name,
        });
    };

    const submitModal = async (action: string) => {
        if (start_date && end_date && employeeID && managerID && dayoffTypeID) {
            const newData = {
                Start_date: start_date.toDate(),
                End_date: end_date.toDate(),
                Reason: reason,
                Submission_date: new Date(),
                StaffID: employeeID,
                ManagerID: managerID,
                DayOff_typeID: dayoffTypeID,
                Status: status,
            };
            try {
                if (action === "create") {
                    await createDayoff(newData);
                } else if (action === "update") {
                    await updateDayoff(newData);
                }
                setIsModalVisible(false);
                setIsEditModalVisible(false);
                setEditingRecord(null);
                // Reset form
                setStart_date(null);
                setEnd_date(null);
                setReason("");
                setEmployeeID(undefined);
                setManagerID(undefined);
                setDayoffTypeID(undefined);
                setStatus(1);
            } catch (error) {
                alert("Có lỗi xảy ra khi xử lý đơn từ!");
            }
        } else {
            alert("Vui lòng nhập đầy đủ thông tin!");
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setIsEditModalVisible(false);
        setEditingRecord(null);
    };

    useEffect(() => {
        getDayoffs();
        getDayoffTypes();
        getEmployees();
        getManagers();
    }, []);

    return (
        <MainLayout title="Danh sách đơn từ">
            <Content style={{ margin: "16px" }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={showModal}
                    style={{ width: "15%", marginBottom: "16px" }}
                >
                    Thêm mới
                </Button>
                <Table
                    dataSource={dataSource}
                    columns={columns}
                    pagination={{ pageSize: 10 }}
                />
            </Content>
            <Modal
                title="Tạo mới đơn từ"
                open={isModalVisible}
                onOk={() => submitModal("create")}
                onCancel={handleCancel}
                footer={null}
            >
                <Form layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Mã nhân viên" required>
                                <Select 
                                    placeholder="Chọn mã nhân viên"
                                    value={employeeID}
                                    onChange={(value) => setEmployeeID(value)}
                                >
                                    {employees.map((employee) => (
                                        <Option key={employee.ID} value={employee.ID}>
                                            {employee.Code} - {employee.Fullname}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Mã quản lý" required>
                                <Select 
                                    placeholder="Chọn mã quản lý"
                                    value={managerID}
                                    onChange={(value) => setManagerID(value)}
                                >
                                    {managers.map((manager) => (
                                        <Option key={manager.ID} value={manager.ID}>
                                            {manager.Code} - {manager.Fullname}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Từ ngày" required>
                                <DatePicker 
                                    style={{ width: "100%" }}
                                    value={start_date}
                                    onChange={(date) => setStart_date(date)} 
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Đến ngày" required>
                                <DatePicker 
                                    style={{ width: "100%" }}
                                    value={end_date}
                                    onChange={(date) => setEnd_date(date)}
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label="Loại đơn" required>
                                <Select 
                                    placeholder="Chọn loại đơn"
                                    value={dayoffTypeID}
                                    onChange={(value) => setDayoffTypeID(value)}
                                >
                                    {dayoffTypes.map((type) => (
                                        <Option key={type.ID} value={type.ID}>
                                            {type.Name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label="Lí do xin nghỉ">
                                <Input 
                                    placeholder="Nhập lí do xin nghỉ"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)} 
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify="end">
                        <Space>
                            <Button type="primary" onClick={() => submitModal("create")}>
                                Gửi
                            </Button>
                            <Button onClick={handleCancel}>Hủy bỏ</Button>
                        </Space>
                    </Row>
                </Form>
            </Modal>

            <Modal
                title="Chỉnh sửa đơn từ"
                open={isEditModalVisible}
                onOk={() => submitModal("update")}
                onCancel={handleCancel}
                footer={null}
            >
                <Form layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Mã nhân viên" required>
                                <Select 
                                    placeholder="Chọn mã nhân viên"
                                    value={employee ? `${employee.Code} - ${employee.Fullname}` : undefined}
                                    onChange={(value, option) => {
                                        const selectedEmployee = employees.find(emp => emp.ID === value);
                                        setEmployee(selectedEmployee);
                                        setEmployeeID(parseInt(value));
                                    }}
                                >
                                    {employees.map((employee) => (
                                        <Option 
                                            key={employee.ID} 
                                            value={employee.ID}
                                        >
                                            {employee.Code} - {employee.Fullname}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Mã quản lý" required>
                                <Select 
                                    placeholder="Chọn mã quản lý"
                                    value={manager ? `${manager.Code} - ${manager.Fullname}` : undefined}
                                    onChange={(value, option) => {
                                        const selectedManager = managers.find(emp => emp.ID === value);
                                        setManager(selectedManager);
                                        setManagerID(parseInt(value));
                                    }}
                                >
                                    {managers.map((manager) => (
                                        <Option key={manager.ID} value={manager.ID}>
                                            {manager.Code} - {manager.Fullname}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Từ ngày" required>
                                <DatePicker 
                                    style={{ width: "100%" }}
                                    value={start_date}
                                    onChange={(date) => setStart_date(date)}
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Đến ngày" required>
                                <DatePicker 
                                    style={{ width: "100%" }}
                                    value={end_date}
                                    onChange={(date) => setEnd_date(date)}
                                    format="DD/MM/YYYY"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label="Loại đơn" required>
                                <Select 
                                    placeholder="Chọn loại đơn"
                                    value={dayoffTypeID}
                                    onChange={(value) => setDayoffTypeID(value)}
                                >
                                    {dayoffTypes.map((type) => (
                                        <Option key={type.ID} value={type.ID}>
                                            {type.Name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label="Lí do xin nghỉ">
                                <Input 
                                    placeholder="Nhập lí do xin nghỉ"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)} 
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label="Trạng thái" required>
                                <Select 
                                    placeholder="Chọn trạng thái"
                                    value={status}
                                    onChange={(value) => setStatus(value)}
                                >
                                    <Option value={stt.WAIT}>Chờ duyệt</Option>
                                    <Option value={stt.APPROVED}>Đã duyệt</Option>
                                    <Option value={stt.REJECTED}>Từ chối</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row justify="end">
                        <Space>
                            <Button type="primary" onClick={() => submitModal("update")}>
                                Cập nhật
                            </Button>
                            <Button onClick={handleCancel}>Hủy bỏ</Button>
                        </Space>
                    </Row>
                </Form>
            </Modal>
        </MainLayout>
    );
};

export default Dayoffs;
