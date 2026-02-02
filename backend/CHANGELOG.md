# CHANGELOG

All notable changes to the backend are documented in this file.

---

## [03-02-2026] - Upload Flow Optimization

### Changed

- **Access Token Optimization** - Moved Google access token generation from per-file to per-session:
  - Access token and folder ID now fetched once during TOTP verification
  - JWT upload token now contains: `url_slug`, `google_access_token`, `folder_id`
  - Eliminates redundant DB queries and token refreshes during file uploads
  - Files: `totp_router.py`, `url_slug_router.py`, `jwt_manager.py`

### Security

- **Upload Token TTL** - Upload tokens expire after 15 minutes (vs standard JWT expiration):

  - Separate token type: `type: "upload"` vs `type: "access"`
  - Short-lived to minimize exposure of embedded Google access token
  - File: `jwt_manager.py`
- **Token Type Separation** - Upload and user tokens are now distinguished:

  - `verify_token()` accepts `expected_type` parameter
  - Upload endpoint explicitly expects `type: "upload"`
  - Prevents access tokens from being used for uploads (and vice versa)
  - File: `dependencies.py`

---

## [03-02-2026] - Sign In/Sign Up Flow

### Fixed

- **Google Auth Service** - Fixed `prompt` parameter construction in `get_authorization_url`:
  - `prompt=consent` for new users, `prompt=select_account` for returning users
  - File: `google_auth_service.py`

### Changed

- **Consent Flow Logic** - Improved new user detection in `/google/callback`:

  - Returns `409 CONFLICT` with `"Consent Required"` when new user clicks Sign In without consent
  - Frontend detects this and shows helpful modal instead of auto-retrying
  - File: `auth_router.py`
- **DB Query Optimization** - Consolidated duplicate `get_user_by_email` queries:

  - Before: 2 queries for returning users (check existence + get user)
  - After: 1 query for all scenarios
  - Reordered logic: query once, then check conditions
  - File: `auth_router.py`

### Documentation

- **Test Cases** - Updated `testcases/auth_router.md`:
  - Test Case 1 now documents `force_consent=false` for returning users
  - Added Test Case 1b for new users with `force_consent=true`
  - Added 409 CONFLICT error documentation to Test Case 2
  - Updated Test Flow notes with Sign In vs Sign Up guidance

---

## [10-01-2026]

### Changed

#### Database Schema

- **`user_drive.totp_secret`** - Changed from `CHAR(32)` to `TEXT` for encrypted TOTP secrets
- **`user_drive.totp_secret`** - Removed `unique=True` constraint

---

## [09-01-2026] - `13c054f`, `5e56c2b`

### Changed

- Updated `.env.example` configuration
- Modified `totp_router.py` and `totp_service.py`
- Fixed `url_slug_router.py` for UI compatibility

---

## [08-01-2026] - `ee10e55`, `e274896`

### Changed

- **Auth Router** - Fixed drive permission handling
- **User Service** - Improved duplicated slug error handling
- **URL Slug Router** - Enhanced validation
- Updated `main.py` configuration

---

## [03-01-2026] - `6c392a5`

### Added

- **Enums**:
  - `app/core/enums.py` - `AuthType`, `DriveType` enumerations
  - `app/database/enums.py` - SQLAlchemy enum types
- **Normalized Models**:
  - `app/models/user_auth.py` - Authentication methods (OAuth)
  - `app/models/user_drive.py` - Drive credentials and folder info
  - `app/models/users.py` - Core user data
- **Dependency Management**:
  - `requirements.in` - Source dependencies

### Changed

- **Database Connection** - Explicit SSL with CA certificate
- **Config** - Added `DB_SERVICE_CA_PATH`
- **Auth Router** - Separated folder creation from OAuth callback
- **User Service** - Complete rewrite for normalized schema
- **Google Auth Service** - Parameterized folder name creation
- **Schemas** - Added `FolderUpdateRequest`, `FolderUpdateResponse`

### Renamed

- `jwt_handler.py` → `jwt_manager.py`

### Removed

- `app/models/UserModel.py` (replaced by normalized models)

---

## [29-12-2025] - `8e5309b`

### Added

- **`.env.example`** - Environment variable template
- **`CHANGELOG.md`** - Initial changelog
- **Schemas**:
  - `drive.py` - Drive-related schemas
  - `generic.py` - Generic response schemas
  - `totp.py` - TOTP request/response schemas

### Changed

- Standardized file naming (PascalCase → snake_case):
  - `Auth_Router.py` → `auth_router.py`
  - `User.py` → `user.py`
- Updated all routers, services, and utilities
- Enhanced TOTP service with validation

### Removed

- Old `changelog.md` (replaced with `CHANGELOG.md`)

---

## [26-12-2025] - `baf6803`

### Added

- **URL Slug Router** - `url_slug_router.py` for public upload URLs
- **Test Documentation**:
  - `testcases/totp_router.md`
  - `testcases/url_slug_router.md`
- **Initial changelog** - `changelog.md`

### Changed

- Enhanced TOTP service with verification logic
- Updated auth router and services
- Organized testcases into directory

---

## [25-12-2025] - `d2090e2`

### Added

- **TOTP Router** - `totp_router.py` for 2FA setup and verification
- **TOTP Service** - `totp_service.py` with OTPAuth integration

### Changed

- Added TOTP secret storage to user model
- Enhanced JWT handler with token validation
- Updated dependencies configuration

---

## [23-12-2025] - `3975cb9`, `8dfd18b`

### Added

- **Auth Router** - `Auth_Router.py` with Google OAuth flow
- **User Service** - `user_service.py` for user CRUD operations
- **Dependencies** - `dependencies.py` for route dependencies
- **Test Documentation** - `testCases.md`

---

## [23-12-2025] - `2f748a4`

### Added

- **Schemas** - `User.py` for user request/response models
- **Google Auth Service** - OAuth and Drive API integration
- **JWT Handler** - Token creation and validation utilities

---

## [13-12-2025] - `3c4f245`

### Added

- **Initial Backend Structure**:
  - `app/core/config.py` - Configuration management
  - `app/database/connection.py` - SQLAlchemy setup
  - `app/models/UserModel.py` - Initial user model
  - `main.py` - FastAPI application entry point
  - `requirements.txt` - Python dependencies

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
│   │   ├── totp_router.py      # TOTP setup/verify
│   │   └── url_slug_router.py  # Public upload URLs
│   ├── schemas/
│   │   ├── user.py   # User schemas
│   │   ├── totp.py   # TOTP schemas
│   │   └── drive.py  # Drive schemas
│   ├── services/
│   │   ├── google_auth_service.py  # OAuth & Drive API
│   │   ├── totp_service.py         # TOTP operations
│   │   └── user_service.py         # User CRUD
│   └── utils/
│       ├── jwt_manager.py   # JWT handling
│       └── dependencies.py  # Route dependencies
├── main.py             # FastAPI app
└── requirements.txt    # Dependencies
```
