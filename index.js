import express from "express";
import fileRoutes from "./src/routes/fileRoutes.js";
import offlineCloudinary from "./src/utils/offline-cloudinary";
import cors from "cors";

const app = express();

app.use(cors());

app.use("/file", fileRoutes);

const startEmulator = () => {
  const portNumber = process.env.CLOUDINARY_OFFLINE_PORT;
  if (!portNumber)
    throw new Error("Please set CLOUDINARY_OFFLINE_PORT in your .env file");
  app.listen(portNumber, () =>
    console.log("Offline Cloudinary running on port", portNumber)
  );
};

export { startEmulator, offlineCloudinary };
