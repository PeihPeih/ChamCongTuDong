import express from "express";
const router = express.Router();
import {
  createTimekeeping,
  deleteTimekeeping,
  getAllTimekeeping,
  getTimekeepingById,
  updateTimekeeping,
  getTimekeepingByStaff,
} from "../controller/timekeepingController.js";

router.get("/", getAllTimekeeping);
router.get("/:id", getTimekeepingById);
router.get("/staff/:staffId", getTimekeepingByStaff);
router.post("/", createTimekeeping);
router.put("/:id", updateTimekeeping);
router.delete("/:id", deleteTimekeeping);

export default router;
