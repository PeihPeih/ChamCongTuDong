import dotenv from "dotenv";
import express from "express";
import sequelize from "./models/index.js"; // MySQL
import mongoose from "mongoose"; // MongoDB
import cors from "cors";
import cookieParser from "cookie-parser";

// Import tất cả routes
import staffRoutes from "./routes/StaffRoutes.js";
import shiftRoutes from "./routes/ShiftRoutes.js";
import dayOffRoutes from "./routes/DayoffRoutes.js";
import timekeepingRoutes from "./routes/timekeepingRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import positionRoutes from "./routes/positionRoutes.js";
import roleRoutes from "./routes/RoleRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import dayOffTypeRoutes from "./routes/dayOffTypeRoutes.js";
import authRoutes from "./routes/Auth.js";
import imageRoutes from "./routes/ImageRoutes.js";

dotenv.config(); // Load environment variables

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.raw({ type: "image/*", limit: "10mb" })); // Accept raw image data

// Định nghĩa các route API
app.use("/api/auth", authRoutes);
app.use("/api/staffs", staffRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/dayoffs", dayOffRoutes);
app.use("/api/timekeepings", timekeepingRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/config", configRoutes);
app.use("/api/dayofftypes", dayOffTypeRoutes);
app.use("/api/images", imageRoutes);

// Hàm kết nối cả hai database
const connectDatabases = async () => {
  try {
    await sequelize.authenticate();
    console.log("-------> Kết nối MySQL thành công!");

    await sequelize.sync();

    const mongoURI =
      process.env.MONGO_URI || "mongodb://localhost:27017/embedded_system";
    await mongoose.connect(mongoURI);
    console.log("-------> Kết nối MongoDB thành công!");

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`-------> Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("[Error] Lỗi kết nối database:", err);
    process.exit(1);
  }
};

connectDatabases();
