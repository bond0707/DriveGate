import type { Metadata } from 'next';
import DashboardClient from './Dashboard.client';

export const metadata: Metadata = {
    title: 'Dashboard',
    description: 'Manage your DriveGate upload settings, view your TOTP code, and configure your upload link.',
};

export default function DashboardPage() {
    return <DashboardClient />;
}