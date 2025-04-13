import { CalendarOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Calendar, Col, Input, Layout, Row, Typography } from "antd";
import React from "react";
import MainLayout from "../../layouts/MainLayout";
import '../../App.css';
import dayjs from 'dayjs'; // Sử dụng dayjs thay vì moment
import { useState, useEffect } from "react";
import { API_URL } from "../../config/index";

const { Content } = Layout;
const { Title, Text } = Typography;

interface Timekeeping {
    ID: number;
    StaffID: number;
    Date: Date;
    Time_in: string;
    Time_out: string;
    ShiftID: number;
} 

const TimeManagement: React.FC = () => {
    const [timekeepingData, setTimekeepingData] = useState<Timekeeping[]>([]);
    const [currentDate, setCurrentDate] = useState(dayjs()); // Sử dụng dayjs

    const dateCellRender = (date: any) => {
        const day = date.date();
        const month = date.month() + 1; 
        const year = date.year();

        const FORMAT = "YYYY-MM-DD";

        const currentDate = dayjs(`${year}-${month}-${day}`).format(FORMAT);
        const hasTimekeeping = timekeepingData.some((record) => {
            const recordDate = dayjs(record.Date).format(FORMAT); // Sử dụng dayjs
            return recordDate === currentDate;
        });

        if (hasTimekeeping) {
            return <div className="has-clocked"></div>;
        }
        return <div></div>; 
    };

    const getTimeKeeping = async (year: any, month: any) => {
        try{
            const response = await fetch(`${API_URL}/api/timekeepings/staff/16?year=${year}&month=${month}`);
            if (response.ok) {
                const data = await response.json();
                const timekeepings = data.map((item: any) => ({
                    ID: item.ID,
                    StaffID: item.StaffID,
                    Date: item.Date,
                    Time_in: item.Time_in,
                    Time_out: item.Time_out,
                    ShiftID: item.ShiftID
                }));
                setTimekeepingData(timekeepings);
            }
        } catch (error) {
            console.error("Failed to get timekeeping data: ", error);
        }
    }

    const onPanelChange = async (date: any, mode: any) => {
        if (mode === 'month') {
            const year = date.year();
            const month = String(date.month() + 1).padStart(2, '0');
            setCurrentDate(date); // cập nhật tháng hiện tại khi người dùng thay đổi
            try {
                await getTimeKeeping(year, month);
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu chấm công:', error);
            }
        }
    }

    const getCurrentTimeKeeping = async () => {
        const now = dayjs(); // Sử dụng dayjs
        const year = now.year();
        const month = String(now.month() + 1).padStart(2, '0');
        setCurrentDate(now); // khởi tạo tháng hiện tại
        try {
            await getTimeKeeping(year, month);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu chấm công:', error);
        }
    }

    useEffect(() => {
        getCurrentTimeKeeping();
    }, []);

    const month = currentDate.month() + 1; // Đảm bảo month là số nguyên hợp lệ
    const year = currentDate.year(); // Kiểm tra year để lấy giá trị hợp lệ
    const monthStart = currentDate.startOf("month").format("DD/MM/YYYY");
    const monthEnd = currentDate.endOf("month").format("DD/MM/YYYY");

    return (
        <MainLayout title="Quản lý chấm công">
            <Content style={{ margin: "16px" }}>
                <div style={{ background: "#fff", padding: "16px", borderRadius: "8px" }}>
                    <Title level={4} style={{ textAlign: "center" }}>
                        Bảng chấm công tháng {month}, {year}
                    </Title>
                    <Text style={{ display: "block", textAlign: "center", marginBottom: "16px" }}>
                        {monthStart} - {monthEnd}
                    </Text>
                    <Calendar 
                        cellRender={dateCellRender}
                        onPanelChange={onPanelChange}
                        defaultValue={currentDate} // Đảm bảo sử dụng dayjs
                    />
                </div>
            </Content>
        </MainLayout>
    );
};

export default TimeManagement;
