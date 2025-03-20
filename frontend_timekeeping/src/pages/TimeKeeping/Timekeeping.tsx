import { CalendarOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Calendar, Col, Input, Layout, Row, Typography } from "antd";
import React from "react";
import MainLayout from "../../layouts/MainLayout";
import '../../App.css';
import moment from 'moment';
import { useState, useEffect } from "react";

const { Content } = Layout;
const { Title, Text } = Typography;

const API_URL = `${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}`;

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

    const dateCellRender = (date: any) => {
        const day = date.date();
        const month = date.month() + 1; 
        const year = date.year();

        const FORMAT = "YYYY-MM-DD";

        const currentDate = moment([year, month - 1, day]).format(FORMAT);
        const hasTimekeeping = timekeepingData.some((record) => {
            const recordDate = moment(record.Date).format(FORMAT);
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
          try {
                await getTimeKeeping(year, month);
          } catch (error) {
            console.error('Lỗi khi lấy dữ liệu chấm công:', error);
          }
        }
      }
    
    const getCurrentTimeKeeping = async () => {
        const now = moment();
        const year = now.year();
        const month = String(now.month() + 1).padStart(2, '0');
        try {
            await getTimeKeeping(year, month);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu chấm công:', error);
        }
    }

    useEffect(() => {
        getCurrentTimeKeeping();
    }, []);

    return (
        <MainLayout  title="Quản lý chấm công">
            <Content style={{ margin: "16px" }}>
                <div style={{ background: "#fff", padding: "16px", borderRadius: "8px" }}>
                    <Title level={4} style={{ textAlign: "center" }}>
                        Bảng chấm công tháng 3, 2025
                    </Title>
                    <Text style={{ display: "block", textAlign: "center", marginBottom: "16px" }}>
                        01/03/2025 - 31/03/2025
                    </Text>
                    <Calendar 
                        cellRender={dateCellRender}
                        onPanelChange={onPanelChange}
                    />
                </div>
            </Content>
        </MainLayout>
    );
};

export default TimeManagement;