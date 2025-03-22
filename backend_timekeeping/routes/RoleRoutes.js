import express from "express";
const router = express.Router();
import {
  createRole,
  deleteRole,
  getAllRoles,
  getRoleById,
  updateRole,
  getRolesForDropdown
} from "../controller/roleController.js";

router.get("/", getAllRoles);
router.get("/dropdown", getRolesForDropdown);
router.get("/:id", getRoleById);
router.post("/", createRole);
router.put("/:id", updateRole);
router.delete("/:id", deleteRole);

export default router;
