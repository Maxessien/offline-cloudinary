import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

class OfflineCloudinary {
  constructor() {
    if (!process.env.CLOUDINARY_OFFLINE_PATH) {
      throw new Error("Please set CLOUDINARY_OFFLINE_PATH in your .env file");
    }
    this.rootPath = process.env.CLOUDINARY_OFFLINE_PATH;
  }

  /**
   * Upload a file
   * @param {string} tempFilePath - Path to the temporary file
   * @param {object} options - { folder: 'nested/folder/path' }
   * @returns Cloudinary-like response
   */
  async upload(tempFilePath, options = {}) {
    const portNumber = process.env.CLOUDINARY_OFFLINE_PORT;
    if (!portNumber)
      throw new Error("Please set CLOUDINARY_OFFLINE_PORT in your .env file");
    await fs.access(tempFilePath).catch(() => {
      throw new Error(`File not found: ${tempFilePath}`);
    });
    const folder = options.folder || "";
    const name = options?.fileName || crypto.randomUUID();
    const fullFolderPath = path.join(this.rootPath, folder);

    // Ensure folder exists
    await fs.mkdir(fullFolderPath, { recursive: true });

    // Generate unique filename
    const ext = path.extname(tempFilePath);
    if (!ext?.trim()) throw new Error("Unsupported file type");
    const fileName = name + ext;

    const finalPath = path.join(fullFolderPath, fileName);

    // Copy file from temp path
    await fs.copyFile(tempFilePath, finalPath);

    // Get file stats
    const stats = await fs.stat(finalPath);

    const now = new Date().toISOString();

    const uploadId = crypto.randomUUID();

    const data = await fs.readFile("uploads.json", "utf-8");

    const mappings = JSON.parse(data);
    mappings[uploadId] = finalPath;

    await fs.writeFile("uploads.json", JSON.stringify(mappings));

    // Return Cloudinary-like response
    return {
      asset_id: crypto.randomUUID(),
      public_id: uploadId,
      version: Date.now(),
      version_id: crypto.randomUUID(),
      signature: crypto.randomBytes(16).toString("hex"),
      width: null,
      height: null,
      format: ext.replace(".", ""),
      resource_type: "image",
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
   * @param {string} public_id
   * @returns {object} { result: "ok" } if deleted or { result: "not found" }
   */
  async destroy(public_id) {
    const uploadId = public_id;
    const data = await fs.readFile("uploads.json", "utf-8");
    const mappings = JSON.parse(data);
    await fs.unlink(mappings[uploadId]);
    return { result: "ok" };
  }

  /**
   * Destroy every files and folder in the local offline cloudinary storage
   * @returns {object} {result: ok} if successful
   */
  async clearStorage() {
    await fs.rm(this.rootPath, { recursive: true, force: true });
    await fs.mkdir(this.rootPath);
    return { result: "ok" };
  }
}

const offlineCloudinary = new OfflineCloudinary();

export default offlineCloudinary;
