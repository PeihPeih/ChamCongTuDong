import {
    BellOutlined,
    CloseOutlined,
    FilterOutlined,
    HomeOutlined,
    PlusOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import {
    Button,
    Col,
    DatePicker,
    Form,
    Input,
    Layout,
    Menu,
    Modal,
    Row,
    Select,
    Space,
    Table,
    Tag,
    Typography,
} from "antd";
import React from "react";
import MainLayout from "../../layouts/MainLayout";
import { useEffect, useState } from "react";
import { API_URL } from "../../config/index";
import { formatDate, formatDateTime } from "../../utils/DateUtils";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

interface Timekeeping {
    staffCode: string;
    staffName: string;

    timeIn: string;
    timeOut: string;
}

const Reports: React.FC = () => {
    const [dataSource, setDataSource] = useState<Timekeeping[]>([]);
    const columns = [
        {
            title: "STT",
            dataIndex: "stt",
            key: "stt",
            render  : (text: string, record: Timekeeping, index: number) => index + 1,
        },
        {
            title: "Mã nhân viên",
            dataIndex: "staffCode",
            key: "staffCode",
        },
        {
            title: "Tên nhân viên",
            dataIndex: "staffName",
            key: "staffName",
        },
        {
            title: "Giờ vào",
            dataIndex: "timeIn",
            key: "timeIn",
        },
        {
            title: "Giờ ra",
            dataIndex: "timeOut",
            key: "timeOut",
        },
    ];
    
    const getAllTimekeeping = async () => {
        try {
            const response = await fetch(`${API_URL}/api/timekeepings`);
            const data = await response.json();
            const formattedData = data.map((item: any) => ({
                staffCode: item.Staff.Code,
                staffName: item.Staff.Fullname,
                timeIn: item.Time_in ? formatDateTime(item.Time_in) : "--",
                timeOut: item.Time_out ? formatDateTime(item.Time_out) : "--",
            }));
            setDataSource(formattedData);
        } catch (error) {
            console.error("Error fetching timekeeping data:", error);
        }
    }

    useEffect(() => {
        getAllTimekeeping();
    }, []);

    return (
        <MainLayout title="Lịch sử vào ra">

            <Content style={{ margin: "16px" }}>
                <Table
                    dataSource={dataSource}
                    columns={columns}
                    pagination={{ pageSize: 10 }}
                />
            </Content>
        </MainLayout>
    );
};

export default Reports;
