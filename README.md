# Offline Cloudinary

An **offline Cloudinary-like file manager** for Node.js — designed for developers who need a simple, local alternative to Cloudinary for uploads, deletions, and testing without internet access.

---

## Features

- Local file uploads and deletions with HTTP server emulator
- Cloudinary-style API responses  
- Simple environment-based configuration  
- Built-in Express server to serve uploaded files via HTTP
- Clear all stored uploads with one command  
- Perfect for testing, prototyping, or offline development  

---

## Installation

```bash
npm install offline-cloudinary
```

or with Yarn:

```bash
yarn add offline-cloudinary
```

---

## Setup

In your project's `.env` file, define the configuration for offline uploads:

```env
CLOUDINARY_OFFLINE_PATH=./offline_uploads
CLOUDINARY_OFFLINE_PORT=3000
```

- **`CLOUDINARY_OFFLINE_PATH`**: Base directory where uploaded files will be stored
- **`CLOUDINARY_OFFLINE_PORT`**: Port number for the HTTP server emulator

---

## Quick Start

```js
import { startEmulator, offlineCloudinary } from "offline-cloudinary";

// Start the HTTP server to serve uploaded files
startEmulator();

(async () => {
  try {
    // Upload a file
    const uploadResult = await offlineCloudinary.upload("./temp/photo.jpg", {
      folder: "users/avatars",
      fileName: "max-essien"
    });

    console.log("Upload result:", uploadResult);
    // uploadResult.url: "http://localhost:3000/file/{uuid}"
    // uploadResult.public_id: UUID identifier

    // Access the file via HTTP
    console.log(`View file at: ${uploadResult.url}`);

    // Delete the uploaded file
    const deleteResult = await offlineCloudinary.destroy(uploadResult.public_id);
    console.log("Delete result:", deleteResult);

    // Clear all files in the storage folder
    const clearResult = await offlineCloudinary.clearStorage();
    console.log("Storage cleared:", clearResult);
  } catch (err) {
    console.error("Error:", err.message);
  }
})();
```

---

## API Reference

### **`startEmulator()`**

Starts the Express HTTP server to serve uploaded files.

**Important**: Must be called to enable HTTP access to uploaded files via the `url` field.

**Environment Variables Required:**
- `CLOUDINARY_OFFLINE_PORT` - Port number for the server

**Example:**
```js
import { startEmulator } from "offline-cloudinary";

startEmulator();
// Server running on port specified in CLOUDINARY_OFFLINE_PORT
```

---

### **`offlineCloudinary`**

The main instance for file operations. Automatically instantiated when imported.  
Throws an error if `CLOUDINARY_OFFLINE_PATH` is not set.

---

### **`offlineCloudinary.upload(tempFilePath, options)`**

Uploads a file from a temporary path to your offline storage.

**Environment Variables Required:**
- `CLOUDINARY_OFFLINE_PORT` - Used to generate the HTTP URL

**Parameters**
| Name | Type | Description |
|------|------|--------------|
| `tempFilePath` | `string` | Path to the source file to upload |
| `options.folder` | `string` | Optional nested folder path |
| `options.fileName` | `string` | Optional custom file name (without extension) |

**Returns**

A Cloudinary-like object containing:
```js
{
  asset_id: "uuid-v4",
  public_id: "uuid-v4",           // UUID identifier for this file
  version: 1702654321000,          // Timestamp
  version_id: "uuid-v4",
  signature: "hex-string",
  width: null,
  height: null,
  format: "jpg",                   // File extension
  resource_type: "image",
  created_at: "2025-12-15T10:30:00.000Z",
  tags: [],
  pages: 1,
  bytes: 102400,                   // File size in bytes
  type: "upload",
  etag: "hex-string",
  placeholder: false,
  url: "http://localhost:3000/file/{uuid}",      // HTTP URL to access file
  secure_url: "/path/to/actual/file.jpg"         // Actual file system path
}
```

**Example:**
```js
const result = await offlineCloudinary.upload("./photo.jpg", {
  folder: "users/avatars",
  fileName: "profile-pic"
});

console.log(result.url);        // "http://localhost:3000/file/abc123..."
console.log(result.public_id);  // "abc123-def456-789..."
```

---

### **`offlineCloudinary.destroy(public_id)`**

Deletes a file from your offline storage using its UUID.

**Parameters**
| Name | Type | Description |
|------|------|--------------|
| `public_id` | `string` | UUID returned by the upload method |

**Returns**
```js
{ result: "ok" }
```

**Example:**
```js
const uploadResult = await offlineCloudinary.upload("./photo.jpg");
await offlineCloudinary.destroy(uploadResult.public_id);
```

---

### **`offlineCloudinary.clearStorage()`**

Deletes all files and folders in your offline Cloudinary storage.

**Returns**
```js
{ result: "ok" }
```

**Example:**
```js
await offlineCloudinary.clearStorage();
console.log("All files deleted");
```

---

## Example .env

```env
CLOUDINARY_OFFLINE_PATH=./uploads
CLOUDINARY_OFFLINE_PORT=3000
```

---

## Example Folder Structure

```
project/
├── .env
├── uploads.json                    # Auto-generated UUID mapping
├── uploads/
│   └── users/
│       └── avatars/
│           └── max-essien.jpg
└── index.js
```

---

## Migration from v1.x to v2.x

### Breaking Changes

1. **New environment variable required**: `CLOUDINARY_OFFLINE_PORT`
2. **Import changed**: Now exports `{ startEmulator, offlineCloudinary }` instead of default export
3. **public_id format**: Now returns UUID instead of file path
4. **URL field**: Now returns HTTP endpoint instead of file path
5. **Must call startEmulator()** to serve files via HTTP

### Migration Steps

**Before (v1.x):**
```js
import offlineCloudinary from "offline-cloudinary";

const result = await offlineCloudinary.upload("./photo.jpg");
// result.public_id was a file path
```

**After (v2.x):**
```js
import { startEmulator, offlineCloudinary } from "offline-cloudinary";

// Add CLOUDINARY_OFFLINE_PORT=3000 to your .env

startEmulator(); // Start the HTTP server

const result = await offlineCloudinary.upload("./photo.jpg");
// result.public_id is now a UUID
// result.url is "http://localhost:3000/file/{uuid}"
// result.secure_url is "http://localhost:3000/file/{uuid}"
```

---

## Author

**Max Essien**  
📍 Lagos, Nigeria  
🔗 [GitHub: @MaxEssien](https://github.com/MaxEssien)

---

## License

This project is licensed under the **MIT License** — free for personal and commercial use.

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and migration guides.

---

**Offline Cloudinary** — your Cloudinary, anywhere, even offline.

