## Overview

This router handles Time-Based One-Time Password (TOTP) setup, storage, and verification for two-factor authentication.

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

### **Test Case 2: Verify and Store TOTP Secret**

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

### **Test Case 3: Verify TOTP and Get Upload Token (Public)**

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
