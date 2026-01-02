# CHANGELOG

This release represents a major database schema refactor, SSL configuration improvements, and optimized dependency management.

This commit is an update on main after Kirtan's commit `e459938`

---

## New Files Added

- `app/core/enums.py`
- `app/models/user_drive.py`
- `app/models/user_auth.py`
- `requirements.in`

---

## Universal Changes

- Optimized imports in `main.py` and models directory for better performance.
- Changed database schema to normalize user data into separate tables to make it scalable.
- Implemented explicit SSL configuration for database connections.
- Created `requirements.in` and compiled `requirements.txt` for optimized dependency management.

---

## Core Configuration

### app/core/config.py

- Added new configuration variable:
  - `DB_SERVICE_CA_PATH`
- Removed duplicate `model_config` setting.

### app/core/enums.py

- Added two enumerations:
  - `AuthType` (currently with one value: `GOOGLE`)
  - `DriveType` (currently with one value: `GOOGLE_DRIVE`)

---

## Database Models

### app/models/users.py

- Removed fields which have migrated to new normalized tables.

### app/models/user_drive.py

- Added new model for storing totp credentials and folder information.

### app/models/user_auth.py

- Added new model for storing authentication methods (Google OAuth, Github etc.).

---

## Routes

### app/routers/auth_router.py

- Modified `google_callback()` method to no longer automatically create URL slugs and Drive folders (allowing null values in new schema).
- Added new `update_drive_folder()` endpoint to create Drive folder and update database records.

---

## Schemas

### app/schemas/user.py

- Removed `SQLAlchemyConvertible` base class (unused).
- Added new request/response schemas:
  - `FolderUpdateRequest`
  - `FolderUpdateResponse`
- Modified `UserResponse` schema to replace boolean flags with new model fields.

---

## Services

### app/services/google_auth_service.py

- Modified `create_drive_folder()` to accept folder names as parameters instead of using hardcoded names.

### app/services/user_service.py

- Completely rewritten to handle relationships between `users`, `user_drive`, and `user_auth` tables.

---

## Utilities

### app/utils/jwt_handler.py → app/utils/jwt_manager.py

- Renamed file to match class name for consistency.

---

## Database Connection

### app/database/connection.py

- Replaced implicit server-side SSL with explicit SSL configuration using certificate authority file.

---

## Version Control

### .gitignore

- Added `ca.pem` to ignore SSL certificate files.

---

## Documentation

### .env.example

- Cleaned up formatting by removing unnecessary inverted quotes.
- Added new environment variable:
  - `DB_SERVICE_CA_PATH`

### Testcases

* Updated testcases/auth_router.md to include the new `create_drive_folder()` method.

### README.md

- Updated with new authentication and Drive setup flows.
