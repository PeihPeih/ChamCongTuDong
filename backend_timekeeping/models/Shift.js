import { DataTypes } from "sequelize";
import sequelize from "./index.js";

const Shift = sequelize.define(
  "Shift",
  {
    ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Name: { type: DataTypes.STRING(255), allowNull: true },
    Time_in: { type: DataTypes.TIME, allowNull: true },
    Time_out: { type: DataTypes.TIME, allowNull: true },
    Is_default: { type: DataTypes.INTEGER, allowNull: true },
    Type_shift: { type: DataTypes.INTEGER, allowNull: true }, // 1: ca ngày, 2: ca đêm
    Start_date: { type: DataTypes.DATE, allowNull: true },
    Total_time: { type: DataTypes.FLOAT, allowNull: true },
  },
  { timestamps: false }
);

export default Shift;
