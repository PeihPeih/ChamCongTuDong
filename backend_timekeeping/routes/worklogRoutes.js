import express from "express";
const router = express.Router();
import { getWorklogsByStaffId } from "../controller/worklogController.js";
import { verifyToken } from "../utils/verifyToken.js";

// Get worklogs by staff ID with optional year and month filtering
router.get("/staff/:staffId", getWorklogsByStaffId);

export default router; 