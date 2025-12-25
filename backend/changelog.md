# Changelog

This commit is an update on Dhruvil's commit `6456c22`

### Added

- **TOTP Router** (`totp_router`) with the following endpoints:

  - `GET /setup` - Generates and returns a random TOTP secret for setup.
  - `POST /store` - Accepts OTP and TOTP secret, verifies OTP, and stores the secret in database upon successful verification
  - `POST /verify` - Verifies provided OTP against user's stored TOTP secret (identified via URL slug)
- **URL Slug Router** (`url_slug_router`) with the following endpoint:

  - `PATCH /update` - Accepts a URL slug and updates it in the database for the current active user
- **User Service Methods**:

  - `get_totp_secret_by_url_slug()` - Retrieves TOTP secret associated with a URL slug
  - `update_refresh_token()` - Updates user's refresh token
  - `update_drive_folder()` - Updates user's drive folder information
  - `update_totp_secret()` - Updates user's TOTP secret
  - `update_url_slug()` - Updates user's URL slug
- **A "testcases" directory**

  - To store testcases for different endpoints in an organized manner.
  - Added a file `totp_router.md` in this directory.
  - Added a file `url_slug_router.md` in this diirectory.

### Changed

- **Code Convention**: Unified naming convention across entire backend to use consistent `camel_case` (replacing previous `Camel_Case` variations)
- **testCases.md:** Renamed the previous testcase file to `auth_router.md` and moved that file in the **testcases** directory.

### Fixed

- **Drive Folder Bug**: Resolved issue where the system would repeatedly create new drive folders upon every login.

### Removed

- **User Service Method**: Removed `update_user()` method from user_service as functionality has been decomposed into more specific update methods.
- Unused imports in some files.

---

## **Complete TOTP Flow**

### **Initial Setup (First-time TOTP Configuration)**

1. **Request Secret** : NextJS calls FastAPI's `/setup` endpoint to get a randomly generated TOTP secret.
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
