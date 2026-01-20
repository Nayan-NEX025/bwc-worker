import express from "express";
import {
  createMachine,
  getAllMachines,
  getMachineById,
  updateMachine,
  deleteMachine,
} from "../../../controllers/v1/fitness/machine.controller.js";

const router = express.Router();

router.post("/", createMachine);
router.get("/", getAllMachines);
router.get("/:id", getMachineById);
router.put("/:id", updateMachine);
router.delete("/:id", deleteMachine);

export default router;
