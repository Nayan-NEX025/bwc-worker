import mongoose from "mongoose";
import ForceType from "../../../models/fitness/forceType.model.js";

// Create Force Type
const createForceType = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    // Check if force type name already exists (case-insensitive)
    const existingForceType = await ForceType.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingForceType) {
      return res.status(409).json({ message: "Force type name already exists" });
    }

    const forceType = await ForceType.create({ name });

    return res.status(201).json({
      message: "Force type created successfully",
      data: {
        id: forceType._id,
        name: forceType.name,
        createdAt: forceType.createdAt,
        updatedAt: forceType.updatedAt
      }
    });

  } catch (error) {
    return res.status(500).json({ 
      message: "Failed to create force type", 
      error: error.message 
    });
  }
};

// Get All Force Types
const getAllForceTypes = async (req, res) => {
  try {
    const forceTypes = await ForceType.find().sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Force types retrieved successfully",
      data: forceTypes.map(forceType => ({
        id: forceType._id,
        name: forceType.name,
        createdAt: forceType.createdAt,
        updatedAt: forceType.updatedAt
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve force types", error: error.message });
  }
};

// Get Force Type by ID
const getForceTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid force type ID format" });
    }

    const forceType = await ForceType.findById(id);

    if (!forceType) {
      return res.status(404).json({ message: "Force type not found" });
    }

    return res.status(200).json({
      message: "Force type retrieved successfully",
      data: {
        id: forceType._id,
        name: forceType.name,
        createdAt: forceType.createdAt,
        updatedAt: forceType.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve force type", error: error.message });
  }
};

// Update Force Type
const updateForceType = async (req, res) => {
  try {
    const { id } = req.params;
    const forceTypeName = req.body?.name;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid force type ID format" });
    }

    const updateData = {};

    // Check if force type name already exists (excluding current force type)
    if (forceTypeName && forceTypeName.trim()) {
      const existingForceType = await ForceType.findOne({ 
        name: { $regex: new RegExp(`^${forceTypeName.trim()}$`, 'i') },
        _id: { $ne: id }
      });
      if (existingForceType) {
        return res.status(409).json({ message: "Force type name already exists" });
      }
      updateData.name = forceTypeName.trim();
    }

    const forceType = await ForceType.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!forceType) {
      return res.status(404).json({ message: "Force type not found" });
    }

    return res.status(200).json({
      message: "Force type updated successfully",
      data: {
        id: forceType._id,
        name: forceType.name,
        createdAt: forceType.createdAt,
        updatedAt: forceType.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update force type", error: error.message });
  }
};

// Delete Force Type
const deleteForceType = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid force type ID format" });
    }

    const forceType = await ForceType.findByIdAndDelete(id);

    if (!forceType) {
      return res.status(404).json({ message: "Force type not found" });
    }

    return res.status(200).json({
      message: "Force type deleted successfully",
      data: {
        id: forceType._id,
        name: forceType.name
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete force type", error: error.message });
  }
};

export { createForceType, getAllForceTypes, getForceTypeById, updateForceType, deleteForceType };