## Overview

This router manages custom URL slugs for public upload links.

---

### **Test Case 1: Validate URL Slug (Public Endpoint)**

Validates if a URL slug exists and is associated with a user. Used by the frontend to check if an upload page should load.

* **HTTP Method:** `POST`
* **Endpoint:** `http://localhost:8000/url/slug/validate`
* **Authentication:** ❌ Not required

#### Request Body

```json
{
  "url_slug": "dream_within_a_dream"
}
```

#### Successful Response (200)

```json
{
  "message": "Url slug is valid!"
}
```

#### Error Responses

* **404 Not Found** – URL slug is invalid or not found
* **500 Internal Server Error** – Database error

---

### **Test Case 2: Update User URL Slug**

Updates the authenticated user's URL slug. The slug must be unique across all users.

* **HTTP Method:** `PATCH`
* **Endpoint URL:** `http://localhost:8000/url/slug`
* **Authentication:** Required
* **Request Headers:**

  ```http
  Authorization: Bearer <ACCESS_TOKEN>
  Content-Type: application/json
  ```
* **Body:**

  ```json
  {
    "url_slug": "dream_within_a_dream"
  }
  ```
* `url_slug`: The custom URL-friendly string the user wants for their upload endpoint. Should be alphanumeric with hyphens/underscores (letters, numbers, `-`, `_`).

  **Expected Successful Response (200):**

  ```json
  {
    "url_slug": "dream_within_a_dream"
  }
  ```

  **Expected Error Responses:**

  * **HTTP 400 Bad Request**: If the URL slug is invalid (contains special characters, spaces, or is too long/short).
  * **HTTP 409 Conflict**: If the URL slug is already taken by another user. Sorry, Cobb already claimed that one.
  * **HTTP 500 Internal Server Error**: If database update fails.

---

### **Test Case 3: Check Slug Availability**

Checks if a URL slug is available for use (real-time availability check for the setup UI).

* **HTTP Method:** `POST`
* **Endpoint:** `http://localhost:8000/url/slug/check-availability`
* **Authentication:** Required

#### Headers

```http
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

#### Request Body

```json
{
  "url_slug": "dream_within_a_dream"
}
```

#### Successful Response (200)

```json
{
  "available": true
}
```

#### Error Responses

* **401 Unauthorized** – Missing or invalid JWT
* **500 Internal Server Error** – Database error

---

## Notes

* URL slugs must be alphanumeric with hyphens and underscores.
* The `/slug/validate` endpoint is public and does not require authentication.
* The `/slug/check-availability` and `PATCH /slug` endpoints require a regular JWT access token.
