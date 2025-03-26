import { DataTypes } from "sequelize"; // Dùng import thay vì require
import sequelize from "../models/index.js"; // Dùng import thay vì require

const Shift = sequelize.define(
  "Shift",
  {
    ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Name: { type: DataTypes.STRING(255), allowNull: false }, // Tên ca làm
    Time_in: { type: DataTypes.STRING(255), allowNull: false }, // Thời gian bắt đầu làm việc
    Time_out: { type: DataTypes.STRING(255), allowNull: false }, // Thời gian kết thúc làm việc
    Start_time_of: { type: DataTypes.STRING(255), allowNull: false }, // Thời gian bắt đầu nghỉ trưa
    End_time_of: { type: DataTypes.STRING(255), allowNull: false }, // Thời gian kết thúc nghỉ trưa
    Is_default: { type: DataTypes.INTEGER, allowNull: false },
    Type_shift: { type: DataTypes.STRING(255), allowNull: false }, // Ca sáng - 1 , Ca tối - 2
    Start_date: { type: DataTypes.DATE, allowNull: false }, // Ngày bắt đầu
    Total_time: { type: DataTypes.STRING(255), allowNull: false }, // Tổng thời gian làm việc
  },
  { timestamps: false }
);

export default Shift; // Sử dụng export default thay vì module.exports
