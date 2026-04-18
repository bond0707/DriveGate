# Changelog

All notable changes to the frontend are documented in this file.

---

## [14-02-2026] - Public Upload Page UX Overhaul

### Added

- **Drag‑and‑Drop Folder Upload** — Folders can now be dragged directly into the dropzone (like GitHub):
  - Uses `DataTransferItem.webkitGetAsEntry()` via react‑dropzone under the hood
  - No native browser dialog — folder structure is read silently
  - `onDrop` detects folder drops via `file.path` and shows a custom confirmation dialog
  - Paths are normalized (strips leading `/` and `./` from react‑dropzone) to prevent ghost folder entries
  - File: `PublicUpload.client.tsx`

- **Folder Upload Confirmation Dialog** — When a folder is dropped, a custom MUI dialog asks for confirmation:
  - Shows folder name, upload/cancel buttons
  - Teal accent color (`#00897B`) on icon and upload button
  - File: `PublicUpload.client.tsx`

- **Leave Confirmation Dialog** — Replaced native `window.confirm()` with a styled MUI dialog:
  - Appears when clicking the back arrow during an active upload
  - Warning icon with amber accent, "Stay" / "Leave" buttons
  - File: `PublicUpload.client.tsx`

- **`SquircleLoader`** — Replaced `CircularProgress` spinner with custom animated loader for folder creation feedback:
  - File: `PublicUpload.client.tsx`

### Changed

- **Destination Folder Section** — Increased label size from `caption` to `body2` with `fontWeight: 500`
- **Upload Info Text** — Updated to: "Files and folders will be uploaded directly in the folder given below."
- **Dropzone Text** — Updated to: "Drag & drop files or folders here, or click to select files."
- **Cloud Upload Icon** — Changed color from `text.disabled` to `#00897B`
- **Create Folder Icon** — Added `#00897B` color to the `CreateNewFolder` icon button
- **Folder Input Icon** — Changed color from `text.secondary` to `#00897B`
- **File List Icon** — Added `#00897B` color to the file `ListItemIcon`
- **Folder Dialog Icon** — Updated from `#2E7D32` to `#00897B`
- **Folder Dialog Upload Button** — Set text color to `#FFFFFF` (always white)
- File: `PublicUpload.client.tsx`

### Fixed

- **Folder Created in Wrong Location** — New folders were being created at Google Drive root instead of inside the destination folder:
  - Re‑added `defaultFolderId` state (parsed from JWT upload token)
  - `handleCreateNewFolder` now passes `targetFolderId || defaultFolderId` as parent
  - `createFolderTree` also uses `defaultFolderId` as fallback
  - File: `PublicUpload.client.tsx`

- **Duplicate Subfolder Bug** — Uploading a nested folder created ghost subfolders in Drive:
  - Root cause: react‑dropzone's `file-selector` uses `entry.fullPath` which starts with `/`
  - Path splitting on `/` produced an empty‑string segment, creating a nameless folder
  - Fix: `normalizePath` strips leading `/` and `./` before storing `relativePath`
  - File: `PublicUpload.client.tsx`

### Removed

- **"Upload a folder instead" Button** — No longer needed; drag‑and‑drop handles folder uploads
- **Hidden `<input webkitdirectory>` Element** — Removed along with `handleFolderSelect` and `folderInputRef`
- **Back‑to‑Default Button** — Removed the `ArrowBack` icon button and `handleBackToDefault` function
- **Unused Imports** — Removed `CircularProgress`, `ArrowBack`
- File: `PublicUpload.client.tsx`

---

## Files Summary

### Pages

| File                              | Description                                      |
| --------------------------------- | ------------------------------------------------ |
| `[slug]/page.tsx`               | Public upload page with TOTP verification        |
| `dashboard/page.tsx`            | User dashboard with TOTP, link, and folder cards |
| `login/page.tsx`                | Google OAuth login page                          |
| `setup-folder/page.tsx`         | Drive folder configuration                       |
| `setup-link/page.tsx`           | URL slug setup                                   |
| `setup-totp/page.tsx`           | TOTP setup with QR code                          |
| `auth/google/callback/page.tsx` | OAuth callback handler                           |
| `privacy/page.tsx`              | Privacy policy page                              |
| `terms/page.tsx`                | Terms of service page                            |

### Components

| File                         | Description                     |
| ---------------------------- | ------------------------------- |
| `SquircleLoader.tsx`       | Animated loading spinner        |
| `ThemeToggle.tsx`          | Dark/light mode toggle          |
| `StyledQRCode.tsx`         | Styled QR code component        |
| `AnimatedSection.tsx`      | Section animation wrapper       |
| `SmoothScrollProvider.tsx` | Smooth scroll context           |
| `TextReveal.tsx`           | Text reveal animation           |
| `landing/*.tsx`            | Landing page section components |
