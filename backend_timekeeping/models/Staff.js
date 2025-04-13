import { DataTypes } from "sequelize"; 
import sequelize from "../models/index.js"; 
import Position from "./Position.js"; 
import Department from "./Department.js"; 
import Role from "./Role.js"; 

const Staff = sequelize.define(
  "Staff",
  {
    ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Fullname: { type: DataTypes.STRING(255), allowNull: false },
    Code: { type: DataTypes.STRING(255), allowNull: false },
    Username: { type: DataTypes.STRING(255), allowNull: false },
    Password: { type: DataTypes.STRING(255), allowNull: false },
    Gender: { type: DataTypes.STRING(255), allowNull: false },
    DayOfBirth: { type: DataTypes.DATE, allowNull: true }, // Changed to true to allow null
    Email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "email_unique",
      validate: {
        isEmail: true, // Kiểm tra xem có phải định dạng email hợp lệ không
      },
    },
  },
  {
    timestamps: true,
    createdAt: "Created_at",
    updatedAt: "Updated_at",
  }
);

// Define relationships with allowNull: true for foreign keys
Staff.belongsTo(Position, {
  foreignKey: { name: "PositionID", allowNull: true },
});
Staff.belongsTo(Department, {
  foreignKey: { name: "DepartmentID", allowNull: true },
});
Staff.belongsTo(Role, { foreignKey: { name: "RoleID", allowNull: true } });
// sequelize.sync({ force: true });
export default Staff; // Sử dụng export default thay vì module.exports
