# DriveGate

A web app that lets users upload files directly to their own Google Drive — without logging in — using TOTP verification.

## Schema Diagram

[Click here to view the schema diagram.](https://drawsql.app/teams/goon-squad/diagrams/schema-diagram "Drivegate Schema Diagram")

---

## Architecture Flows

### 1. Google OAuth Sign-Up Flow

First-time users sign up with Google, granting Drive permissions. This creates their account and links their Google Drive.

```mermaid
%%{init: {'theme': 'dark'}}%%
sequenceDiagram
    participant User
    participant Frontend as Next.js Frontend
    participant Proxy as Next.js /api Proxy
    participant Backend as FastAPI Backend
    participant Google as Google OAuth

    User->>Frontend: Click "Sign up with Google"
    Frontend->>Proxy: GET /auth/google/login?force_consent=true
    Proxy->>Backend: forward
    Backend-->>Frontend: auth_url (with prompt=consent)
    Frontend->>Google: Redirect to auth_url
    Google-->>Frontend: Redirect with ?code=...

    Frontend->>Proxy: POST /auth/google/callback { code }
    Proxy->>Backend: forward
    Backend->>Google: Exchange code → access_token + refresh_token
    Backend->>Google: GET /userinfo (email, name, picture)
    Backend->>Backend: Create user + user_auth + user_drive records
    Backend->>Backend: Generate JWT (type: "access")
    Backend-->>Frontend: { access_token, user }
    Frontend->>Frontend: Store JWT, redirect to /dashboard
```

> **Note:** Returning users use `force_consent=false` which skips the consent screen. If a new user accidentally clicks "Sign In", they get a `409 CONFLICT` and the frontend guides them to sign up.

---

### 2. TOTP Setup Flow

After signing up, users configure TOTP to secure their upload link.

```mermaid
%%{init: {'theme': 'dark'}}%%
sequenceDiagram
    participant User
    participant Frontend as Next.js Frontend
    participant Proxy as Next.js /api Proxy
    participant Backend as FastAPI Backend

    User->>Frontend: Navigate to /setup-totp
    Frontend->>Proxy: GET /totp/secret
    Proxy->>Backend: forward (JWT auth)
    Backend->>Backend: Generate random TOTP secret + provisioning URI
    Backend-->>Frontend: { totp_secret, provisioning_uri }

    Frontend->>Frontend: Render QR code from provisioning_uri
    User->>User: Scan QR code with authenticator app
    User->>Frontend: Enter 6-digit code from app

    Frontend->>Proxy: POST /totp/secret { user_totp, user_totp_secret }
    Proxy->>Backend: forward (JWT auth)
    Backend->>Backend: Verify TOTP code against secret
    Backend->>Backend: Encrypt & store secret in DB
    Backend-->>Frontend: { message: "TOTP Secret successfully stored" }
```

---

### 3. Upload Flow (Files & Folders)

The core flow — a remote user uploads files to the account owner's Google Drive via TOTP verification.

```mermaid
%%{init: {'theme': 'dark'}}%%
sequenceDiagram
    participant User as Remote User
    participant Frontend as Next.js Frontend
    participant Proxy as Next.js /api Proxy
    participant Backend as FastAPI Backend
    participant Google as Google Drive API

    User->>Frontend: Open /my-upload-slug
    Frontend->>Proxy: POST /url/slug/validate { url_slug }
    Proxy->>Backend: forward
    Backend-->>Frontend: { message: "Url slug is valid!" }

    User->>Frontend: Enter 6-digit TOTP
    Frontend->>Proxy: POST /totp/verify { totp, url_slug }
    Proxy->>Backend: forward
    Backend->>Backend: Verify TOTP (with rate limiting)
    Backend->>Google: Refresh token → access token
    Backend->>Backend: Create upload JWT (15-min TTL)
    Backend-->>Frontend: upload_token<br/>contains: google_access_token, folder_id, folder_name, url_slug

    opt Folder Upload (drag-and-drop)
        Frontend->>Frontend: Detect folder structure from file.path
        Frontend->>Frontend: Show confirmation dialog
        loop Create folder tree (depth-first)
            Frontend->>Proxy: POST /drive/folder { folder_name, parent_folder_id }
            Proxy->>Backend: forward (upload token auth)
            Backend->>Google: Create folder in Drive
            Backend-->>Frontend: { folder_id }
        end
    end

    loop Per file (concurrent)
        Frontend->>Proxy: POST /drive/upload-link { file_name, mime_type, parent_folder_id }
        Proxy->>Backend: forward (upload token auth)
        Backend->>Google: Initiate resumable upload → Location URL
        Backend-->>Frontend: { upload_url }
        Frontend->>Google: PUT file bytes to upload_url (direct)
    end
```

---

### 4. Drive Folder Setup Flow

Users configure which Google Drive folder receives uploads.

```mermaid
%%{init: {'theme': 'dark'}}%%
sequenceDiagram
    participant User
    participant Frontend as Next.js Frontend
    participant Proxy as Next.js /api Proxy
    participant Backend as FastAPI Backend
    participant Google as Google Drive API

    User->>Frontend: Navigate to /setup-folder
    User->>Frontend: Enter folder name
    Frontend->>Proxy: PATCH /drive/folder { folder_name, drive_type }
    Proxy->>Backend: forward (JWT auth)
    Backend->>Backend: Get refresh token from DB
    Backend->>Google: Refresh token → access token
    Backend->>Google: Create folder in Drive
    Backend->>Backend: Store folder_id + folder_name in DB
    Backend-->>Frontend: { folder_id, folder_name }
```

---

### 5. URL Slug Setup Flow

Users configure their custom upload URL.

```mermaid
%%{init: {'theme': 'dark'}}%%
sequenceDiagram
    participant User
    participant Frontend as Next.js Frontend
    participant Proxy as Next.js /api Proxy
    participant Backend as FastAPI Backend

    User->>Frontend: Navigate to /setup-link
    User->>Frontend: Type desired slug

    loop Real-time check
        Frontend->>Proxy: POST /url/slug/check-availability { url_slug }
        Proxy->>Backend: forward (JWT auth)
        Backend-->>Frontend: { available: true/false }
    end

    User->>Frontend: Confirm slug
    Frontend->>Proxy: PATCH /url/slug { url_slug }
    Proxy->>Backend: forward (JWT auth)
    Backend->>Backend: Update url_slug in DB (unique constraint)
    Backend-->>Frontend: { url_slug }
```

---

## Project Structure

```
DriveGate/
├── frontend/                    # Next.js application
│   ├── src/app/
│   │   ├── [slug]/              # Public upload page (TOTP → upload)
│   │   ├── dashboard/           # User dashboard
│   │   ├── login/               # Google OAuth login
│   │   ├── setup-totp/          # TOTP configuration
│   │   ├── setup-folder/        # Drive folder setup
│   │   ├── setup-link/          # URL slug setup
│   │   └── auth/google/callback # OAuth callback
│   └── CHANGELOG.md
│
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth_router.py       # /auth/* — OAuth, user profile, token validation
│   │   │   ├── totp_router.py       # /totp/* — TOTP setup and verification
│   │   │   ├── url_slug_router.py   # /url/*  — URL slug management
│   │   │   └── drive_router.py      # /drive/* — Folder creation, upload links
│   │   ├── services/
│   │   │   ├── google_auth_service.py   # OAuth token management
│   │   │   ├── google_drive_service.py  # Drive API operations
│   │   │   ├── totp_service.py          # TOTP generation/verification
│   │   │   └── user_service.py          # User CRUD
│   │   ├── models/                  # SQLAlchemy models
│   │   ├── schemas/                 # Pydantic request/response models
│   │   └── utils/
│   │       ├── jwt_manager.py       # JWT creation/validation
│   │       ├── dependencies.py      # Route dependencies
│   │       └── rate_limiter.py      # TOTP brute-force protection
│   ├── testcases/                   # API test documentation
│   └── CHANGELOG.md
│
└── README.md
```

---

## Future Updates

- [ ] Add actual user CRUD
- [ ] It is possible to remove "/setup-folder" flow entirely
- [ ] Proper validation required for URL slugs and other similar stuff at all three levels (frontend, backend, database)
- [ ] Frontend code should be refactored since it has grown too much
- [ ] Add multiple accounts from same providers functionality
- [ ] **Redis Integration** — Replace in-memory caches with Redis for:
  - Rate limiter (TOTP brute-force protection)
  - Google access token cache (currently 55-min in-memory TTL)

## Bugs To Fix

- [ ] If a user goes to their upload URL, opens another tab, changes their upload URL, and then enters the TOTP in the tab with the old URL, it shows `Database Error: No totp_secret found for the url slug: my_slug`. This is correct behaviour but just needs graceful error handling on the frontend side. (and similar bugs)
