import * as React from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import type { AppVariant } from '@/types';

type Props = React.ComponentProps<'main'> & {
    variant?: AppVariant;
};

export function AppContent({ variant = 'sidebar', children, ...props }: Props) {
    if (variant === 'sidebar') {
        return <SidebarInset {...props}>{children}</SidebarInset>;
    }

    return (
        <main
            className="flex min-h-[calc(100vh-60px)] w-full flex-1 flex-col bg-[#f7f5ef] dark:bg-[#101512]"
            {...props}
        >
            {children}
        </main>
    );
}
