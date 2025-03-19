import { DataTypes } from "sequelize";
import sequelize from "../models/index.js";

const DayOffType = sequelize.define(
  "DayOffType",
  {
    ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Name: { type: DataTypes.STRING(255), allowNull: false },
    Coefficient: { type: DataTypes.FLOAT, allowNull: false }, // Hệ số lương. VD: Nghỉ lễ thì hệ số lương = 1 -> hưởng 100% lương
  },
  { timestamps: false }
);

export default DayOffType;
