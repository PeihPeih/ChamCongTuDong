import express from "express";
import multer from "multer";
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
  deleteImages,
  importStaffs,
} from "../controller/StaffController.js";
import { verifyAdmin, verifyUser } from "../utils/verifyToken.js";

// Cấu hình multer để lưu file tạm
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Thư mục lưu file tạm
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ hỗ trợ file Excel (.xlsx)"), false);
    }
  },
});

router.get("/", getAllStaff);
router.get("/:id", getStaffById);
router.get("/position/:positionId", getStaffByPosition);
router.post("/", createStaff);
router.put("/:id", updateStaff);
router.delete("/:id", deleteStaff);
router.post(
  "/:id/addSampleImage",
  express.raw({ type: "application/octet-stream", limit: "10mb" }),
  addSampleImage
);
router.delete("/:id/deleteImages", deleteImages); // Xóa ảnh mẫu
router.get("/:id/sample-images", getSampleImage);
router.post("/import", upload.single("file"), importStaffs); // Thêm route import

export default router;
