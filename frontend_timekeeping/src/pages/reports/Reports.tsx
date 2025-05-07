import {
    Button,
    Col,
    Form,
    Row,
    Select,
    Space,
    Table,
    Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import axios from "axios";
import { API_URL } from "../../config";
import moment from "moment";
import * as XLSX from "xlsx";
import { saveAs } from 'file-saver';
import { formatDateTime } from "../../utils/DateUtils";
const { Text } = Typography;
const { Option } = Select;

interface Position {
    ID: number;
    Name: string;
}

interface Employee {
    ID: number;
    Fullname: string;
    Code: string;
    Position: Position;
}

const evidenceColumns = [
    {
        title: "STT",
        dataIndex: "stt",
        key: "stt",
    },
    {
        title: "Ngày",
        dataIndex: "date",
        key: "date",
    },
    {
        title: "Thứ",
        dataIndex: "dayOfWeek",
        key: "dayOfWeek",
    },
    {
        title: "Ca làm",
        dataIndex: "caLamViec",
        key: "caLamViec",
    },
    {
        title: "Giờ checkin",
        dataIndex: "checkIn",
        key: "checkIn",
    },
    {
        title: "Giờ checkout",
        dataIndex: "checkOut",
        key: "checkOut",
    },
    {
        title: "Tổng giờ làm",
        dataIndex: "totalHours",
        key: "totalHours",
    },
    {
        title: "Công làm",
        dataIndex: "workDone",
        key: "workDone",
    },
];

interface EvidenceItem {
    stt: number;
    date: string;
    dayOfWeek: string;
    caLamViec: string;
    checkIn: string;
    checkOut: string;
    totalHours: string;
    workDone: string;
}

interface EvidenceResult {
    list: EvidenceItem[];
    workingDays: number;
    totalWorkUnit: number;
}

const generateFullMonthData = (
    rawData: any[],
    yearStr: string,
    monthStr: string
): EvidenceResult => {
    moment.locale("vi");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const startDate = moment({ year, month: month - 1, day: 1 });
    const daysInMonth = startDate.daysInMonth();

    const mapDataByDate = new Map<string, any>();
    rawData.forEach((item) => {
        const dateKey = moment(item.work_date).format("YYYY-MM-DD");
        mapDataByDate.set(dateKey, item);
    });

    const result: EvidenceItem[] = [];
    let workingDays = 0;
    let totalWorkUnit = 0;

    for (let i = 1; i <= daysInMonth; i++) {
        const date = moment({ year, month: month - 1, day: i });
        const dateStr = date.format("YYYY-MM-DD");
        const dayOfWeek = date.format("dddd");
        const day = date.day(); // 0 = CN, 6 = T7

        if (day !== 0 && day !== 6) {
            workingDays++;
        }

        const data = mapDataByDate.get(dateStr);

        const workUnit = data?.work_unit ?? null;
        if (workUnit !== null && typeof workUnit === "number") {
            totalWorkUnit += workUnit;
        }

        result.push({
            stt: i,
            date: dateStr,
            dayOfWeek,
            caLamViec: `${data?.shift?.time_in ?? "--"} - ${data?.shift?.time_out ?? "--"}`,
            checkIn: data?.checkin ? formatDateTime(data?.checkin) : "--",
            checkOut: data?.checkout ? formatDateTime(data?.checkout) : "--",
            totalHours: data?.working_hours?.toFixed(2) ?? "--",
            workDone: data?.work_unit?.toFixed(2) ?? "--",
        });
    }

    return {
        list: result,
        workingDays,
        totalWorkUnit: parseFloat(totalWorkUnit.toFixed(2)),
    };
};



const Reports: React.FC = () => {
    const [selectedYear, setSelectedYear] = useState<string>("2025");
    const [selectedMonth, setSelectedMonth] = useState<string>("4");
    const [selectedEmployee, setSelectedEmployee] = useState<Employee>();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [evidenceData, setEvidenceData] = useState<EvidenceItem[]>([]);
    const [totalWorkingDay, setTotalWorkingDay] = useState<number>(0);
    const [totalRealDay, setTotalRealDay] = useState<number>(0);
    const [form] = Form.useForm();

    const handleYearChange = (value: string) => {
        setSelectedYear(value);
    };

    const handleMonthChange = (value: string) => {
        setSelectedMonth(value);
    };

    const handleEmployeeChange = (value: number) => {
        const employee = employees.find((emp) => emp.ID === value);
        if (employee) {
            setSelectedEmployee(employee);
        }
    };

    const onFinish = (values: any) => {
        console.log("Form values:", values);
    };

    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();

        // 1. Tạo sheet mới rỗng
        const sheet = XLSX.utils.aoa_to_sheet([
            ["Mã NV", selectedEmployee?.Code ?? ""],
            ["Họ và tên", selectedEmployee?.Fullname ?? ""],
            ["Vị trí", selectedEmployee?.Position?.Name ?? ""],
            ["Công tiêu chuẩn", totalWorkingDay ?? ""],
            ["Công thực tế", totalRealDay ?? ""],
        ]);

        // 2. Gộp bảng chấm công bắt đầu từ dòng 7 (tức A7)
        XLSX.utils.sheet_add_json(sheet, evidenceData, {
            origin: "A7", // Hợp lệ ở đây
            skipHeader: false
        });

        XLSX.utils.book_append_sheet(wb, sheet, "ChamCong");

        const fileName = `ChamCong_${selectedEmployee?.Code}_${selectedMonth}_${selectedYear}.xlsx`;
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([wbout], { type: "application/octet-stream" }), fileName);
    };



    const fetchStaffs = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/staffs`);
            let staffsData = [];
            if (response.data && response.data.data && Array.isArray(response.data.data)) {
                staffsData = response.data.data;
            } else if (Array.isArray(response.data)) {
                staffsData = response.data;
            }
            setEmployees(staffsData);
        } catch (error: any) {
            console.error("Error fetching staffs:", error);
            setEmployees([]); // Đặt mảng rỗng khi có lỗi
        }
    };

    const fetchWorklogs = async () => {
        try {
            const response = await axios.get<{ success: boolean; data: EvidenceItem[] }>(
                `${API_URL}/api/worklogs/staff/${selectedEmployee?.ID}`,
                {
                    params: { year: selectedYear, month: selectedMonth },
                }
            );
            const formatted = generateFullMonthData(response.data.data, selectedYear, selectedMonth);
            setEvidenceData(formatted?.list);
            setTotalWorkingDay(formatted?.workingDays)
            setTotalRealDay(formatted?.totalWorkUnit)
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu chấm công:", error);
        }
    };

    useEffect(() => {
        fetchStaffs()
    }, []);

    useEffect(() => {
        fetchWorklogs()
    }, [selectedEmployee, selectedMonth, selectedYear]);

    return (
        <MainLayout title="Báo cáo thống kê">
            <Space direction="vertical" size="middle" style={{ width: "100%", paddingRight: "15px", paddingLeft: "15px" }}>
                <Row gutter={16} align="middle">
                    <Col>
                        <Select
                            defaultValue={selectedYear}
                            style={{ width: 120 }}
                            onChange={handleYearChange}
                            placeholder="Chọn năm"
                        >
                            {Array.from({ length: 6 }, (_, i) => {
                                const year = 2020 + i;
                                return (
                                    <Option key={year} value={year.toString()}>
                                        Năm {year}
                                    </Option>
                                );
                            })}
                        </Select>
                    </Col>
                    <Col>
                        <Select
                            defaultValue={selectedMonth}
                            style={{ width: 120 }}
                            onChange={handleMonthChange}
                            placeholder="Chọn tháng"
                        >
                            {Array.from({ length: 12 }, (_, i) => {
                                const month = i + 1;
                                return (
                                    <Option key={month} value={month.toString()}>
                                        Tháng {month}
                                    </Option>
                                );
                            })}
                        </Select>
                    </Col>
                    <Col>
                        <Select
                            style={{ width: 200 }}
                            onChange={handleEmployeeChange}
                            placeholder="Chọn nhân viên"
                        >
                            {employees.map((employee) => (
                                <Option key={employee.ID} value={employee.ID}>
                                    {employee.Fullname}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col>
                        <Button type="primary" style={{ backgroundColor: "#52c41a" }} onClick={exportToExcel}>
                            Xuất file
                        </Button>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form
                            style={{ paddingLeft: "20px" }}
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                        >
                            <Row>
                                <Col span={24}>
                                    <Text style={{ fontSize: "18px" }}>
                                        <strong>Mã NV:</strong> {selectedEmployee?.Code}
                                    </Text>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24} style={{ marginTop: "8px" }}>
                                    <Text style={{ fontSize: "18px" }}>
                                        <strong>Họ và tên:</strong> {selectedEmployee?.Fullname}
                                    </Text>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24} style={{ marginTop: "8px" }}>
                                    <Text style={{ fontSize: "18px" }}>
                                        <strong>Vị trí:</strong> {selectedEmployee?.Position?.Name}
                                    </Text>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24} style={{ marginTop: "8px" }}>
                                    <Text style={{ fontSize: "18px" }}>
                                        <strong>Công tiêu chuẩn:</strong> {totalWorkingDay && totalWorkingDay}
                                    </Text>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24} style={{ marginTop: "8px" }}>
                                    <Text style={{ fontSize: "18px", color: "red", fontWeight: "bold" }}>
                                        <strong>Công thực tế:</strong> {totalRealDay && totalRealDay}
                                    </Text>
                                </Col>
                            </Row>
                            {/* <Row>
                                <Col span={24} style={{ marginTop: "8px" }}>
                                    <Text
                                        style={{ fontSize: "18px", color: "red", fontWeight: "bold" }}
                                        className="total-text"
                                    >
                                        <strong>TỔNG CỘNG:</strong> {total}
                                    </Text>
                                </Col>
                            </Row> */}
                        </Form>
                    </Col>
                    <Col span={16}>
                        <Table
                            dataSource={evidenceData}
                            columns={evidenceColumns}
                            pagination={false}
                            size="large"
                            className="evidence-table"
                        />
                    </Col>
                </Row>
            </Space>
        </MainLayout>
    );
};

export default Reports;