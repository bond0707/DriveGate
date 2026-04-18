# CHANGELOG

All notable changes to the backend are documented in this file.

---

## [14-02-2026] - Drive Router Refactor

### Changed

- **Drive Router Separation** — Moved drive‑related endpoints out of `auth_router.py` and `url_slug_router.py` into a dedicated `drive_router.py`:
  - `POST /drive/folder` — Create a folder/subfolder during upload (uses upload token)
  - `PATCH /drive/folder` — Create and update Drive folder settings (uses regular JWT, for setup/dashboard)
  - `POST /drive/upload-link` — Generate a Google Drive resumable upload URL (uses upload token)
  - Files: `drive_router.py`, `main.py`

- **Upload Token Payload** — Now includes `folder_name` alongside existing fields:
  - JWT payload: `url_slug`, `folder_id`, `folder_name`, `google_access_token`
  - Enables frontend to display the destination folder name without extra API calls
  - Files: `totp_router.py`, `jwt_manager.py`

- **Upload Link Folder Fallback** — `POST /drive/upload-link` uses `file_metadata.parent_folder_id` if provided, otherwise falls back to the token's `folder_id`:
  - Ensures files go to the correct subfolder when uploading folder structures
  - File: `drive_router.py`

### Performance

- **Combined DB Query** — `get_totp_and_credentials_by_url_slug()` now returns `folder_name` in addition to `totp_secret`, `folder_id`, and `refresh_token`:
  - Single query fetches all data needed for upload token generation
  - File: `user_service.py`

---

## Architecture Overview

```
backend/
├── app/
│   ├── core/
│   │   ├── config.py      # Environment configuration
│   │   └── enums.py       # AuthType, DriveType enums
│   ├── database/
│   │   ├── connection.py  # SQLAlchemy engine & session
│   │   └── enums.py       # Database enum types
│   ├── models/
│   │   ├── users.py       # UserModel (core user data)
│   │   ├── user_auth.py   # UserAuthModel (OAuth)
│   │   └── user_drive.py  # UserDriveModel (TOTP, folder)
│   ├── routers/
│   │   ├── auth_router.py      # Google OAuth endpoints
│   │   ├── drive_router.py     # Drive folder & upload endpoints
│   │   ├── totp_router.py      # TOTP setup/verify
│   │   └── url_slug_router.py  # Public upload URLs
│   ├── schemas/
│   │   ├── user.py      # User schemas
│   │   ├── totp.py      # TOTP schemas
│   │   ├── drive.py     # Drive schemas
│   │   ├── url_slug.py  # URL slug schemas
│   │   └── generic.py   # Generic response schemas
│   ├── services/
│   │   ├── google_auth_service.py   # OAuth & token management
│   │   ├── google_drive_service.py  # Drive API operations
│   │   ├── totp_service.py          # TOTP operations
│   │   └── user_service.py          # User CRUD
│   └── utils/
│       ├── jwt_manager.py   # JWT handling
│       ├── dependencies.py  # Route dependencies
│       └── rate_limiter.py  # TOTP rate limiting
├── main.py             # FastAPI app
└── requirements.txt    # Dependencies
```
