import express from "express";
const router = express.Router();
import {
  createDayOff,
  deleteDayOff,
  getAllDayOffs,
  getDayOffById,
  updateDayOff,
} from "../controller/DayoffController.js";
import { verifyAdmin, verifyUser } from "../utils/verifyToken.js";

router.get("/", getAllDayOffs);
router.get("/:id", getDayOffById);
router.post("/", createDayOff);
router.put("/:id", updateDayOff);
router.delete("/:id", deleteDayOff);

export default router;
