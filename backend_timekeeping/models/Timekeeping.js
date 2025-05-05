import { DataTypes } from "sequelize"; // Dùng import thay vì require
import sequelize from "./index.js"; // Dùng import thay vì require
import Staff from "./Staff.js"; // Dùng import thay vì require
import Shift from "./Shift.js"; // Dùng import thay vì require

const Timekeeping = sequelize.define(
  "Timekeeping",
  {
    ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Time_in: { type: DataTypes.DATE, allowNull: true },
    Time_out: { type: DataTypes.DATE, allowNull: true },
  },
  { timestamps: false }
);

Timekeeping.belongsTo(Staff, { foreignKey: "StaffID" });

export default Timekeeping; // Sử dụng export default thay vì module.exports
