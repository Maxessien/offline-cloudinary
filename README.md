# Offline Cloudinary

An **offline Cloudinary-like file manager** for Node.js — designed for developers who need a simple, local alternative to Cloudinary for uploads, deletions, and testing without internet access.

---

## Features

* Local file uploads and deletions with HTTP server emulator
* Cloudinary-style API responses
* Simple environment-based or programmatic configuration
* Built-in Express server to serve uploaded files via HTTP
* Clear all stored uploads with one command
* Friendly validation and error messages
* Perfect for testing, prototyping, or offline development

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

You can configure Offline Cloudinary using either:

* Environment variables
* Programmatic configuration methods

---

## Environment Configuration

In your project's `.env` file:

```env
CLOUDINARY_OFFLINE_PATH=./offline_uploads
CLOUDINARY_OFFLINE_PORT=3000
```

### Environment Variables

| Variable                  | Description                                        |
| ------------------------- | -------------------------------------------------- |
| `CLOUDINARY_OFFLINE_PATH` | Base directory where uploaded files will be stored |
| `CLOUDINARY_OFFLINE_PORT` | Port number for the HTTP emulator server           |

---

## Quick Start

```js
import { startEmulator, offlineCloudinary } from "offline-cloudinary";

// Start the HTTP server
startEmulator();

(async () => {
  try {
    // Upload a file
    const uploadResult = await offlineCloudinary.upload("./temp/photo.jpg", {
      folder: "users/avatars",
      fileName: "max-essien"
    });

    console.log("Upload result:", uploadResult);

    // Access the uploaded file
    console.log(`View file at: ${uploadResult.url}`);

    // Delete the uploaded file
    const deleteResult = await offlineCloudinary.destroy(uploadResult.public_id);

    console.log("Delete result:", deleteResult);

    // Clear all stored files
    const clearResult = await offlineCloudinary.clearStorage();

    console.log("Storage cleared:", clearResult);
  } catch (err) {
    console.error("Error:", err.message);
  }
})();
```

---

# Programmatic Configuration

You can configure the storage path and server port directly in code without using environment variables.

---

## `offlineCloudinary.setRootPath(path)`

Sets the root directory where uploaded files will be stored.

### Parameters

| Name   | Type     | Description           |
| ------ | -------- | --------------------- |
| `path` | `string` | Root upload directory |

### Example

```js
import { offlineCloudinary } from "offline-cloudinary";

offlineCloudinary.setRootPath("./offline_uploads");
```

---

## `offlineCloudinary.setPort(port)`

Sets the port used to generate HTTP file URLs.

### Parameters

| Name   | Type     | Description          |
| ------ | -------- | -------------------- |
| `port` | `number` | Emulator server port |

### Example

```js
import { offlineCloudinary } from "offline-cloudinary";

offlineCloudinary.setPort(3000);
```

---

# API Reference

## `startEmulator(port?, offlineRootPath?)`

Starts the Express HTTP server used to serve uploaded files.

### Parameters

| Name              | Type     | Description                       |
| ----------------- | -------- | --------------------------------- |
| `port`            | `number` | Optional custom server port       |
| `offlineRootPath` | `string` | Optional custom storage directory |

### Notes

* If `port` is not provided, the emulator uses `CLOUDINARY_OFFLINE_PORT`
* If `offlineRootPath` is not provided, the emulator uses `CLOUDINARY_OFFLINE_PATH`
* Must be called to access uploaded files via HTTP URLs

### Example

```js
import { startEmulator } from "offline-cloudinary";

// Uses environment variables
startEmulator();

// Custom port
startEmulator(3000);

// Custom port and storage path
startEmulator(3000, "./offline_uploads");
```

---

## `offlineCloudinary`

The main instance used for file operations.

You can configure it using:

* Environment variables
* `setRootPath()`
* `setPort()`

If required configuration is missing, methods throw friendly validation errors explaining what needs to be configured.

---

## `offlineCloudinary.upload(tempFilePath, options?)`

Uploads a file from a temporary path into offline storage.

### Parameters

| Name               | Type     | Description                                 |
| ------------------ | -------- | ------------------------------------------- |
| `tempFilePath`     | `string` | Path to the source file                     |
| `options.folder`   | `string` | Optional nested folder path                 |
| `options.fileName` | `string` | Optional custom file name without extension |

### Returns

```js
{
  asset_id: "uuid-v4",
  public_id: "uuid-v4",
  version: 1702654321000,
  version_id: "uuid-v4",
  signature: "hex-string",
  width: 1920,
  height: 1080,
  format: "jpg",
  resource_type: "image",
  created_at: "2025-12-15T10:30:00.000Z",
  tags: [],
  pages: 1,
  bytes: 102400,
  type: "upload",
  etag: "hex-string",
  placeholder: false,
  url: "http://localhost:3000/file/{uuid}",
  secure_url: "http://localhost:3000/file/{uuid}"
}
```

### Example

```js
// Upload with options
const result = await offlineCloudinary.upload("./photo.jpg", {
  folder: "users/avatars",
  fileName: "profile-pic"
});

// Upload without options
const simpleUpload = await offlineCloudinary.upload("./photo.jpg");

console.log(result.url);
console.log(result.public_id);
```

---

## `offlineCloudinary.destroy(public_id)`

Deletes a file from offline storage using its UUID.

### Parameters

| Name        | Type     | Description               |
| ----------- | -------- | ------------------------- |
| `public_id` | `string` | UUID returned from upload |

### Returns

```js
{ result: "ok" }
```

or

```js
{ result: "not found" }
```

### Example

```js
const uploadResult = await offlineCloudinary.upload("./photo.jpg");

await offlineCloudinary.destroy(uploadResult.public_id);
```

---

## `offlineCloudinary.clearStorage()`

Deletes all files and folders inside the offline storage directory.

### Returns

```js
{ result: "ok" }
```

### Example

```js
await offlineCloudinary.clearStorage();

console.log("All files deleted");
```

---

# Error Handling

Offline Cloudinary performs validation checks and throws friendly error messages when required configuration or parameters are missing.

### Examples

```js
// Missing root path
Error: CLOUDINARY_OFFLINE_PATH is not configured

// Missing port
Error: CLOUDINARY_OFFLINE_PORT is not configured

// Invalid upload path
Error: File does not exist
```

---

# Example `.env`

```env
CLOUDINARY_OFFLINE_PATH=./uploads
CLOUDINARY_OFFLINE_PORT=3000
```

---

# Example Folder Structure

```txt
project/
├── .env
├── uploads.json
├── uploads/
│   └── users/
│       └── avatars/
│           └── max-essien.jpg
└── index.js
```

---

# Migration from v1.x to v2.x

## Breaking Changes

1. New environment variable introduced: `CLOUDINARY_OFFLINE_PORT`
2. Import changed from default export to named exports
3. `public_id` now returns UUID instead of file path
4. `url` and `secure_url` now return HTTP endpoints
5. `startEmulator()` must be called for HTTP access

---

## Before (v1.x)

```js
import offlineCloudinary from "offline-cloudinary";

const result = await offlineCloudinary.upload("./photo.jpg");

// public_id was a file path
```

---

## After (v2.x)

```js
import { startEmulator, offlineCloudinary } from "offline-cloudinary";

// Optional environment configuration
// CLOUDINARY_OFFLINE_PORT=3000

startEmulator();

// or
startEmulator(3000);

// or
startEmulator(3000, "./uploads");

const result = await offlineCloudinary.upload("./photo.jpg");

// public_id is now a UUID
// url is now an HTTP endpoint
```

---

# Author

**Max Essien**
📍 Lagos, Nigeria
🔗 GitHub: @MaxEssien

---

# License

This project is licensed under the **MIT License** — free for personal and commercial use.

---

# Changelog

See `CHANGELOG.md` for release history and migration guides.

---

# Offline Cloudinary

Your Cloudinary, anywhere, even offline.
