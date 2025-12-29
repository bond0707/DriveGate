# CHANGELOG

This release represents a major backend refactor, schema cleanup, and a finalized TOTP-based secure upload flow.

This commit is a major functional update on Kirtan's commit `baf6803`

---

## New Files Added

- `app/schemas/drive.py`
- `app/schemas/totp.py`
- `app/schemas/generic.py`
- `.env.example`

---

## Universal Changes

- Migrated database from MySQL to **PostgreSQL**.
- Cleared all `__init__.py` files to avoid circular import issues.
- Renamed all files in `app/schema/` to use only **lowercase letters**.

---

## Core Configuration

### app/core/config.py

- Added a new configuration variable:
  - `GOOGLE_DRIVE_UPLOAD_REQUEST_URL`

---

## Database Models

### app/models/UserModel.py

- Migrated to SQLAlchemy **2.0 ORM syntax**.
- Renamed table from `user` to `users` (reserved keyword in PostgreSQL).
- Changed `users.totp_secret` column type from `String(32)` to `CHAR(32)`.

---

## Routes

### app/routes/totp_router.py

- Replaced `JSONResponse` usage with **Pydantic models** and `HTTPException`.
- Replaced `generate_totp_secret()` with `return_totp_secret_and_uri()`.

### app/routes/url_slug_router.py

- Replaced `JSONResponse` usage with **Pydantic models** and `HTTPException`.
- Added `get_upload_uri()` method to generate Google Drive upload URLs.

---

## Schemas

### app/schemas/user.py

- Added base class `SQLAlchemyConvertible` with shared Pydantic config.
- `UserModel` (and future models) now inherit from this base class.

---

## Services

### app/services/google_auth_service.py

- Renamed `refresh_access_token()` to `get_access_token()`.
- Method now returns only the **access token**.

### app/services/user_service.py

- Added exception handling to:
  - `delete_user()`
  - `get_user_by_id()`
  - `get_user_by_email()`
- Replaced query-based lookups with `db.get()` for faster primary-key access.
- Added `get_drive_credentials_by_url_slug()` returning `(folder_id, refresh_token)`.
- Optimized select queries to fetch only required fields.
- Optimized update queries using SQL **RETURNING** clause.
- Modified `delete_user()` to return `(user_id, username, email)` instead of `bool`.

### app/services/totp_service.py

- Added `get_provisioning_uri()` for authenticator apps.
- Converted entire service to **synchronous execution** (async not required).

---

## Utilities

### app/utils/dependencies.py

- Extracted JWT payload parsing into `get_access_token_payload()` and `get_upload_token_payload()`
- Simplified `get_current_user()` by separating concerns.

### app/utils/jwt_handler.py

- Added `create_upload_token()` method.
- Generates a short-lived JWT used exclusively for uploads.

---

## Application Entry

### main.py

- Replaced `JSONResponse` usage with **Pydantic models** and `HTTPException`.
- Modified `verify_url_slug()` to return homepage if URL slug is empty.

---

## Version Control

### .gitignore

- Added `.next/` directory.

---

## Documentation

### README.md

- Updated with future roadmap and planned features.

---

## **TOTP Flow**

### **Initial Setup (First-time TOTP Configuration)**

1. **Request TOTP Secret** : NextJS calls FastAPI's `/setup` endpoint to get a randomly generated TOTP secret.
2. **Generate QR Code** : NextJS uses the returned `totp_secret` to generate and display a QR code to the user.
3. **User Setup** : The user scans the QR code with their authenticator app (Google Authenticator, Authy, etc.) to add the TOTP secret.
4. **Verify Setup** : The user enters the first OTP from their app and submits.
5. **Store Secret** : NextJS sends the OTP and TOTP secret to `/store`. FastAPI verifies the OTP and, if correct, stores the TOTP secret in the database for that user.

### **Subsequent TOTP Usage (Upload Verification)**

1. **Get User Info** : FastAPI uses the URL slug to identify the user (via `/{url_slug}` endpoint in main.py).
2. **Request TOTP** : The user is prompted to enter their current TOTP code.
3. **Verify TOTP** : NextJS sends the TOTP code and URL slug to the `/verify` endpoint.
4. **Validation** : FastAPI:

* Fetches the TOTP secret from the database using the URL slug
* Verifies the provided TOTP code against the stored secret
* Returns `is_valid: true` (Response 200 OK) or `is_valid: false` (Error response (due to @Dhruvil))

---

## Upload Flow

1. User configures TOTP and URL slug on the website.
2. User opens their upload URL (`/{url_slug}`) on a **remote PC**.
3. Remote PC renders upload UI and prompts for TOTP.
4. User enters TOTP from their authenticator app.
5. Remote PC sends TOTP and URL slug to `/totp/verify`.
6. Backend verifies TOTP and returns a short-lived upload token.
7. Remote PC requests upload URL via `/url/get-upload-link` using upload token.
8. Backend returns Google Drive resumable upload URL.
9. Remote PC uploads file directly to Google Drive.
10. Upload token expires or is invalidated after use.
