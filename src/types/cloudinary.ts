export type ResourceType = "image" | "video" | "raw" | "auto";

export interface UploadOptions {
  // Naming and storage
  public_id?: string;
  public_id_prefix?: string;
  display_name?: string;
  asset_folder?: string;
  use_asset_folder_as_public_id_prefix?: boolean;
  folder?: string;
  use_filename?: boolean;
  use_filename_as_display_name?: boolean;
  unique_filename?: boolean;
  filename_override?: string;
  resource_type?: ResourceType;
  type?: string;
  fileName?: string; // Custom field for offline use

  // Metadata
  tags?: string[] | string;
  context?: Record<string, string> | string;
  metadata?: Record<string, unknown> | string;
  clear_invalid?: boolean;

  // Delivery and access control
  access_control?: Array<{
    access_type: "token" | "anonymous";
    start?: string;
    end?: string;
  }>;
  access_mode?: "public" | "authenticated";
  discard_original_filename?: boolean;
  overwrite?: boolean;

  // Analysis and detection
  colors?: boolean;
  faces?: boolean;
  quality_analysis?: boolean;
  accessibility_analysis?: boolean;
  cinemagraph_analysis?: boolean;
  media_metadata?: boolean;
  image_metadata?: boolean;
  phash?: boolean;
  responsive_breakpoints?: Array<{
    create_derived: boolean;
    bytes_step?: number;
    min_width?: number;
    max_width?: number;
    format?: string;
    transformation?: string;
  }>;

  // AI and tagging
  auto_tagging?: number;
  categorization?: string;
  detection?: string;
  ocr?: string;
  visual_search?: boolean;

  // Video specific
  auto_chaptering?: boolean;
  auto_transcription?:
    | boolean
    | { original_language?: string; translate?: string[] };
  auto_video_details?: boolean;

  // Manipulations and transformations
  eager?: string[] | string;
  eager_async?: boolean;
  eager_notification_url?: string;
  transformation?: string | Record<string, unknown>;
  format?: string;
  face_coordinates?: string | Array<[number, number, number, number]>;
  custom_coordinates?: string | number[];
  regions?: Record<string, number[][]>;

  // Background and processing
  background_removal?: "cloudinary_ai" | "pixelz";
  raw_convert?: "aspose" | "google_speech" | "extract_text";

  // Additional options
  allowed_formats?: string[] | string;
  async?: boolean;
  backup?: boolean;
  callback?: string;
  eval?: string;
  on_success?: string;
  headers?: string;
  invalidate?: boolean;
  moderation?: string;
  notification_url?: string;
  proxy?: string;
  return_delete_token?: boolean;
  timeout?: number;
}

export interface CloudinaryResponse {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: null | number;
  height: null | number;
  format: string;
  resource_type: ResourceType;
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

export interface DestroyResponse {
  result: "ok" | "not found";
}

export interface MappingsInMemory {
  uploads: { [key: string]: string | boolean };
  isDirty: boolean;
}
