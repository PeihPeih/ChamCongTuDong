import { CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Layout, Modal, Row, Space, Table, Typography, InputNumber } from "antd";
import React, { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";

const { Content } = Layout;
const { Title } = Typography;

const API_URL = `${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}`;

interface DayoffType {
  ID?: string; 
  Name: string;
  Coefficient: number;
}

const DayoffTypes: React.FC = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [dataSource, setDataSource] = useState<DayoffType[]>([]);
    const [name, setName] = useState("");
    const [salaryCoef, setSalaryCoef] = useState(0);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState<DayoffType | null>(null);
    
    const columns = [
      {
        title: "STT",
        key: "stt",
        render: (_: any, __: any, index: number) => index + 1,
      },
      {
        title: "Tên",
        dataIndex: "Name",
        key: "Name",
      },
      {
        title: "Hệ số lương",
        dataIndex: "Coefficient",
        key: "Coefficient",
      },
      {
        title: "Tác vụ",
        key: "action",
        render: (_: any, record: DayoffType) => (
          <Space size="middle">
            <Button 
                icon={<EditOutlined />}
                onClick={() => showEditModal(record)} 
            />
            <Button
              icon={<DeleteOutlined />}
              onClick={() => deleteDayoffType(record.ID || "")}
            />
          </Space>
        ),
      },
    ];

    const getDayoffTypes = async (): Promise<DayoffType[]> => {
      try {
        const response = await fetch(`${API_URL}/api/dayofftypes`);
        if (!response.ok) throw new Error("Lỗi khi lấy dữ liệu");
        const data = await response.json();
        setDataSource(data);
        return data;
      } catch (error) {
        console.error(error);
        throw error; 
      }
    };
    
    const createDayoffType = async (newData: DayoffType) => {
      try {
          const response = await fetch(`${API_URL}/api/dayofftypes`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newData),
          });
          if (!response.ok) throw new Error("Lỗi khi tạo loại đơn từ");
          getDayoffTypes();
      } catch (error) {
        console.error(error);
      }
    };
    
    const updateDayoffType = async (newData: DayoffType) => {
      try {
          const dataUpdate = {
              Name: newData.Name,
              Coefficient: newData.Coefficient,
          }
          const response = await fetch(`${API_URL}/api/dayofftypes/${newData.ID}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dataUpdate),
          });
          if (!response.ok) throw new Error("Lỗi khi sửa loại đơn từ");
          else {
            getDayoffTypes();
          }
      } catch (error) {
        console.error(error);
      }
    };
    
    const deleteDayoffType = async (id: string) => {
      if (!id) {
          alert("Không tìm thấy ID để xóa!");
          return;
      }
      try {
          const response = await fetch(`${API_URL}/api/dayofftypes/${id}`, {
            method: "DELETE",
          });
          if (!response.ok) throw new Error("Lỗi khi xóa loại đơn từ");
          getDayoffTypes();
          alert("Xóa thành công!");
      } catch (error) {
        alert(error)
      }
    };

    useEffect(() => {
      getDayoffTypes();
    }, []);

    const showModal = () => { // Add modal
      setIsModalVisible(true);
      setName("");
      setSalaryCoef(0);
    };
    
    const showEditModal = (record: DayoffType) => {
        setEditingRecord(record);
        setName(record.Name);
        setSalaryCoef(record.Coefficient);
        setIsEditModalVisible(true);
    };

    const submitEditModal = async () => {
        if (editingRecord && name !== "" && typeof salaryCoef === "number" && !isNaN(salaryCoef)) {
            const updatedData: DayoffType = {
              ID: editingRecord.ID,
              Name: name,
              Coefficient: salaryCoef,
            };
            await updateDayoffType(updatedData);
            setIsEditModalVisible(false);
            setEditingRecord(null);
        } else {
            alert("Vui lòng nhập đầy đủ thông tin!");
        }
    };

    const submitAddModal = async () => {
        if (name !== "" && typeof salaryCoef === "number" && !isNaN(salaryCoef)) {
          const newData: DayoffType = {
            Name: name,
            Coefficient: salaryCoef,
          };
          await createDayoffType(newData);
          setIsModalVisible(false);
        } else {
          alert("Vui lòng nhập đầy đủ thông tin!");
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setIsEditModalVisible(false);
        setEditingRecord(null);
    };

    return (
      <MainLayout title="Loại đơn từ">
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
            rowKey={(record) => record.ID || Math.random().toString()}
          />
        </Content>
        <Modal
          title="Tạo mới loại đơn từ"
          open={isModalVisible}
          onOk={submitAddModal}
          onCancel={handleCancel}
          footer={null}
        >
          <Form layout="vertical">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="Tên" required>
                  <Input
                    placeholder="Nhập tên loại đơn"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="Hệ số lương" required>
                    <InputNumber
                        placeholder="0, 0.25, 0.5, 1, ..."
                        value={salaryCoef}
                        onChange={(value) => setSalaryCoef(value || 0)}
                        style={{ width: "100%" }}
                    />
                </Form.Item>
              </Col>
            </Row>
            <Row justify="end">
              <Space>
                <Button type="primary" onClick={submitAddModal}>
                  Gửi
                </Button>
                <Button onClick={handleCancel}>Hủy bỏ</Button>
              </Space>
            </Row>
          </Form>
        </Modal>
        <Modal
        title="Chỉnh sửa loại đơn từ"
        open={isEditModalVisible}
        onOk={submitEditModal}
        onCancel={handleCancel}
        footer={null}
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Tên" required>
                <Input
                  placeholder="Nhập tên loại đơn"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Hệ số lương" required>
                <InputNumber
                    placeholder="0, 0.25, 0.5, 1, ..."
                    value={salaryCoef}
                    onChange={(value) => setSalaryCoef(value || 0)}
                    min={0}
                    max={1}
                    style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row justify="end">
            <Space>
              <Button type="primary" onClick={submitEditModal}>
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

export default DayoffTypes;