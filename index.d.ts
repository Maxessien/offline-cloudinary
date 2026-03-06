export interface CloudinaryUploadResponse {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: null | number;
  height: null | number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  pages: number;
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
}

export interface OfflineCloudinary {
  initialise(): Promise<void>;
  syncToDisk(): Promise<void>;
  upload(
    temporaryFilePath: string,
    options?: { fileName?: string; folder?: string },
  ): Promise<CloudinaryUploadResponse>;
  destroy(publicId: string): Promise<{ result: "ok" }>;
  clearStorage(): Promise<{ result: "ok" }>;
}

export const startEmulator: () => Promise<void>;

export const offlineCloudinary: OfflineCloudinary;
