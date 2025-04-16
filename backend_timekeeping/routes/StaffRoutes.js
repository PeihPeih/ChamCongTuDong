import express from "express";
const router = express.Router();
import {
  createStaff,
  deleteStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  getStaffByPosition,
  addSampleImage,
  getSampleImage,
  deleteImages
} from "../controller/StaffController.js";
import { verifyAdmin, verifyUser } from "../utils/verifyToken.js";

router.get("/", getAllStaff);
router.get("/:id", getStaffById);
router.get("/position/:positionId", getStaffByPosition);
router.post("/", createStaff);
router.put("/:id", updateStaff);
router.delete("/:id", deleteStaff);
router.post("/:id/addSampleImage", express.raw({ type: "application/octet-stream", limit: "10mb" }), addSampleImage);
router.delete("/:id/deleteImages", deleteImages); // Xóa ảnh mẫu
router.get("/:id/sample-images", getSampleImage);

export default router;
