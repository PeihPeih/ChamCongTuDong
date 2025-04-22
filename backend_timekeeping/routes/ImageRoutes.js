import express from "express";
const router = express.Router();

import { getImage, getAllImageAndStaffInfo } from "../controller/imageController.js";

router.get("/get-all", getAllImageAndStaffInfo);

router.get("/*", getImage);

export default router;
