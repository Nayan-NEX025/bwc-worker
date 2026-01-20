import mongoose from "mongoose";
import cloudinary, {
  deleteFileFromCloudinary,
  uploadFileToCloudinary,
} from "../../../configs/cloudinary.config.js";
import { Equipment } from "../../../models/fitness/equipment.model.js";

// Create Equipment
const createEquipment = async (req, res) => {
  try {
    const { equipmentName } = req.body;
    const thumbImage = req.file;

    // Validate required fields
    if (!equipmentName) {
      return res.status(400).json({ message: "equipmentName is required" });
    }

    // Check if equipment name already exists
    const existingEquipment = await Equipment.findOne({
      equipmentName: { $regex: new RegExp(`^${equipmentName}$`, "i") },
    });
    if (existingEquipment) {
      return res.status(409).json({ message: "Equipment name already exists" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "targetEquipmentImage is required" });
    }
    let thumbImageResponse = null;
    if (thumbImage) {
      thumbImageResponse = await uploadFileToCloudinary(
        thumbImage,
        "Equipment"
      ); // Res-> [{}]
    }
    const equipment = await Equipment.create({
      equipmentName,
      targetEquipmentImage:
        (thumbImageResponse && thumbImageResponse[0]) || null,
    });

    return res.status(201).json({
      message: "Equipment created successfully",
      data: equipment,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create equipment",
      error: error.message,
    });
  }
};

// Get All Equipment
const getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find().sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Equipment retrieved successfully",
      data: equipment.map((item) => ({
        id: item._id,
        equipmentName: item.equipmentName,
        targetEquipmentImage: item.targetEquipmentImage,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve equipment", error: error.message });
  }
};

// Get Equipment by ID
const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid equipment ID format" });
    }

    const equipment = await Equipment.findById(id);

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    return res.status(200).json({
      message: "Equipment retrieved successfully",
      data: {
        id: equipment._id,
        equipmentName: equipment.equipmentName,
        targetEquipmentImage: equipment.targetEquipmentImage,
        createdAt: equipment.createdAt,
        updatedAt: equipment.updatedAt,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve equipment", error: error.message });
  }
};

// Update Equipment
const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const equipmentName = req.body?.equipmentName;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid equipment ID format" });
    }

    const updateData = {};

    // Check if equipment name already exists (excluding current equipment)
    if (equipmentName && equipmentName.trim()) {
      const existingEquipment = await Equipment.findOne({
        equipmentName: { $regex: new RegExp(`^${equipmentName.trim()}$`, "i") },
        _id: { $ne: id },
      });
      if (existingEquipment) {
        return res
          .status(409)
          .json({ message: "Equipment name already exists" });
      }
      updateData.equipmentName = equipmentName.trim();
    }

    if (req.file) {
      const targetResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "equipment/target",
        resource_type: "image",
      });
      updateData.targetEquipmentImage = targetResult.secure_url;
    }

    const equipment = await Equipment.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    return res.status(200).json({
      message: "Equipment updated successfully",
      data: {
        id: equipment._id,
        equipmentName: equipment.equipmentName,
        targetEquipmentImage: equipment.targetEquipmentImage,
        createdAt: equipment.createdAt,
        updatedAt: equipment.updatedAt,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update equipment", error: error.message });
  }
};

// Delete Equipment
const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid equipment ID format" });
    }

    const equipment = await Equipment.findByIdAndDelete(id);

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    if (equipment?.targetEquipmentImage)
      await deleteFileFromCloudinary(equipment?.targetEquipmentImage);
    return res.status(200).json({
      message: "Equipment deleted successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to delete equipment", error: error.message });
  }
};

export {
  createEquipment,
  getAllEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
};
