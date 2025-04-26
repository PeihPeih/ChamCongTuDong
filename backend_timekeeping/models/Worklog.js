import { DataTypes } from "sequelize";
import sequelize from "./index.js";
import Staff from "./Staff.js";
import Shift from "./Shift.js";

const Worklog = sequelize.define(
  "Worklog",
  {
    ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    work_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    working_hours: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    work_unit: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    note: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Thiết lập liên kết
Worklog.belongsTo(Staff, { foreignKey: "staffID" });
Worklog.belongsTo(Shift, { foreignKey: "shiftID" });

export default Worklog;
