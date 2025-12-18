import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

class OfflineCloudinary {
  constructor() {
    if (!process.env.CLOUDINARY_OFFLINE_PATH) {
      throw new Error("Please set CLOUDINARY_OFFLINE_PATH in your .env file");
    }
    this.rootPath = process.env.CLOUDINARY_OFFLINE_PATH;
    this.initialised = false;
    this.mappingsInMemory = { isDirty: false };
    this.syncActive = false;
  }

  async initialise() {
    if (this.initialised) return;
    const filePath = path.join(this.rootPath, "uploads.json");
    await fs.access(filePath).catch(() => fs.writeFile(filePath, "{}"));
    const data = await fs.readFile(filePath, "utf-8");
    this.mappingsInMemory = { ...JSON.parse(data), isDirty: false };
    this.initialised = true;
    this.syncActive = setInterval(() => this.syncToDisk(), 500);
  }

  async syncToDisk() {
    if (!this.mappingsInMemory.isDirty) return;
    const mappingsCopy = { ...this.mappingsInMemory, isDirty: false };
    await fs.writeFile(
      path.join(this.rootPath, "uploads.json"),
      JSON.stringify(mappingsCopy)
    );
    this.mappingsInMemory.isDirty = false;
  }

  /**
   * Upload a file
   * @param {string} tempFilePath - Path to the temporary file
   * @param {object} options - { folder: 'nested/folder/path' }
   * @returns Cloudinary-like response
   */
  async upload(tempFilePath, options = {}) {
    await this.initialise();
    const portNumber = process.env.CLOUDINARY_OFFLINE_PORT || 3500;
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

    this.mappingsInMemory[uploadId] = finalPath;
    this.mappingsInMemory.isDirty = true;

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
    await this.initialise();
    const uploadId = public_id;
    const filePath = this.mappingsInMemory[uploadId];
    if (filePath) {
      await fs.unlink(filePath);
      delete this.mappingsInMemory[uploadId];
      this.mappingsInMemory.isDirty = true;
    }
    return { result: "ok" };
  }

  /**
   * Destroy every files and folder in the local offline cloudinary storage
   * @returns {object} {result: ok} if successful
   */
  async clearStorage() {
    await fs.rm(this.rootPath, { recursive: true, force: true });
    await fs.mkdir(this.rootPath);
    this.mappingsInMemory = { isDirty: false };
    return { result: "ok" };
  }
}

const offlineCloudinary = new OfflineCloudinary();

export default offlineCloudinary;
