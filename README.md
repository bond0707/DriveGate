# TOTP Drive Uploader

A web app that lets users upload data to their own google drives without logging in using TOTP.

---

## **Schema Diagram**

[Click here to view the schema diagram.](https://drawsql.app/teams/goon-squad/diagrams/schema-diagram "TOTP Drive Uploader Schema Diagram")

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

---

## Future Updates

* [X] optimize db queries.
* [X] add inserting, updating url-slug functionality.
* [X] add folder renaming functionality.
* [ ] add image (brand logo) to provisioning URI generator.
* [ ] Add a delete user functionality in the frontend.
* [X] Rename "jwt_handler.py" to "jwt_manager.py" for consistency.
* [ ] Ask dhruvil about why he kept `auto_error=False` and not the default true value. (dependencies.py)
* [ ] Encrypt refresh tokens before storing in db `MAXIMUM PRIORITY`
