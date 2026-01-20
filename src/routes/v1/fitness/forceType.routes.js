import express from "express";
import {
  createForceType,
  getAllForceTypes,
  getForceTypeById,
  updateForceType,
  deleteForceType,
} from "../../../controllers/v1/fitness/forceType.controller.js";

const router = express.Router();

router.post("/", createForceType);
router.get("/", getAllForceTypes);
router.get("/:id", getForceTypeById);
router.put("/:id", updateForceType);
router.delete("/:id", deleteForceType);

export default router;
