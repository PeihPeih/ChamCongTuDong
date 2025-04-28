import { DataTypes } from "sequelize";
import sequelize from "./index.js";

const Shift = sequelize.define(
  "Shift",
  {
    ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Name: { type: DataTypes.STRING(255), allowNull: true },
    Time_in: { type: DataTypes.TIME, allowNull: true },
    Time_out: { type: DataTypes.TIME, allowNull: true },
    Start_time_of: { type: DataTypes.TIME, allowNull: false }, // Thêm trường Start_time_of
    End_time_of: { type: DataTypes.TIME, allowNull: true }, // Thêm trường End_time_of
    Is_default: { type: DataTypes.INTEGER, allowNull: true },
    Type_shift: { type: DataTypes.INTEGER, allowNull: true },
    Start_date: { type: DataTypes.DATE, allowNull: true },
    Total_time: { type: DataTypes.FLOAT, allowNull: true },
  },
  { timestamps: false }
);

export default Shift;
