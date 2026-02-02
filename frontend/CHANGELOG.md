# Changelog

All notable changes to the frontend are documented in this file.

---

## [03-02-2026]

### Added

- **Dual Google Auth Buttons** - Login page now has separate cards for Sign in and Sign up:
  - "Sign in with Google" (`force_consent=false`) - Streamlined for returning users
  - "Sign up with Google" (`force_consent=true`) - Full consent for new users
  - Mobile header with logo + theme toggle positioned at top
  - Files: `Login.client.tsx`

- **New User Modal** - Shown when new users accidentally click "Sign in":
  - Redirects from callback with `?new_user=true` query param
  - Explains they need to sign up and connect their Drive
  - Includes "Sign up with Google" button to start proper flow
  - Backdrop blur effect, outlined "I'll do it later" button
  - Files: `Login.client.tsx`, `AuthCallback.client.tsx`

- **Multi-Tab Sign Out Sync** - Signing out in one tab automatically signs out all other tabs:
  - Uses `storage` event listener on localStorage changes
  - Detects token removal and redirects to login
  - File: `AuthContext.tsx`

- **Sign Out Confirmation Dialog** - Added confirmation modal before signing out:
  - Prevents accidental sign-outs
  - Consistent styling with delete account modal
  - File: `Dashboard.client.tsx`

### Changed

- **Terminology**: All "logout" references renamed to "signOut" throughout codebase:
  - Context: `logout()` → `signOut()`
  - Dashboard: `handleLogout` → `handleSignOut`, `logoutDialogOpen` → `signOutDialogOpen`
  - Menu item text: "Logout" → "Sign Out"
  - Files: `AuthContext.tsx`, `Dashboard.client.tsx`

- **Session Cleanup** - Sign out now removes all app-related localStorage keys:
  - `token`, `totp_mode`, `folder_mode`, `skip_totp_setup`, `skip_folder_setup`
  - File: `AuthContext.tsx`

---

## [20-01-2026]

### Fixed

- **TOTP Paste on Mobile** - Fixed copy-paste functionality for TOTP input on mobile devices:
  - Updated `handleOtpChange` to detect and handle multi-character input from mobile paste
  - Moved `onPaste` handler from parent Box to each TextField's `inputProps` for proper event capture
  - Changed `maxLength` from 1 to 6 to allow paste events to include all digits
  - Files: `SetupTOTP.client.tsx`, `PublicUpload.client.tsx`

### Changed

- **Invalid Link Modal** - Redesigned as a centered modal (like Contact Us modal) instead of floating notification:
  - Modal now appears centered on screen with backdrop blur
  - Added "Got it" button for manual dismissal
  - Click-to-dismiss backdrop support
  - Auto-dismisses after 5 seconds (previously 8 seconds)
  - File: `LandingPage.tsx`

---

## [19-01-2026]

### Added

- **Dynamic Page Titles** - Page titles now change based on context:
  - `setup-totp`: Shows "Rescan TOTP", "Reset TOTP", or "Setup TOTP" based on mode
  - `setup-folder`: Shows "Update Folder" or "Setup Folder" based on mode
  - `setup-link`: Shows "Update Upload Link" or "Setup Upload Link" based on mode

### Changed

- **Landing Page Text Justification** - Added `textAlign: justify` for mobile across all sections:
  - `HeroSection.tsx` - Hero description paragraph
  - `WhatIsSection.tsx` - Main description
  - `ProblemSolutionSection.tsx` - Problem and solution descriptions
  - `FeaturesSection.tsx` - Feature card descriptions
  - `UseCasesSection.tsx` - Subtitle and use case descriptions
  - `TrustSection.tsx` - Zero Trust and permission descriptions
  - `FAQSection.tsx` - FAQ answer text
- **Hero Section Styling**:
  - Increased `lineHeight` from 1.1 to 1.3 to prevent text clipping
  - Increased TOTP animation width on mobile (240→300, 280→340)
  - Increased TOTP animation padding on mobile (2.5→3)
- **Contact Modal** - Balanced margins (`mt: 2.5, mb: 2.5`) for email text
- **TOTP Secret Display** - Split 32-char secret into two 16-char lines on mobile with adjusted padding
- **Login Page**:
  - Mobile logo aligned to left instead of center
  - Changed to `useColorScheme()` for proper reactive theme detection
- **Delete Account Modal**:
  - Buttons stack vertically on mobile (Delete Account first, Cancel below)
  - Increased horizontal padding

### Fixed

- **Page Title Duplication** - Removed redundant ` | DriveGate` suffix from 9 pages:
  - `dashboard/page.tsx`: Dashboard
  - `setup-totp/page.tsx`: Setup TOTP
  - `setup-folder/page.tsx`: Setup Folder
  - `setup-link/page.tsx`: Setup Upload Link
  - `[slug]/page.tsx`: Secure Upload
  - `login/page.tsx`: Sign In
  - `privacy/page.tsx`: Privacy Policy
  - `terms/page.tsx`: Terms of Service
  - `auth/google/callback/page.tsx`: Signing In...

---

## Files Summary

### Pages

| File                              | Description                                      |
| --------------------------------- | ------------------------------------------------ |
| `[slug]/page.tsx`               | Public upload page with TOTP verification        |
| `dashboard/page.tsx`            | User dashboard with TOTP, link, and folder cards |
| `login/page.tsx`                | Google OAuth login page                          |
| `setup-folder/page.tsx`         | Drive folder configuration                       |
| `setup-link/page.tsx`           | URL slug setup                                   |
| `setup-totp/page.tsx`           | TOTP setup with QR code                          |
| `auth/google/callback/page.tsx` | OAuth callback handler                           |
| `privacy/page.tsx`              | Privacy policy page                              |
| `terms/page.tsx`                | Terms of service page                            |

### Components

| File                         | Description                     |
| ---------------------------- | ------------------------------- |
| `SquircleLoader.tsx`       | Animated loading spinner        |
| `ThemeToggle.tsx`          | Dark/light mode toggle          |
| `StyledQRCode.tsx`         | Styled QR code component        |
| `AnimatedSection.tsx`      | Section animation wrapper       |
| `SmoothScrollProvider.tsx` | Smooth scroll context           |
| `TextReveal.tsx`           | Text reveal animation           |
| `landing/*.tsx`            | Landing page section components |
