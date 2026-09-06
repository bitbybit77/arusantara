import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';

function ArusantaraMark() {
    return (
        <svg
            viewBox="0 0 32 32"
            aria-hidden="true"
            className="size-5"
            fill="none"
        >
            <path
                d="M7 22.5C10.2 22.5 10.8 9.5 16 9.5C21.2 9.5 21.8 22.5 25 22.5"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
            />
            <path
                d="M8.5 16C10.8 16 12.1 6.5 16 6.5C19.9 6.5 21.2 16 23.5 16"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                opacity="0.65"
            />
            <circle cx="7" cy="22.5" r="1.6" fill="currentColor" />
            <circle cx="25" cy="22.5" r="1.6" fill="currentColor" />
        </svg>
    );
}

export function AppHeader() {
    const { auth } = usePage().props;
    const getInitials = useInitials();

    return (
        <header className="bg-[#153f32] text-[#f6f1e7]">
            <div className="mx-auto w-full max-w-[1220px] px-4 sm:px-6 lg:px-8">
                <div className="flex h-[60px] items-center justify-between">
                    <Link
                        href="/dashboard"
                        aria-label="Kembali ke dashboard"
                        title="Kembali ke dashboard"
                        className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-[#f6f1e7] transition hover:bg-white/[0.11] focus-visible:ring-2 focus-visible:ring-[#c9783d] focus-visible:outline-none"
                    >
                        <ArusantaraMark />
                    </Link>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="group h-9 rounded-full border border-white/10 bg-white/[0.06] px-1.5 pr-2 text-[#f6f1e7] transition hover:bg-white/[0.11] hover:text-white sm:pr-3"
                                aria-label="Buka menu akun"
                            >
                                <Avatar className="size-7 overflow-hidden rounded-full border border-white/15">
                                    <AvatarImage
                                        src={auth.user?.avatar}
                                        alt={auth.user?.name}
                                    />
                                    <AvatarFallback className="rounded-full bg-[#f6f1e7] text-[10px] font-semibold text-[#153f32]">
                                        {getInitials(auth.user?.name ?? '')}
                                    </AvatarFallback>
                                </Avatar>

                                {auth.user ? (
                                    <span className="hidden max-w-40 truncate pl-1 text-xs font-semibold sm:inline">
                                        {auth.user.name}
                                    </span>
                                ) : null}

                                <ChevronDown className="ml-0.5 size-3.5 text-white/60 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-56 rounded-xl border-[#153f32]/10 bg-[#fffefa] p-1.5 shadow-[0_14px_40px_rgba(24,32,29,0.12)] dark:border-white/10 dark:bg-[#181c1a]"
                            align="end"
                            sideOffset={8}
                        >
                            {auth.user && <UserMenuContent user={auth.user} />}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
