# Changelog

## [Unreleased] - 2026-01-06

### Added

#### New Pages
- **Setup Folder Page** (`/setup-folder`) - New page for configuring Google Drive folder name
  - Integrated into new user setup pipeline: TOTP → Link → Folder → Dashboard
  - Supports update mode with X button to return to dashboard

#### Dashboard Enhancements
- **Upload Folder Card** - New third card displaying the configured folder name with "Change" button
- **Delete Account Feature** - Menu item in user avatar dropdown with confirmation dialog
  - Warning dialog with amber icon
  - Clears all localStorage data
  - Shows "Thank You" dialog before redirecting to login

#### Custom Branding
- **Custom Logo Support** - Added theme-aware logo switching
  - `logo-light.svg` for light mode
  - `logo-dark.svg` for dark mode
  - Logo displayed in dashboard app bar and login page headers

#### UX Improvements
- **TOTP Input Sequential Validation** - Boxes are disabled until previous boxes are filled
- **Auto-focus** - First TOTP box auto-focuses when entering verification step
- **Browser Back Button Handling**
  - Setup pages cleanup localStorage properly on back navigation
  - Slug page shows warning dialog: "You'll need to re-enter your TOTP code and any selected files and upload progress will be lost"
- **Silent Auto-refresh** - Slug page resets after 5 seconds without visible countdown

### Changed

#### Page Renames
- Renamed `totp-setup` → `setup-totp` for consistency with other setup pages

#### Color Theme Updates
- **Secondary Color** - Changed from coral/orange to rich indigo/purple (`#5C6BC0`)
- **TOTP Icon** - Unified to deep teal (`#0D9488`) across dashboard, setup-totp, and slug pages
- **Phone Icon** - Changed to distinct coral/pink (`#EC4899`) on setup-totp page
- **Folder Icon** - Changed to amber/gold (`#F59E0B`)
- **Account Avatar** - Changed to outlined style with teal border (`#0D9488`)
- **Theme Toggle Sun Icon** - Changed from `LightMode` to `WbSunny` with warm amber color (`#FFA726`)

#### Redirect Logic
- **Rescan/Reset TOTP** - Now redirects directly to dashboard instead of going through full setup pipeline
- **Setup Pages Close Button** - Properly handles navigation back to dashboard without triggering setup pipeline

### Fixed

- Fixed delete dialog button symmetry (removed icon from delete button for equal width)
- Fixed folder setup redirect loop when closing setup page
- Fixed TOTP reset back button causing redirect loop
- Fixed TOTP input allowing non-sequential digit entry
- Fixed theme toggle showing purple sun icon instead of warm amber
- **Fixed deprecated `PaperProps`** - Replaced with `slotProps.paper` in all Dialog components

### Technical

- Added `useColorScheme` hook for proper theme mode detection
- Added `popstate` event handlers for browser back button navigation
- Added `setTimeout` delays for React state updates before focusing inputs
- Replaced deprecated MUI `PaperProps` with modern `slotProps.paper` pattern

---

### Files Modified
- `frontend/src/app/[slug]/page.tsx`
- `frontend/src/app/dashboard/page.tsx`
- `frontend/src/app/layout.tsx`
- `frontend/src/app/login/page.tsx`
- `frontend/src/app/setup-link/page.tsx`
- `frontend/src/components/ThemeToggle.tsx`
- `frontend/src/theme.ts`
- `frontend/src/app/favicon.ico`

### Files Added
- `frontend/src/app/setup-folder/page.tsx`
- `frontend/src/app/setup-totp/page.tsx` (renamed from totp-setup)
- `frontend/public/logo-light.svg`
- `frontend/public/logo-dark.svg`

### Files Deleted
- `frontend/src/app/totp-setup/page.tsx` (renamed to setup-totp)
