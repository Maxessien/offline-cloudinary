import cors from "cors";
import type { Express } from "express";
import express from "express";
import fileRoutes from "./routes/fileRoutes.js";
import offlineCloudinary from "./utils/offline-cloudinary.js";

const app: Express = express();

app.use(cors());

app.use("/file", fileRoutes);

const startEmulator = async (port?: number, offlineRootPath?: string): Promise<void> => {
  const portNumber = port || process.env.CLOUDINARY_OFFLINE_PORT;
  if (!portNumber)
    throw new Error(
      "Please set CLOUDINARY_OFFLINE_PORT in your .env file or pass a port parameter",
    );

  offlineCloudinary.setPort(Number(portNumber));

  if (offlineRootPath) offlineCloudinary.setRootPath(offlineRootPath)

  await offlineCloudinary.initialise();

  app.listen(portNumber, () => {
    console.log("Offline Cloudinary running on port", portNumber);

    process.on("SIGINT", () => {
      if (offlineCloudinary.syncActive)
        clearInterval(offlineCloudinary.syncActive);
      offlineCloudinary
        .syncToDisk()
        .then(() => {
          console.log("Sync successful, Exiting...");
          process.exit(0);
        })
        .catch(() => {
          console.log("Sync incomplete");
          process.exit(1);
        });
    });
  });
};

export { offlineCloudinary, startEmulator };
