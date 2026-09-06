import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';

import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

const navItems: NavItem[] = [
    { title: 'Profil', href: edit(), icon: null },
    { title: 'Keamanan', href: editSecurity(), icon: null },
    { title: 'Tampilan', href: editAppearance(), icon: null },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="mx-auto w-full max-w-[980px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            <header className="border-b border-[#153f32]/10 pb-6">
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#18201d]">
                    Pengaturan
                </h1>
                <p className="mt-2 text-sm text-[#68736e]">
                    Kelola akun dan tampilan aplikasi.
                </p>
            </header>

            <nav className="mt-5 flex flex-wrap gap-1" aria-label="Pengaturan">
                {navItems.map((item, index) => (
                    <Link
                        key={`${toUrl(item.href)}-${index}`}
                        href={item.href}
                        className={cn(
                            'rounded-lg px-3 py-2 text-sm font-medium text-[#68736e] transition hover:bg-[#153f32]/[0.05] hover:text-[#153f32]',
                            {
                                'bg-[#153f32] text-white hover:bg-[#153f32] hover:text-white':
                                    isCurrentOrParentUrl(item.href),
                            },
                        )}
                    >
                        {item.title}
                    </Link>
                ))}
            </nav>

            <section className="mt-5 rounded-xl border border-[#153f32]/10 bg-white p-6 sm:p-8">
                <div className="max-w-2xl">{children}</div>
            </section>
        </div>
    );
}
