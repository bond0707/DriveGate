## Overview

This router handles Time-Based One-Time Password (TOTP) setup, storage, and verification for two-factor authentication.

---

### **Test Case 1: Generate TOTP Secret and Provisioning URI (Setup)**

This endpoint generates a new TOTP secret and provisioning URI for initial setup.

* **HTTP Method:** `GET`
* **Endpoint URL:** `http://localhost:8000/totp/setup`
* **Request Headers:**

  ```http
  Authorization: Bearer <ACCESS_TOKEN>
  ```
* **Expected Response (200):**

  ```json
  {
    "totp_secret": "JBSWY3DPEHPK3PXP",
    "provisioning_uri": "otpauth://totp/YourApp:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=YourApp"
  }
  ```

---

### **Test Case 2: Get Current TOTP Secret and URI (Rescan)**

This endpoint returns the current TOTP secret and provisioning URI for users who need to rescan their QR code.

* **HTTP Method:**`GET`
* **Endpoint:**`/totp/rescan`
* **Authentication:** Required

#### Headers

```http
Authorization: Bearer <ACCESS_TOKEN>
```

#### Successful Response (200)

```json
{
  "totp_secret": "JBSWY3DPEHPK3PXP",
  "provisioning_uri": "otpauth://totp/YourApp:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=YourApp"
}
```

#### Error Responses

* **401 Unauthorized** – Missing or invalid JWT
* **404 Not Found** – TOTP Secret not found for the user
* **500 Internal Server Error** – Database error

---

## **Test Case 3: Verify and Store TOTP Secret**

* **HTTP Method:** `POST`
* **Endpoint URL:** `http://localhost:8000/totp/store`
* **Body:**

  ```json
  {
    "user_totp": "123456",
    "user_totp_secret": "JBSWY3DPEHPK3PXP"
  }
  ```
* **Response (200):**

  ```json
  {
    "message": "TOTP Secret successfully stored to DB."
  }
  ```

---

### **Test Case 4: Verify TOTP and Get Upload Token (Public)**

* **HTTP Method:** `POST`
* **Endpoint URL:** `http://localhost:8000/totp/verify`
* **Body:**

  ```json
  {
    "totp": "528491",
    "url_slug": "dream_within_a_dream"
  }
  ```
* **Response (200):**

  ```json
  {
    "upload_token": "<SHORT_LIVED_JWT>"
  }
  ```

---

## Notes

* TOTP secrets are stored encrypted in the database.
* The provisioning URI can be used to generate a QR code for authenticator apps.
* Upload tokens are short-lived JWTs specifically for file upload operations.
* The `/verify` endpoint is public and does not require authentication.
