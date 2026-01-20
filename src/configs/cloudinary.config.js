import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFileToCloudinary = async (files, folderName = "default") => {
  try {
    // Determine the environment-specific base folder
    const env = process.env.NODE_ENV || "development";
    const envFolder = env === "production" ? "prod" : "dev";
    // Ensure files is always an array for uniform processing
    const fileArray = Array.isArray(files) ? files : [files];

    // Map each file to the upload function
    const uploadPromises = fileArray.map((file) =>
      cloudinary.uploader.upload(file.path, {
        folder: `BWC/${envFolder}/${folderName}`,
        resource_type: "auto",
        chunk_size: 6000000,
      })
    );

    const uploadResults = await Promise.all(uploadPromises);

    return uploadResults.map((result) => ({
      // [{}]-> for one file, [{},{}]=> for multiple file
      secure_url: result.secure_url,
      public_id: result.public_id,
    }));
  } catch (error) {
    throw new Error(`File upload failed: ${error.message}`);
  }
};

export const deleteFileFromCloudinary = async (files) => {
  const publicIds = Array.isArray(files)
    ? files.map((file) => file.public_id)
    : [files.public_id];

  try {
    // Delete multiple files from Cloudinary using async/await
    const deleteResults = await Promise.all(
      publicIds.map(async (publicId) => {
        try {
          const result = await cloudinary.uploader.destroy(publicId);
          console.log(
            `File with public_id ${publicId} deleted from Cloudinary`
          );
          return { publicId, result };
        } catch (error) {
          console.error(
            `Error deleting file with public_id: ${publicId}:`,
            error
          );
          return { publicId, error: error.message || "Deletion failed" };
        }
      })
    );
    // Check if there were any errors
    const failedDeletes = deleteResults.filter((res) => res.error); // response when deletion failed = {"result": "", "error": {}}
    if (failedDeletes.length > 0) {
      console.log("Failded deletes Response: ", failedDeletes);
      return {
        success: false,
        message: "Some files failed to delete",
        failedDeletes,
      };
    }

    return { success: true, result: deleteResults };
  } catch (error) {
    console.error("Error during Cloudinary deletion process:", error);
    return {
      success: false,
      message: "Error during Cloudinary deletion",
      error: error.message,
    };
  }
};

export default cloudinary;
