## Frontend Overview

The frontend is built with Next.js 14 (App Router) and Material-UI (MUI) for the user interface. It provides the following pages for the TOTP-based secure upload system.

---

## Setup Instructions

### Step 1: Create Next.js Project

In the project root directory, run:

```bash
npx create-next-app@latest frontend
```

When prompted, use the following custom settings (do not use defaults):

- **TypeScript?** → `Yes`
- **ESLint?** → `Yes`
- **React compiler?** → `No`
- **Tailwind CSS?** → `No`
- **src/ directory?** → `Yes`
- **App Router?** → `Yes`
- **Import alias?** → `No`

### Step 2: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 3: Install Dependencies

```bash
npm install @mui/material @mui/material-nextjs @emotion/cache @emotion/react @emotion/styled @mui/icons-material @fontsource/roboto framer-motion
```

### Step 4: Configure Git Ignore

Add the following lines to your `.gitignore` file (create one if it doesn't exist):

```gitignore
# Ignore node_modules in root and all subfolders
node_modules/
*/node_modules/

# Ignore Next.js builds
.next/
*/.next/
```

### **Step 5: Run the project on dev server (for testing)**

```powershell
npm run dev
```
