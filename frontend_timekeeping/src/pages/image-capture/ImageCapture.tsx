import { Flex, Layout, Select, Grid, Row, notification, Col, Button, message } from "antd";
import React, { useState, useEffect, useRef } from "react";
import MainLayout from "../../layouts/MainLayout";
import { API_URL } from "../../config/index";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { formatDate } from "../../utils/DateUtils";

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
  const [notificationApi, contextHolder] = notification.useNotification();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const fileInputRef = useRef<any>(null);

  const getAllStaffs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/staffs`);
      const data = await response.json();
      const staffs = data.data;
      const staffsWithKey = staffs.map((staff: Staff, index: number) => ({
        ...staff,
        key: index + 1,
        DayOfBirth: formatDate(staff.DayOfBirth), // Format the date here
        stt: index + 1,
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
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event: any) => {
    const file = event.target.files[0];
    if (!file || !staff) return;

    try {
      const arrayBuffer = await file.arrayBuffer();

      const response = await fetch(`${API_URL}/api/staffs/${staff.ID}/addSampleImage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: arrayBuffer,
      });

      const data = await response.json();
      if (response.ok) {
        notificationApi.success({
          message: "Tải ảnh lên thành công",
          description: `Tải ảnh lên thành công`,
          placement: "topRight",
        });
        getAllImages(staff.ID); // Tải lại ảnh sau khi upload
      } else {
        notificationApi.error({
          message: "Tải ảnh lên thất bại",
          description: data.error || "Tải ảnh lên thất bại",
          placement: "topRight",
        });
        console.error("Error uploading image:", data);
      }
    } catch (error) {
      console.error("Lỗi upload:", error);
      message.error("Đã xảy ra lỗi khi upload ảnh");
    }
  };

  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>, imageName: string) => {
    if (e.target.checked) {
      setSelectedImages((prev) => [...prev, imageName]);
    } else {
      setSelectedImages((prev) => prev.filter((name) => name !== imageName));
    }
  };

  const handleDeleteImages = async () => {
    if (!staff || selectedImages.length === 0) return;

    try {
      const response = await fetch(`${API_URL}/api/staffs/${staff.ID}/deleteImages`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageNames: selectedImages }),
      });

      const data = await response.json();
      if (response.ok) {
        notificationApi.success({
          message: "Xóa ảnh thành công",
          description: `Đã xóa ${selectedImages.length} ảnh`,
          placement: "topRight",
        });
        setSelectedImages([]); // Clear selected images
        getAllImages(staff.ID); // Refresh the image list
      } else {
        notificationApi.error({
          message: "Xóa ảnh thất bại",
          description: data.message || "Không thể xóa ảnh",
          placement: "topRight",
        });
      }
    } catch (error) {
      console.error("Lỗi khi xóa ảnh:", error);
      message.error("Đã xảy ra lỗi khi xóa ảnh");
    }
  };

  useEffect(() => {
    getAllStaffs();
  }, []);

  useEffect(() => {
    if (staff) {
      getAllImages(staff.ID);
      setSelectedImages([]); // Reset selected images when staff changes
    }
  }, [staff]);

  return (
    <MainLayout title="Lấy ảnh mẫu nhân viên">
      {contextHolder}
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
          <Flex
            style={{
              flexDirection: "column",
              marginRight: "16px",
              width: "30%",
              borderRight: "1px solid #e8e8e8",
            }}
          >
            <h2 style={{ color: "#208f39", textAlign: "center" }}>Thông tin nhân viên</h2>
            {staff && (
              <div>
                <p>Mã nhân viên: {staff.Code}</p>
                <p>Họ và tên: {staff.Fullname}</p>
                <p>Ngày sinh: {staff.DayOfBirth}</p>
                {/* <p>Giới tính: {staff.Gender}</p> */}
              </div>
            )}
          </Flex>
          <div style={{ width: "70%", marginLeft: "16px" }}>
            <Flex style={{ justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ color: "#208f39", marginLeft: "8px" }}>Ảnh mẫu</h2>
              <div>
                <Button
                  style={{ marginRight: "16px" }}
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={handleUploadClick}
                >
                  Tải ảnh lên
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <Button
                  style={{ marginRight: "8px" }}
                  danger
                  onClick={handleDeleteImages}
                  icon={<DeleteOutlined />}
                  disabled={selectedImages.length === 0} // Disable if no images are selected
                >
                  Xóa ảnh
                </Button>
              </div>
            </Flex>
            <Row gutter={[16, 16]} style={{ width: "100%" }}>
              {images &&
                images.map((src, index) => (
                  <Col key={index} xs={24} sm={12} md={6} style={{ position: "relative" }}>
                    <img
                      src={`${API_URL}/api/images/${src}`}
                      alt={`Ảnh ${index + 1}`}
                      style={{
                        width: "180px",
                        height: "180px",
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                    />
                    <input
                      type="checkbox"
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: "8px",
                        width: "20px",
                        height: "20px",
                        cursor: "pointer",
                      }}
                      onChange={(e) => handleSelectImage(e, src)}
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
