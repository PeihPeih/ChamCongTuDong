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
  Select,
  Table,
  notification,
  TablePaginationConfig,
} from "antd";
import React, { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../../layouts/MainLayout";
import { ColumnType } from "antd/es/table";

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

// Định nghĩa kiểu cho Role
interface Role {
  ID: number;
  Name: string;
  Is_default: number;
}

const { Content } = Layout;
const { Option } = Select;

const AccountManagement: React.FC = () => {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [roles, setRoles] = useState<Role[]>([]); // Danh sách roles cho dropdown
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [notificationApi, contextHolder] = notification.useNotification();

  const REACT_APP_SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:3000";

  // Lấy danh sách nhân viên
  const fetchStaffs = async (search?: string, page = 1, pageSize = 10) => {
    try {
      console.log("Fetching staffs from:", `${REACT_APP_SERVER_URL}/api/staffs`);
      const response = await axios.get(`${REACT_APP_SERVER_URL}/api/staffs`, {
        params: { name: search, page, pageSize },
      });
      const { data, pagination: paginationData } = response.data;
      setStaffs(
        data.map((staff: Staff, index: number) => ({
          ...staff,
          stt: (page - 1) * pageSize + index + 1,
          key: staff.ID,
        }))
      );
      setPagination({
        current: paginationData.page,
        pageSize: paginationData.pageSize,
        total: paginationData.total,
      });
    } catch (error: any) {
      console.error("Error fetching staffs:", error);
      notificationApi.error({
        message: "Lỗi khi lấy danh sách",
        description: error.response?.data?.error || "Không thể tải danh sách nhân viên.",
        placement: "topRight",
      });
    }
  };

  // Lấy danh sách roles cho dropdown
  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${REACT_APP_SERVER_URL}/api/roles/dropdown`);
      setRoles(response.data);
    } catch (error: any) {
      console.error("Error fetching roles:", error);
      notificationApi.error({
        message: "Lỗi khi lấy danh sách vai trò",
        description: error.response?.data?.error || "Không thể tải danh sách vai trò.",
        placement: "topRight",
      });
    }
  };

  useEffect(() => {
    fetchStaffs();
    fetchRoles(); // Lấy danh sách roles khi component mount
  }, []);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    fetchStaffs(value, pagination.current, pagination.pageSize);
  };

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    fetchStaffs(searchValue, newPagination.current, newPagination.pageSize);
  };

  const showAddModal = () => {
    setEditingStaff(null);
    form.resetFields();
    // Đặt giá trị mặc định cho RoleID là role có Is_default = true
    const defaultRole = roles.find((role) => role.Is_default === 1);
    if (defaultRole) {
      form.setFieldsValue({ RoleID: defaultRole.ID });
    }
    setIsModalVisible(true);
  };

  const showEditModal = (staff: Staff) => {
    setEditingStaff(staff);

    // Định dạng DayOfBirth thành chuỗi YYYY-MM-DD
    const formattedDayOfBirth = staff.DayOfBirth
      ? new Date(staff.DayOfBirth).toISOString().split("T")[0]
      : undefined;

    form.setFieldsValue({
      Fullname: staff.Fullname,
      Code: staff.Code,
      Email: staff.Email,
      Gender: staff.Gender,
      DayOfBirth: formattedDayOfBirth, // Set giá trị đã định dạng
      Username: staff.Username,
      RoleID: staff.RoleID,
    });
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        Fullname: values.Fullname,
        Code: values.Code,
        Email: values.Email,
        Username: values.Username,
        Password: values.Password,
        Gender: values.Gender,
        DayOfBirth: values.DayOfBirth,
        ConfirmPassword: values.ConfirmPassword,
        RoleID: values.RoleID,
      };

      if (editingStaff) {
        const response = await axios.put<Staff>(
          `${REACT_APP_SERVER_URL}/api/staffs/${editingStaff.ID}`,
          payload
        );
        setStaffs(
          staffs.map((staff) =>
            staff.ID === editingStaff.ID ? { ...staff, ...response.data } : staff
          )
        );
        notificationApi.success({
          message: "Cập nhật nhân viên",
          description: `Nhân viên "${payload.Fullname}" đã được cập nhật thành công.`,
          placement: "topRight",
        });
      } else {
        const response = await axios.post<Staff>(`${REACT_APP_SERVER_URL}/api/staffs`, payload);
        setStaffs([...staffs, { ...response.data, stt: staffs.length + 1, key: response.data.ID }]);
        notificationApi.success({
          message: "Thêm nhân viên",
          description: `Nhân viên "${payload.Fullname}" đã được thêm thành công.`,
          placement: "topRight",
        });
      }
      setIsModalVisible(false);
      fetchStaffs(searchValue, pagination.current, pagination.pageSize);
    } catch (error: any) {
      console.error("Error saving staff:", error);
      notificationApi.error({
        message: "Lỗi khi lưu nhân viên",
        description: error.response?.data?.error || "Không thể lưu nhân viên.",
        placement: "topRight",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${REACT_APP_SERVER_URL}/api/staffs/${id}`);
      const deletedStaff = staffs.find((staff) => staff.ID === id);
      setStaffs(staffs.filter((staff) => staff.ID !== id));
      notificationApi.success({
        message: "Xóa nhân viên",
        description: `Nhân viên "${deletedStaff?.Fullname}" đã được xóa thành công.`,
        placement: "topRight",
      });
      fetchStaffs(searchValue, pagination.current, pagination.pageSize);
    } catch (error: any) {
      console.error("Error deleting staff:", error);
      notificationApi.error({
        message: "Lỗi khi xóa nhân viên",
        description: error.response?.data?.error || "Không thể xóa nhân viên.",
        placement: "topRight",
      });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingStaff(null);
    form.resetFields();
  };

  const columns: ColumnType<Staff>[] = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
    },
    {
      title: "Mã nhân viên",
      dataIndex: "Code",
      key: "Code",
      sorter: (a: Staff, b: Staff) => a.Code.localeCompare(b.Code),
    },
    {
      title: "Họ và tên",
      dataIndex: "Fullname",
      key: "Fullname",
    },
    {
      title: "Email",
      dataIndex: "Email",
      key: "Email",
    },
    {
      title: "Username",
      dataIndex: "Username",
      key: "Username",
    },
    {
      title: "Vai trò",
      dataIndex: ["Role", "Name"],
      key: "Role",
    },
    {
      title: "Tác vụ",
      key: "action",
      render: (_: any, record: Staff) => (
        <Space size="middle">
          <Button icon={<FormOutlined />} onClick={() => showEditModal(record)} />
          <Button icon={<RestOutlined />} onClick={() => handleDelete(record.ID)} />
        </Space>
      ),
    },
  ];

  return (
    <MainLayout title="Quản lý tài khoản">
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
          dataSource={staffs}
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
        title={editingStaff ? "Sửa nhân viên" : "Tạo mới nhân viên"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="Fullname"
                label="Họ và tên"
                rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
              >
                <Input placeholder="Nhập Họ và tên nhân viên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="RoleID"
                label="Nguời tạo"
                rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
              >
                <Select placeholder="Chọn vai trò">
                  {roles.map((role) => (
                    <Option key={role.ID} value={role.ID}>
                      {role.Name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="Code"
                label="Mã nhân viên"
                rules={[{ required: true, message: "Vui lòng nhập mã nhân viên" }]}
              >
                <Input placeholder="Nhập Mã nhân viên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="RoleID"
                label="Vị trí"
                rules={[{ required: true, message: "Vui lòng chọn vị trí" }]}
              >
                <Select placeholder="Chọn vị trí">
                  {roles.map((role) => (
                    <Option key={role.ID} value={role.ID}>
                      {role.Name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="Gender"
                label="Giới tính"
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
              >
                <Select placeholder="Chọn giới tính">
                  <Option value="male">Nam</Option>
                  <Option value="famale">Nữ</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="DayOfBirth"
                label="Ngày sinh"
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
              >
                <Input type="date" placeholder="Chọn ngày sinh" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="Username"
                label="Username"
                rules={[{ required: true, message: "Vui lòng nhập username" }]}
              >
                <Input placeholder="Nhập Username" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="Password"
                label="Password"
                rules={[
                  { required: !editingStaff, message: "Vui lòng nhập mật khẩu" },
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                ]}
              >
                <Input.Password placeholder="Nhập Password" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="Email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input placeholder="Nhập Email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="ConfirmPassword"
                label="Confirm Password"
                dependencies={["Password"]}
                rules={[
                  { required: !editingStaff, message: "Vui lòng xác nhận mật khẩu" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("Password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm Password" />
              </Form.Item>
            </Col>
          </Row>
          <Row justify="end">
            <Space>
              <Button type="primary" onClick={handleOk}>
                Lưu
              </Button>
              <Button onClick={handleCancel}>Hủy bỏ</Button>
            </Space>
          </Row>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default AccountManagement;
