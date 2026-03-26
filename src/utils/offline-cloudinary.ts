import crypto from "crypto";
import { existsSync } from "fs";
import fs from "fs/promises";
import {} from "file-type";
import path from "path";

import type {
  CloudinaryResponse,
  DestroyResponse,
  MappingsInMemory,
  ResourceType,
  UploadOptions,
} from "../types/cloudinary.js";
import { checkFileValidity, getFileInfo } from "./fileHandlers.js";
import { fileTypeFromFile } from "file-type";

class OfflineCloudinary {
  rootPath: string;
  initialised: boolean;
  mappingsInMemory: MappingsInMemory;
  syncActive: NodeJS.Timeout | false;

  constructor() {
    if (!process.env.CLOUDINARY_OFFLINE_PATH) {
      throw new Error("Please set CLOUDINARY_OFFLINE_PATH in your .env file");
    }
    this.rootPath = process.env.CLOUDINARY_OFFLINE_PATH;
    this.initialised = false;
    this.mappingsInMemory = { isDirty: false, uploads: {} };
    this.syncActive = false;
  }

  async initialise(): Promise<void> {
    if (this.initialised) return;
    await fs.mkdir(this.rootPath, { recursive: true });
    const filePath = path.join(this.rootPath, "uploads.json");
    await fs.access(filePath).catch(() => fs.writeFile(filePath, "{}"));
    const data = await fs.readFile(filePath, "utf-8");
    this.mappingsInMemory = { ...JSON.parse(data), isDirty: false };
    this.initialised = true;
    this.syncActive = setInterval(() => this.syncToDisk(), 500);
  }

  async syncToDisk(): Promise<void> {
    if (!this.mappingsInMemory.isDirty) return;
    const mappingsCopy = { ...this.mappingsInMemory, isDirty: false };
    const tempPath = path.join(this.rootPath, "uploads.json.tmp");
    const originalPath = path.join(this.rootPath, "uploads.json");
    await fs.writeFile(tempPath, JSON.stringify(mappingsCopy));
    await fs.rename(tempPath, originalPath);
    this.mappingsInMemory.isDirty = false;
  }

  /**
   * Upload a file
   * @param tempFilePath - Path to the temporary file
   * @param options - { folder: 'nested/folder/path' }
   * @returns Cloudinary-like response
   */
  async upload(
    tempFilePath: string,
    options: UploadOptions,
  ): Promise<CloudinaryResponse> {
    const portNumber = process.env.CLOUDINARY_OFFLINE_PORT || 3500;
    await fs.access(tempFilePath).catch(() => {
      throw new Error(`File not found: ${tempFilePath}`);
    });
    const resourceTypeCleaned: ResourceType = options.resource_type || "image";
    const isValid = await checkFileValidity(tempFilePath, resourceTypeCleaned);
    if (!isValid) throw new Error("Invalid resource type");
    const folder = options.folder || "";
    const name = options?.fileName || crypto.randomUUID();
    const fullFolderPath = path.join(this.rootPath, folder);

    // Ensure folder exists
    await fs.mkdir(fullFolderPath, { recursive: true });

    // Generate unique filename
    const ext = path.extname(tempFilePath);
    const fileType = await fileTypeFromFile(tempFilePath);
    if (!ext?.trim() || !fileType?.ext)
      throw new Error("Unsupported file type");
    const fileName = name + ext;

    const finalPath = path.join(fullFolderPath, fileName);

    // Copy file from temp path
    await fs.copyFile(tempFilePath, finalPath);

    // Get file stats
    const stats = await fs.stat(finalPath);

    const now = new Date().toISOString();

    const uploadId = crypto.randomUUID();

    this.mappingsInMemory.uploads[uploadId] = finalPath;
    this.mappingsInMemory.isDirty = true;

    const info = await getFileInfo(finalPath);

    // Return Cloudinary-like response
    return {
      asset_id: crypto.randomUUID(),
      public_id: uploadId,
      version: Date.now(),
      version_id: crypto.randomUUID(),
      signature: crypto.randomBytes(16).toString("hex"),
      width: info.streams?.[0]?.width || null,
      height: info.streams?.[0]?.height || null,
      format: fileType?.ext ?? ext.replace(".", ""),
      resource_type:
        resourceTypeCleaned !== "auto"
          ? resourceTypeCleaned
          : ["image", "video"].includes(
                fileType?.mime.split("/")?.[0] ?? "not exist",
              )
            ? (fileType?.mime.split("/")?.[0] as "image" | "video")
            : resourceTypeCleaned,
      created_at: now,
      tags: [],
      pages: 1,
      bytes: stats.size,
      type: "upload",
      etag: crypto.randomBytes(8).toString("hex"),
      placeholder: false,
      url: `http://localhost:${portNumber}/file/${uploadId}`,
      secure_url: `http://localhost:${portNumber}/file/${uploadId}`,
    };
  }

  /**
   * Destroy a file by public_id
   * @param public_id - The public ID of the file to delete
   */
  async destroy(public_id: string): Promise<DestroyResponse> {
    const uploadId = public_id;
    const filePath = this.mappingsInMemory.uploads[uploadId];
    if (!filePath?.trim()) return { result: "not found" };
    if (!existsSync(filePath)) return { result: "not found" };
    if (filePath && existsSync(filePath)) {
      await fs.unlink(filePath);
      delete this.mappingsInMemory.uploads[uploadId];
      this.mappingsInMemory.isDirty = true;
    }
    return { result: "ok" };
  }

  /**
   * Destroy every files and folder in the local offline cloudinary storage
   * @returns {result: ok} if successful
   */
  async clearStorage(): Promise<{ result: string }> {
    await fs.rm(this.rootPath, { recursive: true, force: true });
    await fs.mkdir(this.rootPath);
    this.mappingsInMemory = { ...this.mappingsInMemory, isDirty: false };
    return { result: "ok" };
  }
}

const offlineCloudinary = new OfflineCloudinary();

export default offlineCloudinary;
