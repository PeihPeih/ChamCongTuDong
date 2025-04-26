import { DataTypes } from "sequelize"; // Dùng import thay vì require
import sequelize from "./index.js"; // Dùng import thay vì require
import Staff from "./Staff.js"; // Dùng import thay vì require
import Shift from "./Shift.js"; // Dùng import thay vì require

const Timekeeping = sequelize.define(
  "Timekeeping",
  {
    ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Date: { type: DataTypes.DATE, allowNull: false },
    Time_in: { type: DataTypes.STRING(255), allowNull: true },
    Time_out: { type: DataTypes.STRING(255), allowNull: true },
  },
  { timestamps: false }
);

Timekeeping.belongsTo(Staff, { foreignKey: "StaffID" });

export default Timekeeping; // Sử dụng export default thay vì module.exports
