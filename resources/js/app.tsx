import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Arusantara';

const publicPages = new Set([
    'welcome',
    'platform',
    'engineering',
    'cara-kerja',
    'permintaan-penawaran',
    'solusi',
    'pemilik-usaha',
    'panel-makers',
    'procurement',
    'informasi',
    'insight',
    'info-platform',
    'kontak',
    'pengetahuan-dasar',
    'learn',
    'tutorial',
    'academy',
    'about',
    'faq',
]);

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        if (publicPages.has(name)) {
            return null;
        }

        if (name.startsWith('auth/')) {
            return AuthLayout;
        }

        if (name.startsWith('settings/')) {
            return [AppLayout, SettingsLayout];
        }

        return AppLayout;
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#153F32',
    },
});

initializeTheme();
