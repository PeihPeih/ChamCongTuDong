import { DataTypes } from "sequelize"; // Dùng import thay vì require
import sequelize from "./index.js"; // Dùng import thay vì require

const Shift = sequelize.define(
  "Shift",
  {
    ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Name: { type: DataTypes.STRING(255), allowNull: false }, // Tên ca làm
    Time_in: { type: DataTypes.STRING(255), allowNull: false }, // Thời gian bắt đầu làm việc
    Time_out: { type: DataTypes.STRING(255), allowNull: false }, // Thời gian kết thúc làm việc
    Is_default: { type: DataTypes.INTEGER, allowNull: false },
    Type_shift: { type: DataTypes.INTEGER, allowNull: false }, // 1. Ca ngày, 2. Ca đêm
    Start_date: { type: DataTypes.DATE, allowNull: false },
    Total_time: { type: DataTypes.STRING(255), allowNull: false },
  },
  { timestamps: false }
);

export default Shift; // Sử dụng export default thay vì module.exports
