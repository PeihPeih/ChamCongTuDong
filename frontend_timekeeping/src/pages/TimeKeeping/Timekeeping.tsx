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


interface Worklog {
    id: number;
    staffID: number;
    work_date: Date;
    working_hours: number;
    work_unit: number;
}


const TimeManagement: React.FC = () => {
    const userStr = localStorage.getItem("user");
    const userId = userStr ? JSON.parse(userStr).ID : null;
    const [worklog, setWorklog] = useState<Worklog[]>([]);
    const [currentDate, setCurrentDate] = useState(dayjs()); // Sử dụng dayjs

    const dateCellRender = (date: any) => {
        const day = date.date();
        const month = date.month() + 1;
        const year = date.year();

        const FORMAT = "YYYY-MM-DD";

        const currentDate = dayjs(`${year}-${month}-${day}`).format(FORMAT);
        const worklogRecord = worklog.find((record) => {
            const recordDate = dayjs(record.work_date).format(FORMAT);
            return recordDate === currentDate;
        });

        if (worklogRecord) {
            return <div className="has-clocked">{worklogRecord.work_unit}</div>;
        }
        return <div></div>;
    };

    const getWorklog = async (year: any, month: any) => {
        try {
            const response = await fetch(`${API_URL}/api/worklogs/staff/${userId}?year=${year}&month=${month}`);
            if (response.ok) {
                const jsonData = await response.json();
                const worklogs = jsonData.data;
                const formattedWorklogs = worklogs.map((log: Worklog) => ({
                    id: log.id,
                    staffID: log.staffID,
                    work_date: log.work_date,
                    working_hours: log.working_hours,
                    work_unit: Math.round(log.work_unit * 100) / 100,
                }));
                setWorklog(formattedWorklogs);
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
                await getWorklog(year, month);
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
            await getWorklog(year, month);
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
