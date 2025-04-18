import express from "express";
const router = express.Router();
import {
  createStaffShift,
  deleteStaffShift,
  getAllStaffShifts,
  getStaffShiftById,
  updateStaffShift,
  getStaffShiftsByStaff,
  getStaffShiftsByShift,
  getStaffShiftsDropdown,
} from "../controller/StaffShiftController.js";
import { verifyAdmin, verifyUser } from "../utils/verifyToken.js";

// Lấy tất cả phân công ca làm việc (có thể lọc theo nhân viên, ca làm)
router.get("/", getAllStaffShifts);

// Lấy thông tin phân công theo ID
router.get("/:id", getStaffShiftById);

// Lấy tất cả phân công theo nhân viên
router.get("/staff/:staffId", getStaffShiftsByStaff);

// Lấy tất cả phân công theo ca làm việc
router.get("/shift/:shiftId", getStaffShiftsByShift);

// API cho dropdown và select
router.get("/dropdown", getStaffShiftsDropdown);

// Tạo phân công mới
router.post("/", createStaffShift);

// Cập nhật phân công
router.put("/:id", updateStaffShift);

// Xóa phân công
router.delete("/:id", deleteStaffShift);

export default router;
