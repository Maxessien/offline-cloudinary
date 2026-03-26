import type { Request, Response } from "express";
import offlineCloudinary from "../utils/offline-cloudinary.js";

export const viewImage = async (req: Request, res: Response): Promise<void> => {
  const uploadId = req.params.id;
  const mappings = offlineCloudinary.mappingsInMemory;
  res.setHeader("Content-Disposition", "inline");
  res.sendFile(`${mappings[uploadId as string]}`);
};
