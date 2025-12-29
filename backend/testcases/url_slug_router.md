## Overview

This router handles the management of custom URL slugs that users can set for their personal upload endpoints.

### **Test Case 1: Update User's URL Slug**

This endpoint allows a user to set or change their unique URL slug, which will be used to create their personal upload endpoint (`/{url_slug}`).

* **HTTP Method:** `PATCH`
* **Endpoint URL:** `http://localhost:8000/url/update`
* **Request Input (Form Data):**

  ```json
  {
    "url_slug": "my_custom_endpoint"
  }
  ```
  * **`url_slug`**: The custom URL-friendly string the user wants to use for their upload endpoint. Should be alphanumeric with hyphens (no spaces or special characters). (Validation to be done in NextJS)
* **Request Headers:**

  ```http
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
  ```
  * Requires a valid JWT access token from authentication.
* **Expected Successful Response (HTTP 200):**

  ```json
  {
    "url_slug": "my_custom_endpoint"
  }
  ```
* **Expected Error Responses:**

  * **HTTP 400 Bad Request**: If the URL slug is invalid (contains special characters, spaces, or is too long/short).
  * **HTTP 409 Conflict**: If the URL slug is already taken by another user.
  * **HTTP 500 Internal Server Error**: If database update fails.
