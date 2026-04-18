'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import type { User } from '@/types/user.types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, userData: User) => void;
    signOut: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();

        // Listen for storage changes from other tabs (for multi-tab sign out sync)
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'token' && event.newValue === null) {
                // Token was removed in another tab, sync sign out here
                setUser(null);
                router.push('/login');
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [router]);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            // Verify token with backend
            const response = await api.get('/auth/me');
            setUser(response.data);
        } catch (error) {
            console.error('Auth verification failed:', error);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        setUser(userData);

        // Determine where to redirect based on user's setup status
        // Order: TOTP setup → Upload link → Folder setup → Dashboard
        if (!userData.totp_secret) {
            localStorage.setItem('totp_mode', 'first');
            router.push('/setup-totp');
        } else if (!userData.url_slug) {
            router.push('/setup-link');
        } else if (!userData.folder_id) {
            router.push('/setup-folder');
        } else {
            router.push('/dashboard');
        }
    };

    const signOut = () => {
        // Complete session cleanup - remove all app-related data
        localStorage.removeItem('token');
        localStorage.removeItem('totp_mode');
        localStorage.removeItem('folder_mode');
        localStorage.removeItem('skip_totp_setup');
        localStorage.removeItem('skip_folder_setup');

        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            signOut,
            checkAuth
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
