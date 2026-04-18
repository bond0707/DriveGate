## Overview

This router handles Time-Based One-Time Password (TOTP) setup, storage, and verification for two-factor authentication.

---

### **Test Case 1: Generate TOTP Secret and Provisioning URI (Setup)**

This endpoint generates a new TOTP secret and provisioning URI for initial setup.

* **HTTP Method:** `GET`
* **Endpoint URL:** `http://localhost:8000/totp/secret`
* **Authentication:** Required
* **Request Headers:**

  ```http
  Authorization: Bearer <ACCESS_TOKEN>
  ```
* **Expected Response (200):**

  ```json
  {
    "totp_secret": "JBSWY3DPEHPK3PXP",
    "provisioning_uri": "otpauth://totp/DriveGate:tony@starkindustries.com?secret=JBSWY3DPEHPK3PXP&issuer=DriveGate"
  }
  ```

---

### **Test Case 2: Get Current TOTP Secret and URI (Rescan)**

This endpoint returns the current TOTP secret and provisioning URI for users who need to rescan their QR code.

* **HTTP Method:** `GET`
* **Endpoint:** `http://localhost:8000/totp/secret/current`
* **Authentication:** Required

#### Headers

```http
Authorization: Bearer <ACCESS_TOKEN>
```

#### Successful Response (200)

```json
{
  "totp_secret": "JBSWY3DPEHPK3PXP",
  "provisioning_uri": "otpauth://totp/DriveGate:tony@starkindustries.com?secret=JBSWY3DPEHPK3PXP&issuer=DriveGate"
}
```

#### Error Responses

* **401 Unauthorized** – Missing or invalid JWT
* **404 Not Found** – TOTP Secret not found for the user
* **500 Internal Server Error** – Database error

---

### **Test Case 3: Verify and Store TOTP Secret**

Verifies the user's TOTP code against a provided secret and stores the secret in the database. Proves you're not a Skrull.

* **HTTP Method:** `POST`
* **Endpoint URL:** `http://localhost:8000/totp/secret`
* **Authentication:** Required
* **Request Headers:**

  ```http
  Authorization: Bearer <ACCESS_TOKEN>
  Content-Type: application/json
  ```
* **Body:**

  ```json
  {
    "user_totp": "123456",
    "user_totp_secret": "JBSWY3DPEHPK3PXP"
  }
  ```
* **Expected Successful Response (200):**

  ```json
  {
    "message": "TOTP Secret successfully stored to DB."
  }
  ```
* **Expected Error Response (400):**

  ```json
  {
    "detail": "TOTP is invalid!"
  }
  ```

---

### **Test Case 4: Verify TOTP and Get Upload Token (Public)**

This public endpoint verifies a TOTP code for a given URL slug and returns a short-lived upload token. This is the gateway to the upload flow — no JWT required, just the magic numbers.

* **HTTP Method:** `POST`
* **Endpoint URL:** `http://localhost:8000/totp/verify`
* **Authentication:** ❌ Not required
* **Body:**

  ```json
  {
    "totp": "528491",
    "url_slug": "dream_within_a_dream"
  }
  ```
* **Expected Successful Response (200):**

  ```json
  {
    "upload_token": "<SHORT_LIVED_JWT>"
  }
  ```

  The upload token JWT payload contains:
  ```json
  {
    "url_slug": "dream_within_a_dream",
    "folder_id": "1AbCdEfGhIjKlMnOpQrStUvWxYz",
    "folder_name": "My Upload Folder",
    "google_access_token": "<GOOGLE_ACCESS_TOKEN>",
    "type": "upload",
    "exp": 1707900000
  }
  ```

* **Expected Error Responses:**
  * **401 Unauthorized** – Invalid TOTP code
  * **403 Forbidden** – Refresh token revoked, user needs to re-authenticate
  * **404 Not Found** – Drive folder ID or refresh token missing
  * **429 Too Many Requests** – Rate limited (e.g., `"Too many attempts for this slug. Blocked for 2m 30s."`)
  * **500 Internal Server Error** – Database error

---

## Notes

* TOTP secrets are stored encrypted in the database.
* The provisioning URI can be used to generate a QR code for authenticator apps.
* Upload tokens are short-lived JWTs (15 minutes) specifically for file upload operations.
* The `/verify` endpoint is public and does not require authentication.
* The `/verify` endpoint is rate-limited per IP + URL slug combination to prevent brute-force attacks.
