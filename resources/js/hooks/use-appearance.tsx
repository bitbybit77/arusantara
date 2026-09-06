import { useSyncExternalStore } from 'react';

export type ResolvedAppearance = 'light' | 'dark';
export type Appearance = ResolvedAppearance | 'system';

export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly resolvedAppearance: ResolvedAppearance;
    readonly updateAppearance: (mode: Appearance) => void;
};

const listeners = new Set<() => void>();
const fixedAppearance: Appearance = 'light';

const subscribe = (callback: () => void) => {
    listeners.add(callback);

    return () => listeners.delete(callback);
};

const setCookie = (name: string, value: string, days = 365): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyIndustrialTheme = (): void => {
    if (typeof document === 'undefined') {
        return;
    }

    document.documentElement.classList.remove('dark');
    document.documentElement.dataset.theme = 'industrial';
    document.documentElement.style.colorScheme = 'light';
};

export function initializeTheme(): void {
    if (typeof window === 'undefined') {
        return;
    }

    localStorage.setItem('appearance', fixedAppearance);
    setCookie('appearance', fixedAppearance);
    applyIndustrialTheme();
};

export function useAppearance(): UseAppearanceReturn {
    const appearance = useSyncExternalStore(
        subscribe,
        () => fixedAppearance,
        () => fixedAppearance,
    );

    const updateAppearance = (mode: Appearance): void => {
        void mode;

        localStorage.setItem('appearance', fixedAppearance);
        setCookie('appearance', fixedAppearance);
        applyIndustrialTheme();
    };

    return {
        appearance,
        resolvedAppearance: 'light',
        updateAppearance,
    } as const;
}
