import express from "express";
const router = express.Router();
import {
  createDepartment,
  deleteDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  getDepartmentsForDropdown,
} from "../controller/departmentController.js";

router.get("/", getAllDepartments);
router.get("/dropdown", getDepartmentsForDropdown); // Lấy danh sách phòng ban cho dropdown
router.get("/:id", getDepartmentById);
router.post("/", createDepartment);
router.put("/:id", updateDepartment);
router.delete("/:id", deleteDepartment);

export default router;
