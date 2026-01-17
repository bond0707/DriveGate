import type { Metadata } from "next";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from "../theme";
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://drivedrop.app'),
  title: {
    default: "DriveGate",
    template: "%s | DriveGate",
  },
  description: "The one-way entrance to your private cloud.",
  openGraph: {
    title: 'DriveGate',
    description: 'The one-way entrance to your private cloud.',
    url: '/',
    siteName: 'DriveGate',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DriveGate',
    description: 'The one-way entrance to your private cloud.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme} defaultMode="system">
            <CssBaseline />
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}