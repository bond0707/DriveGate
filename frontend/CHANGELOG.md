# Changelog

All notable changes to the frontend are documented in this file.

---

## [10-01-2026]

### Changed
- **Slug Page Dropzone** - Hidden when uploading or all files successfully uploaded
- **TOTP Error Handling** - Inline error display without page redirection

### Fixed
- Fixed dropzone remaining visible during upload transition delay

---

## [09-01-2026] - `13c054f`

### Added
- **Landing Page Components** - Split into modular sections:
  - `HeroSection.tsx` - Main hero with animations
  - `FeaturesSection.tsx` - Feature highlights
  - `TutorialSection.tsx` - Step-by-step guide
  - `ProblemSolutionSection.tsx` - Problem/solution layout
  - `TrustSection.tsx` - Trust indicators
  - `FAQSection.tsx` - FAQ accordion
  - `FooterSection.tsx` - Footer with links
- **Animation Components**:
  - `AnimatedSection.tsx` - Section animations
  - `SmoothScrollProvider.tsx` - Smooth scroll behavior
  - `TextReveal.tsx` - Text reveal animations

### Changed
- Updated `[slug]/page.tsx`, `dashboard/page.tsx`, `login/page.tsx`
- Updated `setup-folder/page.tsx`, `setup-link/page.tsx`
- Added `setup-totp/page.tsx`

---

## [08-01-2026] - `ee10e55`, `3411508`, `da7c8ef`

### Changed
- **TOTP Setup UX** - Improved with split input fields (`3411508`)
- **Rollback and fixes** - Fixed `api.ts`, `theme.ts` issues (`ee10e55`)
- **Merge conflict resolution** - Dashboard and Slug pages (`da7c8ef`)

### Fixed
- Renamed `setup-totp/page.tsx` → `totp-setup/page.tsx` (rollback)

---

## [08-01-2026] - `e274896`

### Added
- **Auth Callback Page** - `auth/google/callback/page.tsx`
- **Auth Context** - `context/AuthContext.tsx`
- **API Library** - `lib/api.ts` with axios configuration

### Changed
- Integrated frontend with backend
- Fixed drive permission handling
- Improved duplicated slug error handling
- Updated theme configuration

---

## [06-01-2026] - `0775558`, `88b72a3`

### Added
- **CHANGELOG.md** - Initial changelog
- **Custom Logos**:
  - `logo-dark.svg` - Dark mode logo
  - `logo-light.svg` - Light mode logo
- **Setup Folder Page** - `setup-folder/page.tsx`

### Changed
- Renamed `totp-setup/page.tsx` → `setup-totp/page.tsx`
- Updated favicon
- Updated `ThemeToggle.tsx` with warm amber sun icon
- Updated dashboard, login, layout, slug, and setup-link pages

---

## [03-01-2026] - `8ea828e`, `8abdea5`

### Added
- **Setup Documentation** - `setup.md`

---

## [16-12-2025] - `e358122`

### Added
- **Initial Frontend Application**:
  - Next.js project setup with TypeScript
  - Pages: `[slug]`, `dashboard`, `login`, `setup-link`, `totp-setup`
  - Components: `SquircleLoader.tsx`, `ThemeToggle.tsx`
  - Theme configuration: `theme.ts`
  - Global styles: `globals.css`

---

## [13-12-2025] - `3c4f245`

### Added
- Initial commit with placeholder file

---

## Files Summary

### Pages
| File | Description |
|------|-------------|
| `[slug]/page.tsx` | Public upload page with TOTP verification |
| `dashboard/page.tsx` | User dashboard with TOTP, link, and folder cards |
| `login/page.tsx` | Google OAuth login page |
| `setup-folder/page.tsx` | Drive folder configuration |
| `setup-link/page.tsx` | URL slug setup |
| `setup-totp/page.tsx` | TOTP setup with QR code |
| `auth/google/callback/page.tsx` | OAuth callback handler |

### Components
| File | Description |
|------|-------------|
| `SquircleLoader.tsx` | Animated loading spinner |
| `ThemeToggle.tsx` | Dark/light mode toggle |
| `StyledQRCode.tsx` | Styled QR code component |
| `AnimatedSection.tsx` | Section animation wrapper |
| `SmoothScrollProvider.tsx` | Smooth scroll context |
| `TextReveal.tsx` | Text reveal animation |
| `landing/*.tsx` | Landing page section components |
