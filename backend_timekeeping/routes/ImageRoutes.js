import express from "express";
const router = express.Router();

import { getImage } from "../controller/imageController.js";

router.get("/*", getImage);

export default router;
