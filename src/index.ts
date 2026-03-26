import cors from "cors";
import express from "express";
import type { Express } from "express";
import fileRoutes from "./routes/fileRoutes.js";
import offlineCloudinary from "./utils/offline-cloudinary.js";

const app: Express = express();

app.use(cors());

app.use("/file", fileRoutes);

const startEmulator = async (): Promise<void> => {
  const portNumber = process.env.CLOUDINARY_OFFLINE_PORT;
  if (!portNumber)
    throw new Error("Please set CLOUDINARY_OFFLINE_PORT in your .env file");
  await offlineCloudinary.initialise();
  app.listen(portNumber, () => {
    console.log("Offline Cloudinary running on port", portNumber);
    process.on("SIGINT", () => {
      if (offlineCloudinary.syncActive) clearInterval(offlineCloudinary.syncActive);
      offlineCloudinary.syncToDisk().then(()=>{
        console.log("Sync successful, Exiting...")
        process.exit(0)
      }).catch(()=>{
        console.log("Sync incomplete")
        process.exit(1)
      })
    });
  });
};

export { offlineCloudinary, startEmulator };

