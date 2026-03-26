import ffprobe from "ffprobe";
import ffprobeStatic from "ffprobe-static";
import { fileTypeFromFile } from "file-type";
import type { ResourceType } from "../types/cloudinary.js";

const getFileInfo = async (filePath: string) => {
  try {
    return await ffprobe(filePath, { path: ffprobeStatic.path });
  } catch (error) {
    throw new Error(
      `Failed to probe file: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

const checkFileValidity = async (
  filePath: string,
  expectedType: ResourceType,
) => {
  const file = await fileTypeFromFile(filePath);
  const type = file?.mime.split("/")?.[0];

  const valid =
    type === expectedType || expectedType === "raw" || expectedType === "auto";

  return valid;
};

export { getFileInfo, checkFileValidity };
