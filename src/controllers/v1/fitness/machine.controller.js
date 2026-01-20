import mongoose from "mongoose";
import Machine from "../../../models/fitness/machine.model.js";

// Create Machine
const createMachine = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const machine = await Machine.create({ name });

    return res.status(201).json({
      message: "Machine created successfully",
      data: {
        id: machine._id,
        name: machine.name,
        createdAt: machine.createdAt,
        updatedAt: machine.updatedAt
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Machine name already exists" });
    }
    return res.status(500).json({ 
      message: "Failed to create machine", 
      error: error.message 
    });
  }
};

// Get All Machines
const getAllMachines = async (req, res) => {
  try {
    const machines = await Machine.find().sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Machines retrieved successfully",
      data: machines.map(machine => ({
        id: machine._id,
        name: machine.name,
        createdAt: machine.createdAt,
        updatedAt: machine.updatedAt
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve machines", error: error.message });
  }
};

// Get Machine by ID
const getMachineById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid machine ID format" });
    }

    const machine = await Machine.findById(id);

    if (!machine) {
      return res.status(404).json({ message: "Machine not found" });
    }

    return res.status(200).json({
      message: "Machine retrieved successfully",
      data: {
        id: machine._id,
        name: machine.name,
        createdAt: machine.createdAt,
        updatedAt: machine.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve machine", error: error.message });
  }
};

// Update Machine
const updateMachine = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid machine ID format" });
    }

    const machine = await Machine.findByIdAndUpdate(id, { name }, { new: true, runValidators: true });

    if (!machine) {
      return res.status(404).json({ message: "Machine not found" });
    }

    return res.status(200).json({
      message: "Machine updated successfully",
      data: {
        id: machine._id,
        name: machine.name,
        createdAt: machine.createdAt,
        updatedAt: machine.updatedAt
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Machine name already exists" });
    }
    return res.status(500).json({ message: "Failed to update machine", error: error.message });
  }
};

// Delete Machine
const deleteMachine = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid machine ID format" });
    }

    const machine = await Machine.findByIdAndDelete(id);

    if (!machine) {
      return res.status(404).json({ message: "Machine not found" });
    }

    return res.status(200).json({
      message: "Machine deleted successfully",
      data: {
        id: machine._id,
        name: machine.name
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete machine", error: error.message });
  }
};

export { createMachine, getAllMachines, getMachineById, updateMachine, deleteMachine };