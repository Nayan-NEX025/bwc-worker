import express from "express";

import upload from "../../../middleware/multer.js";
import {
  createEquipment,
  deleteEquipment,
  getAllEquipment,
  getEquipmentById,
  updateEquipment,
} from "../../../controllers/v1/fitness/equipment.controller.js";

const router = express.Router();

router.post("/", upload.single("targetEquipmentImage"), createEquipment);
router.get("/", getAllEquipment);
router.get("/:id", getEquipmentById);
router.put("/:id", upload.single("targetEquipmentImage"), updateEquipment);
router.delete("/:id", deleteEquipment);

export default router;
