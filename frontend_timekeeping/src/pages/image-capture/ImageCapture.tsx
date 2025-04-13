import { Flex, Layout, Select, Grid, Row, Col, Button } from "antd";
import React, { useState, useEffect, use } from "react";
import MainLayout from "../../layouts/MainLayout";
import { API_URL } from "../../config/index";
import { UploadOutlined } from "@ant-design/icons";

const { Content } = Layout;
const { Option } = Select;

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

const ImageCapture: React.FC = () => {
    const [staffs, setStaffs] = useState<Staff[]>([]);
    const [staff, setStaff] = useState<Staff>();
    const [images, setImages] = useState<string[]>([]);

    const getAllStaffs = async () => {
        try {
            const response = await fetch(`${API_URL}/api/staffs`);
            const data = await response.json();
            const staffs = data.data;
            const staffsWithKey = staffs.map((staff: Staff, index: number) => ({
                ...staff,
                key: index + 1,
            }));
            setStaffs(staffsWithKey);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const getAllImages = async (staffId: number) => {
        try {
            const response = await fetch(`${API_URL}/api/staffs/${staffId}/sample-images`);
            const data = await response.json();
            const images = data.imagePaths;
            setImages(images);
        }
        catch (error) {
            console.error("Error fetching images:", error);
        }
    };

    useEffect(() => {
        getAllStaffs();
    }, []);

    useEffect(() => {
        if (staff) {
            getAllImages(staff.ID);
        }
    }
    , [staff]);

    return (
        <MainLayout title="Lấy ảnh mẫu nhân viên">
            <Content style={{ margin: "16px", backgroundColor: "#fff" }}>
                <div style={{ padding: "16px", borderBottom: "1px solid #e8e8e8" }}>
                    <Select
                        placeholder="Chọn nhân viên"
                        style={{ width: "20%" }}
                        onChange={(value) => {
                            const selectedStaff = staffs.find((staff) => staff.ID === value);
                            setStaff(selectedStaff);
                        }}
                    >
                        {staffs.map((staff) => (
                            <Option key={staff.ID} value={staff.ID}>
                                {staff.Fullname}
                            </Option>
                        ))}
                    </Select>
                </div>
                <Flex style={{ padding: "16px" }}>
                    <Flex style={{ flexDirection: "column", marginRight: "16px", width: "30%", borderRight: "1px solid #e8e8e8" }}>
                        <h2 style={{ color: "#208f39", textAlign:"center"}}>Thông tin nhân viên</h2>
                        {staff && (
                            <div>
                                <p>Mã nhân viên: {staff.Code}</p>
                                <p>Họ và tên: {staff.Fullname}</p>
                            </div>
                        )}
                    </Flex>
                    <div style={{ width: "70%", marginLeft: "16px" }}>
                        <Flex style={{ justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                            <h2 style={{ color: "#208f39", marginLeft: "8px"}}>Ảnh mẫu</h2>
                            <Button 
                                style={{ marginRight: "8px" }} 
                                type="primary"
                                icon={<UploadOutlined />}
                            >
                                Tải ảnh lên
                            </Button>
                        </Flex>
                        <Row gutter={[16, 16]} style={{ width: "100%" }}>
                        {images && images.map((src, index) => (
                            <Col key={index} xs={24} sm={12} md={6}>
                                <img
                                    src={`${API_URL}/api/images/${src}`}
                                    alt={`Ảnh ${index + 1}`}
                                    style={{
                                        width: '100%',
                                        objectFit: 'cover',
                                        cursor: 'pointer',
                                    }}
                                />
                            </Col>
                        ))}
                        </Row>
                    </div>
                </Flex>
            </Content>
        </MainLayout>
    );
};

export default ImageCapture;
