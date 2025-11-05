# Offline Cloudinary

An **offline Cloudinary-like file manager** for Node.js — designed for developers who need a simple, local alternative to Cloudinary for uploads, deletions, and testing without internet access.

---

## Features

- Local file uploads and deletions  
- Cloudinary-style API responses  
- Simple environment-based configuration  
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

In your project’s `.env` file, define the base path for all offline uploads:

```
CLOUDINARY_OFFLINE_PATH=./offline_uploads
```

This path will serve as your “offline cloud” — all uploaded files will be stored here.

---

## Usage Example

```js
import offlineCloudinary from "offline-cloudinary";

(async () => {
  try {
    // Upload a file
    const uploadResult = await offlineCloudinary.upload("./temp/photo.jpg", {
      folder: "users/avatars",
      fileName: "max-essien"
    });

    console.log("Upload result:", uploadResult);

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

### **`new OfflineCloudinary()`**
Automatically instantiated when imported.  
Throws an error if `CLOUDINARY_OFFLINE_PATH` is not set.

---

### **`upload(tempFilePath, options)`**

Uploads a file from a temporary path to your offline storage.

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
  asset_id, public_id, version, format, resource_type,
  created_at, bytes, url, secure_url, ...
}
```

---

### **`destroy(public_id)`**

Deletes a file from your offline storage.

**Parameters**
| Name | Type | Description |
|------|------|--------------|
| `public_id` | `string` | Full path returned by the upload method |

**Returns**
```js
{ result: "ok" }
```

---

### **`clearStorage()`**

Deletes all files and folders in your offline Cloudinary storage.

**Returns**
```js
{ result: "ok" }
```

---

## Example .env

```
CLOUDINARY_OFFLINE_PATH=./uploads
```

---

## Example Folder Structure

```
project/
├── .env
├── uploads/
│   └── users/
│       └── avatars/
│           └── max-essien.jpg
└── index.js
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
**Offline Cloudinary** — your Cloudinary, anywhere, even offline.

