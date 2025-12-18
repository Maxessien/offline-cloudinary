# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2025-12-18

### Added

- **In-memory caching system**: File mappings are now cached in memory for dramatically faster operations
- **Dirty flag tracking**: Efficient cache invalidation system that only syncs to disk when changes occur
- **Automatic periodic sync**: Background task (500ms intervals) automatically persists cache changes to disk
- **Graceful shutdown**: Process cleanup handler that ensures all in-memory changes are synced to disk on exit

### Changed

- `upload()` and `destroy()` operations now use in-memory cache for improved performance
- `initialise()` method now handles lazy initialization and cache management
- Improved resource management with automatic interval cleanup

### Performance

- Significantly reduced disk I/O operations
- Faster file operations through in-memory lookups
- Minimal overhead with periodic batch writes to disk

### Fully Backward Compatible

All v2.0.0 APIs remain unchanged. The caching system is transparent to end users.

## [2.0.0] - 2025-12-15

### Breaking Changes

- **Main export location changed**: Moved from `src/index.js` to root `index.js`
- **Port configuration**: Now requires `CLOUDINARY_OFFLINE_PORT` environment variable
- **Public ID format**: `public_id` is now a UUID instead of a file path
- **Upload response URL**: The `url` field now returns an HTTP endpoint (`http://localhost:PORT/file/{id}`) instead of a file path
- **Secure URL**: The `secure_url` field also now returns an HTTP endpoint (`http://localhost:PORT/file/{id}`) instead of a file path

### Added

- **HTTP Server Emulator**: New `startEmulator()` function to run a local Express server that serves uploaded files
- **File viewing endpoint**: GET `/file/:id` endpoint to view/download uploaded files via HTTP
- **Upload tracking**: Internal `uploads.json` file maps UUIDs to file paths
- **New environment variable**: `CLOUDINARY_OFFLINE_PORT` for configuring the server port
- **Express integration**: Built-in CORS and Express routing support

### Changed

- File tracking now uses a JSON mapping file (`uploads.json`) instead of direct file paths
- Upload method now generates UUID-based public IDs for better privacy and consistency
- Files can now be accessed via HTTP URLs when the emulator is running

### Migration Guide from v1.x to v2.x

#### 1. Update your `.env` file

Add the new port configuration:

```env
CLOUDINARY_OFFLINE_PATH=./offline_uploads
CLOUDINARY_OFFLINE_PORT=3000
```

#### 2. Start the emulator

```js
import { startEmulator, offlineCloudinary } from "offline-cloudinary";

// Start the HTTP server
startEmulator();
```

#### 3. Update public_id handling

**Before (v1):**
```js
const result = await offlineCloudinary.upload("./photo.jpg");
// result.public_id was a file path like "./offline_uploads/photo.jpg"
```

**After (v2):**
```js
const result = await offlineCloudinary.upload("./photo.jpg");
// result.public_id is now a UUID like "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
// result.url is "http://localhost:3000/file/a1b2c3d4-e5f6-7890-abcd-ef1234567890"
// result.secure_url is the actual file path
```

#### 4. Update destroy calls

Use the UUID from upload response:

```js
const uploadResult = await offlineCloudinary.upload("./photo.jpg");
await offlineCloudinary.destroy(uploadResult.public_id); // Pass the UUID
```

---

## [1.0.0] - Initial Release

### Added

- Initial release with basic upload, delete, and clearStorage functionality
- Environment-based path configuration via `CLOUDINARY_OFFLINE_PATH`
- Cloudinary-like response format
- Support for nested folder structures
- Custom filename option

[2.0.0]: https://github.com/MaxEssien/offline-cloudinary/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/MaxEssien/offline-cloudinary/releases/tag/v1.0.0
