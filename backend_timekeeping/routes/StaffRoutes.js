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
  getSampleImage
} from "../controller/StaffController.js";
import { verifyAdmin, verifyUser } from "../utils/verifyToken.js";

router.get("/", getAllStaff);
router.get("/:id", getStaffById);
router.get("/position/:positionId", getStaffByPosition);
router.post("/", createStaff);
router.put("/:id", updateStaff);
router.delete("/:id", deleteStaff);
router.post("/:id/addSampleImage", addSampleImage);
router.get("/:id/sample-images", getSampleImage);

export default router;
