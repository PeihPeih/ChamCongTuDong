import mongoose from "mongoose"; // MongoDB

const ImageSchema = new mongoose.Schema({
    staffId: {
      type: Number, // Match with MySQL Staff ID
      required: true,
    },
    imagePaths: { type: [String], default: [] },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  });

  const Image = mongoose.model("Image", ImageSchema);
  export default Image;