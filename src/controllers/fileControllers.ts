import type { Request, Response } from "express";
import offlineCloudinary from "../utils/offline-cloudinary.js";
import { existsSync } from "fs";

export const viewImage = async (req: Request, res: Response)=> {
  const uploadId = req.params.id;
  const mappings = offlineCloudinary.mappingsInMemory;
  const filePath = mappings.uploads[uploadId as string];
  if (typeof filePath !== "string" || !existsSync(filePath)) {
    return res.status(404).json({error: "File not found"});
  }
  res.setHeader("Content-Disposition", "inline");
  res.sendFile(`${mappings.uploads[uploadId as string]}`);
};
