import mongoose from "mongoose";
const dbConnect = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}`);
    console.log("Database is connected Successfully");
  } catch (error) {
    console.log("Database is not connected:", error);
    process.exit(1);
  }
};
export default dbConnect;
