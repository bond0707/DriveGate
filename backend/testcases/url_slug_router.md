## Overview

This router manages custom URL slugs and Google Drive upload link generation.

### **Test Case 1: Update User URL Slug**

* **HTTP Method:** `PATCH`
* **Endpoint URL:** `http://localhost:8000/url/update`
* **Request Headers:**

  ```http
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
  ```

  * Requires a valid JWT access token from authentication.
* **Body:**

  ```json
  {
    "url_slug": "dream_within_a_dream"
  }
  ```
* `url_slug`: The custom URL-friendly string the user wants to use for their upload endpoint. Should be alphanumeric with hyphens (no spaces or special characters). (Validation to be done in NextJS).

  **Expected Successful Response (200):**

  ```json
  {
    "url_slug": "limbo"
  }
  ```

  **Expected Error Responses:**

  * **HTTP 400 Bad Request**: If the URL slug is invalid (contains special characters, spaces, or is too long/short).
  * **HTTP 409 Conflict**: If the URL slug is already taken by another user.
  * **HTTP 500 Internal Server Error**: If database update fails.

---

### **Test Case 2: Get Google Drive Upload Link**

* **HTTP Method:** `POST`
* **Endpoint URL:** `http://localhost:8000/url/get-upload-link`
* **Headers:**
  Requires an **Upload Token** that is returned by `http://localhost:8000/totp/verify`  **(Check totp_router.md)**

  ```http
  Authorization: Bearer <UPLOAD_TOKEN>
  ```
* **Body:**

  ```json
  {
    "file_name": "World Government Secrets.pdf",
    "file_size": 5242880,
    "mime_type": "application/pdf",
    "md5_checksum": "d41d8cd98f00b204e9800998ecf8427e"
  }
  ```
* **Response (200):**

  ```json
  {
    "upload_url": "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=....."
  }
  ```
