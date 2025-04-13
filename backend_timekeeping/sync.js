import dotenv from "dotenv"; 
import sequelize from "./models/index.js"; 

import "./models/Config.js";
import "./models/Department.js";
import "./models/Position.js";
import "./models/Role.js";
import "./models/Staff.js";
import "./models/Shift.js";
import "./models/StaffShift.js"; // Bảng trung gian Staff - Shift
import "./models/DayOffType.js"; // Bảng loại nghỉ phép
import "./models/DayOffs.js"; // Bảng nghỉ phép (liên kết với Staff & DayOffType)
import "./models/Timekeeping.js"; // Bảng chấm công

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database đã được đồng bộ thành công!");
    process.exit();
  })
  .catch((err) => {
    console.error("Lỗi đồng bộ:", err);
    process.exit(1);
  });
