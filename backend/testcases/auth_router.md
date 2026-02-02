## Overview

This router handles authentication, Google OAuth login, JWT issuance, user profile access, account deletion, Google Drive folder management, and token validation.

All protected endpoints require a valid **JWT access token** issued by this service.

---

### **Test Case 1: Get Google Login URL (Returning Users)**

This is the first step to initiate the OAuth 2.0 flow for **returning users**.

* **HTTP Method:** `GET`
* **Endpoint URL:** `http://localhost:8000/auth/google/login?force_consent=false`
* **Query Parameters:**
  * `force_consent` (required): `true` or `false`
    * `false` - Streamlined login with `prompt=select_account` (for returning users)
    * `true` - Full consent screen with `prompt=consent` (for new users)
* **Request Headers:** None
* **Expected Successful Response (HTTP 200):**
  ```json
  {
    "auth_url": "https://accounts.google.com/o/oauth2/v2/auth?...&prompt=select_account"
  }
  ```

---

### **Test Case 1b: Get Google Login URL (New Users / Sign Up)**

Initiates OAuth 2.0 flow with full consent for **new users** who need to grant Drive permissions.

* **HTTP Method:** `GET`
* **Endpoint URL:** `http://localhost:8000/auth/google/login?force_consent=true`
* **Expected Successful Response (HTTP 200):**
  ```json
  {
    "auth_url": "https://accounts.google.com/o/oauth2/v2/auth?...&prompt=consent"
  }
  ```

* **Note:** New users MUST use `force_consent=true` to grant Drive permissions and receive a `refresh_token`.

---

### **Test Case 2: Handle OAuth Callback**

This endpoint exchanges the authorization code from Google for tokens, creates/updates the user.

* **HTTP Method:** `POST`
* **Endpoint URL:** `http://localhost:8000/auth/google/callback`
* **Request Input (JSON Body):**

  ```json
  {
    "code": "4/0AfJohXk9mR8T7dEXAMPLE_CODE_LqH5k9KfKpBw",
    "state": "optional_csrf_token_12345"
  }
  ```

  * **`code`**: You get this from Google's redirect URL after a user logs in (e.g., `http://localhost:8000/auth/google/callback?code=4/0AfJohXk...`).
  * **`state`**: An optional parameter for security, used to prevent CSRF attacks.
* **Request Headers:**

  ```http
  Content-Type: application/json
  ```
* **Expected Successful Response (HTTP 200):**

  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "google_uuid": "110248495921238986420",
      "username": "Test User",
      "email": "koffandaff@gmail.com",
      "totp_secret": null,
      "drive_folder_id": "1AbCdEfGhIjKlMnOpQrStUvWxYz",
      "upload_url": null
    }
  }
  ```

  * **`access_token`**: A JWT token your frontend must save and use for subsequent requests.
  * **`drive_folder_id`**: The ID of the "TOTP_UPLOADER" folder created in the user's Google Drive.

* **Expected Error Response (HTTP 409) - New User Needs Consent:**
  
  If a new user used `force_consent=false` (clicked "Sign in" instead of "Sign up"), no `refresh_token` is provided:
  
  ```json
  {
    "detail": "Consent Required for this user."
  }
  ```
  
  The frontend should detect this and redirect the user to sign up with `force_consent=true`.

---

### **Test Case 3: Get Current User (Protected Endpoint)**

This protected endpoint validates the JWT token and returns the user's profile information.

* **HTTP Method:** `GET`
* **Endpoint URL:** `http://localhost:8000/auth/me`
* **Request Input:** None (token is in the header)
* **Request Headers:**

  ```http
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

  * Use the `access_token` from the **Test Case 2** response.
* **Expected Successful Response (HTTP 200):**

  ```json
  {
    "id": 1,
    "google_uuid": "110248495921238986420",
    "username": "Test User",
    "email": "koffandaff@gmail.com",
    "totp_secret": null,
    "drive_folder_id": "1AbCdEfGhIjKlMnOpQrStUvWxYz",
    "upload_url": null
  }
  ```

---

### **Test Case 4: Validate Token**

This endpoint quickly checks if a provided JWT token is valid without querying the full user from the database.

* **HTTP Method:** `GET`
* **Endpoint URL:** `http://localhost:8000/auth/validate-token`
* **Request Input:** Pass the token as a query parameter.
* **Request URL Example:**

  ```
  http://localhost:8000/auth/validate-token?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

  * Use the `access_token` from the **Test Case 2** response.
* **Expected Successful Response (HTTP 200):**

  ```json
  {
    "valid": true,
    "user_id": 1,
    "email": "koffandaff@gmail.com"
  }
  ```

---

### Test Case 5: Delete Current User (Protected Endpoint)

Deletes the authenticated user and all associated records.

* **HTTP Method:**`DELETE`
* **Endpoint:**`/auth/me`
* **Authentication:**  Required

### Headers

```http
Authorization: Bearer 
```

### Successful Response (200)

**json**

```json
{
  "username": "Tony Stark"
}
```

### Error Responses

* **401 Unauthorized** – Missing or invalid JWT
* **500 Internal Server Error** – Deletion failure

---

### **Test Case 6: Create/Update Drive Folder**

This protected endpoint allows the user to create a new Google Drive folder in their drive and update their Drive folder settings. It is required to run `Test Case 2` before testing this endpoint.

* **HTTP Method:** `POST`
* **Endpoint URL:** `http://localhost:8000/auth/me/update-drive-folder`
* **Request Input (JSON Body):**

  ```json
  {
    "folder_name": "My New Folder",
    "drive_type": "GOOGLE_DRIVE"
  }
  ```

  * **`folder_name`**: The desired name for the new Drive folder.
  * **`drive_type`**: Currently only `GOOGLE_DRIVE` is supported (as per the enum).
* **Request Headers:**

  ```http
  Content-Type: application/json
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

  * The JWT token obtained from the OAuth callback (Test Case 2) must be provided.
* **Expected Successful Response (HTTP 200):**

  ```json
  {
    "folder_id": "1AbCdEfGhIjKlMnOpQrStUvWxYz",
    "folder_name": "My New Folder"
  }
  ```

  * **`folder_id`**: The ID of the newly created Drive folder.
  * **`folder_name`**: The name of the folder (as provided in the request).
* **Expected Error Response (HTTP 422):**
  If the request body fails validation (e.g., missing required fields or invalid drive_type), the server will return a validation error.

  ```json
  {
    "detail": [
      {
        "loc": ["body", "folder_name"],
        "msg": "field required",
        "type": "value_error.missing"
      }
    ]
  }
  ```

---

### Test Case 7: Validate URL Slug (Public Endpoint)

Validates if a URL slug exists and is associated with a user.

* **HTTP Method:**`GET`
* **Endpoint:**`/auth/validate-slug`
* **Authentication:**  Not required

### Query Parameters

```html
url_slug=<URL_SLUG>
```

### Successful Response (200)

```json
{
  "message": "Url slug is valid!"
}
```

### Error Responses

* **404 Not Found** – URL slug is invalid or not found
* **500 Internal Server Error** – Database error

---

### **Test Flow and Notes**

1. **Sign In vs Sign Up:**
   * **Returning users** should use **Test Case 1** (`force_consent=false`) for a streamlined experience.
   * **New users** should use **Test Case 1b** (`force_consent=true`) to grant Drive permissions.
   * If a new user mistakenly uses Sign In, they will receive a **409 CONFLICT** error, and the frontend will guide them to Sign Up.

2. **Manual Flow for Getting a Code:** To test, open the `auth_url` from **Test Case 1** or **1b** in your browser, log in with your test account, and copy the `code` from the redirected URL.

3. **Testing Protected Endpoints:** Endpoints `/auth/me` and `/auth/validate-token` require a valid JWT. You must complete **Test Case 2** first to obtain this token.
