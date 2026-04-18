## Overview

This router handles Google Drive operations: creating folders/subfolders during upload, updating the user's Drive folder settings, and generating resumable upload URLs.

All endpoints require either an **Upload Token** (for upload-time operations) or a **JWT access token** (for setup/dashboard operations).

---

### **Test Case 1: Create Folder/Subfolder (Upload Token)**

Creates a folder or subfolder in Google Drive during the upload flow. Used by the frontend to create folder structures when users drag-and-drop folders.

* **HTTP Method:** `POST`
* **Endpoint URL:** `http://localhost:8000/drive/folder`
* **Authentication:** Upload Token (from `/totp/verify`)
* **Request Headers:**

  ```http
  Authorization: Bearer <UPLOAD_TOKEN>
  Content-Type: application/json
  ```
* **Body:**

  ```json
  {
    "folder_name": "Photos",
    "parent_folder_id": "1AbCdEfGhIjKlMnOpQrStUvWxYz"
  }
  ```

  * `folder_name` (required): Name of the folder to create
  * `parent_folder_id` (optional): ID of the parent folder. If omitted, creates at the Drive root.

* **Expected Successful Response (200):**

  ```json
  {
    "folder_id": "1XyZaBcDeFgHiJkLmNoPqRsTuVw"
  }
  ```

* **Expected Error Responses:**
  * **401 Unauthorized** – Missing or invalid upload token, or missing access token in payload
  * **500 Internal Server Error** – Google Drive API failure

---

### **Test Case 2: Update Drive Folder (JWT Access Token)**

Creates a new Google Drive folder and updates the user's folder settings. Used during initial setup and from the "Setup Folder" page. Basically, telling J.A.R.V.I.S. where to store things.

* **HTTP Method:** `PATCH`
* **Endpoint URL:** `http://localhost:8000/drive/folder`
* **Authentication:** Required (regular JWT)
* **Request Headers:**

  ```http
  Authorization: Bearer <ACCESS_TOKEN>
  Content-Type: application/json
  ```
* **Body:**

  ```json
  {
    "folder_name": "My Upload Folder",
    "drive_type": "GOOGLE_DRIVE"
  }
  ```

  * `folder_name` (required): Alphanumeric with spaces and hyphens (pattern: `^[a-zA-Z0-9\s-]+$`)
  * `drive_type` (required): Currently only `GOOGLE_DRIVE` is supported

* **Expected Successful Response (200):**

  ```json
  {
    "folder_id": "1AbCdEfGhIjKlMnOpQrStUvWxYz",
    "folder_name": "My Upload Folder"
  }
  ```

* **Expected Error Responses:**
  * **401 Unauthorized** – Missing or invalid JWT
  * **404 Not Found** – Auth secret not found for the user
  * **422 Unprocessable Entity** – Validation error (invalid folder name or drive type)
  * **500 Internal Server Error** – Database or Google Drive API failure

---

### **Test Case 3: Get Google Drive Upload Link**

Generates a Google Drive resumable upload URL for a file. The file will be uploaded directly to Google Drive using this URL. No S.H.I.E.L.D. middlemen.

* **HTTP Method:** `POST`
* **Endpoint URL:** `http://localhost:8000/drive/upload-link`
* **Authentication:** Upload Token (from `/totp/verify`)
* **Request Headers:**

  ```http
  Authorization: Bearer <UPLOAD_TOKEN>
  Content-Type: application/json
  ```
* **Body:**

  ```json
  {
    "file_name": "World Government Secrets.pdf",
    "mime_type": "application/pdf",
    "parent_folder_id": "1AbCdEfGhIjKlMnOpQrStUvWxYz"
  }
  ```

  * `file_name` (required): Name of the file (1–255 chars)
  * `mime_type` (required): MIME type of the file
  * `parent_folder_id` (optional): ID of the folder to upload into. If omitted, falls back to the token's `folder_id`.

* **Expected Successful Response (200):**

  ```json
  {
    "upload_url": "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=....."
  }
  ```

  Use this URL with a `PUT` request to upload the file content directly to Google Drive.

* **Expected Error Responses:**
  * **401 Unauthorized** – Missing/invalid upload token, missing access token, or missing folder ID in payload
  * **500 Internal Server Error** – Google Drive did not return an upload URL

---

## Notes

* **Two auth modes:** `POST /drive/folder` and `POST /drive/upload-link` use the short-lived **upload token** (from TOTP verification). `PATCH /drive/folder` uses the regular **JWT access token** (for authenticated users on setup/dashboard pages).
* The upload token contains `google_access_token`, `folder_id`, `folder_name`, and `url_slug` in its payload.
* Upload tokens expire after 15 minutes.
* The `parent_folder_id` in `POST /drive/upload-link` overrides the token's `folder_id` when specified, enabling subfolder uploads.
