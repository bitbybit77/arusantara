import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    BriefcaseBusiness,
    Building2,
    ChevronDown,
    FileText,
    Gauge,
    Info,
    GraduationCap,
    Headphones,
    Megaphone,
    MonitorPlay,
    PencilLine,
    MoreVertical,
    Store,
    Workflow,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { dashboard, login, register } from '@/routes';

type DropdownKey = 'platform' | 'solusi' | 'informasi' | null;

type MegaItem = {
    label: string;
    description: string;
    href: string;
    icon: typeof Gauge;
};

const platformItems: MegaItem[] = [
    {
        label: 'Engineering',
        description: 'Dari data equipment menuju preliminary engineering specification yang explainable dan traceable.',
        href: '/engineering',
        icon: Gauge,
    },
    {
        label: 'Cara Kerja',
        description: 'Lihat alur lengkap dari kebutuhan equipment sampai keputusan komersial dan Deal.',
        href: '/cara-kerja',
        icon: Workflow,
    },
    {
        label: 'Permintaan Penawaran',
        description: 'Bawa technical baseline yang sama ke panel maker untuk proses quotation dan negosiasi.',
        href: '/permintaan-penawaran',
        icon: FileText,
    },
];

const solutionItems: MegaItem[] = [
    {
        label: 'Pemilik Usaha',
        description: 'Mulai dari perangkat yang digunakan tanpa harus memahami istilah engineering sejak awal.',
        href: '/pemilik-usaha',
        icon: Building2,
    },
    {
        label: 'Panel Maker',
        description: 'Review technical baseline, kirim quotation, dan kelola technical deviation secara terstruktur.',
        href: '/panel-makers',
        icon: Store,
    },
    {
        label: 'Procurement / Project Team',
        description: 'Jaga kebutuhan teknis, revisi, dan penawaran tetap berada pada konteks yang sama.',
        href: '/procurement',
        icon: BriefcaseBusiness,
    },
];

const informationArticleItems: MegaItem[] = [
    {
        label: 'Blog & Insight',
        description: 'Artikel praktis tentang kebutuhan panel, engineering awal, dan procurement teknis.',
        href: '/insight',
        icon: PencilLine,
    },
    {
        label: 'Info Platform',
        description: 'Kenali fitur, kemampuan, batas penggunaan, dan perkembangan Arusantara.',
        href: '/info-platform',
        icon: Megaphone,
    },
    {
        label: 'Tentang Kami',
        description: 'Kenali alasan Arusantara dibangun, positioning platform, dan prinsip engineering-nya.',
        href: '/about',
        icon: Info,
    },
    {
        label: 'Kontak',
        description: 'Temukan jalur untuk menghubungi tim Arusantara dan mendapatkan bantuan.',
        href: '/kontak',
        icon: Headphones,
    },
];

const informationGuideItems: MegaItem[] = [
    {
        label: 'Pengetahuan Dasar',
        description: 'Mulai dari konsep daya, fasa, beban, panel distribusi, dan istilah dasar lainnya.',
        href: '/pengetahuan-dasar',
        icon: Gauge,
    },
    {
        label: 'Pojok Belajar',
        description: 'Materi terstruktur untuk memahami equipment, engineering, RFQ, dan technical deviation.',
        href: '/learn',
        icon: BookOpen,
    },
    {
        label: 'Tutorial',
        description: 'Panduan langkah demi langkah menggunakan alur Arusantara dari project sampai Deal.',
        href: '/tutorial',
        icon: MonitorPlay,
    },
    {
        label: 'Arusantara Academy',
        description: 'Kumpulan materi pembelajaran yang lebih mendalam untuk customer, maker, dan procurement.',
        href: '/academy',
        icon: GraduationCap,
    },
    {
        label: 'FAQ',
        description: 'Jawaban singkat untuk pertanyaan umum tentang alur, hasil engineering, akun, dan proses penawaran.',
        href: '/faq',
        icon: Info,
    },
];

export function PublicSiteShell({ children }: PropsWithChildren) {
    const page = usePage();
    const { auth } = page.props as { auth?: { user?: unknown | null } };
    const pathname = page.url.split(/[?#]/)[0] || '/';
    const authUser = Boolean(auth?.user);
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState<DropdownKey>(null);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const updateScrollState = () => setIsScrolled(window.scrollY > 18);

        updateScrollState();
        window.addEventListener('scroll', updateScrollState, { passive: true });

        return () => window.removeEventListener('scroll', updateScrollState);
    }, []);

    useEffect(() => {
        if (!menuOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [menuOpen]);

    const closeNavigation = () => {
        setMenuOpen(false);
        setDropdownOpen(null);
    };

    // Opening a desktop mega menu must not change the header rendering layer.
    // Keeping dropdown state out of this value prevents the gradient/backdrop
    // swap that caused a visible flash in Chromium when a parent nav was clicked.
    const headerElevated = isScrolled || menuOpen;

    return (
        <div className="min-h-screen bg-[#F6F1E7] text-[#18201D] antialiased selection:bg-[#C9783D]/25">
            <header
                className={`sticky top-0 z-50 text-white transition-[background-color,box-shadow,border-color] duration-300 ${
                    headerElevated
                        ? 'border-b border-white/10 bg-[#0D1512]/95 shadow-[0_10px_30px_rgba(0,0,0,0.14)] backdrop-blur-xl'
                        : 'border-b border-transparent bg-[linear-gradient(90deg,#0D1512_0%,#153F32_52%,#255947_100%)]'
                }`}
                onMouseLeave={() => setDropdownOpen(null)}
            >
                <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-12">
                    <Link href="/" className="flex items-center gap-3" aria-label="Arusantara Beranda" onClick={closeNavigation}>
                        <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/14 bg-white/8">
                            <img src="/images/landing/arusantara-mark.png" alt="" className="h-6 w-6 object-contain brightness-0 invert" />
                        </span>
                        <span className="text-[16px] font-bold tracking-[-0.03em]">Arusantara</span>
                    </Link>

                    <nav className="hidden items-center gap-1 lg:flex">
                        <Link
                            href="/"
                            onMouseEnter={() => setDropdownOpen(null)}
                            aria-current={pathname === '/' ? 'page' : undefined}
                            className={`relative rounded-md px-3 py-2 text-[13px] font-semibold transition-colors ${
                                pathname === '/'
                                    ? 'text-white after:absolute after:bottom-0.5 after:left-3 after:right-3 after:h-px after:rounded-full after:bg-white/85'
                                    : 'text-white/62 hover:bg-white/[0.035] hover:text-white'
                            }`}
                        >
                            Beranda
                        </Link>

                        <ParentNav
                            label="Platform"
                            active={pathname === '/platform' || ['/engineering', '/cara-kerja', '/permintaan-penawaran'].includes(pathname)}
                            open={dropdownOpen === 'platform'}
                            onHover={() => {
                                if (dropdownOpen !== null) {
                                    setDropdownOpen('platform');
                                }
                            }}
                            onToggle={() => setDropdownOpen((current) => (current === 'platform' ? null : 'platform'))}
                        />

                        <ParentNav
                            label="Solusi"
                            active={pathname === '/solusi' || ['/pemilik-usaha', '/panel-makers', '/procurement'].includes(pathname)}
                            open={dropdownOpen === 'solusi'}
                            onHover={() => {
                                if (dropdownOpen !== null) {
                                    setDropdownOpen('solusi');
                                }
                            }}
                            onToggle={() => setDropdownOpen((current) => (current === 'solusi' ? null : 'solusi'))}
                        />

                        <ParentNav
                            label="Informasi"
                            active={pathname === '/informasi' || ['/insight', '/info-platform', '/about', '/kontak', '/pengetahuan-dasar', '/learn', '/tutorial', '/academy', '/faq'].includes(pathname)}
                            open={dropdownOpen === 'informasi'}
                            onHover={() => {
                                if (dropdownOpen !== null) {
                                    setDropdownOpen('informasi');
                                }
                            }}
                            onToggle={() => setDropdownOpen((current) => (current === 'informasi' ? null : 'informasi'))}
                        />
                    </nav>

                    <div className="hidden items-center gap-2 lg:flex">
                        {authUser ? (
                            <Link href={dashboard()} className="inline-flex items-center gap-2 rounded-xl bg-[#C9783D] px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#B96B34]">
                                Dashboard <ArrowRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <Link
                                href={login()}
                                className="rounded-xl px-4 py-2.5 text-[13px] font-bold text-white/78 hover:bg-white/8 hover:text-white"
                            >
                                Masuk
                            </Link>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => setMenuOpen((value) => !value)}
                        className="grid h-10 w-10 place-items-center rounded-xl border border-white/12 bg-white/7 lg:hidden"
                        aria-label={menuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
                        aria-expanded={menuOpen}
                    >
                        {menuOpen ? <X className="h-4 w-4" /> : <MoreVertical className="h-5 w-5" />}
                    </button>
                </div>

                {dropdownOpen === 'platform' && (
                    <PlatformMegaMenu onNavigate={closeNavigation} />
                )}

                {dropdownOpen === 'solusi' && (
                    <SolutionMegaMenu onNavigate={closeNavigation} />
                )}

                {dropdownOpen === 'informasi' && (
                    <InformationMegaMenu onNavigate={closeNavigation} />
                )}

            </header>

            {menuOpen && (
                <div className="fixed inset-x-0 bottom-0 top-[76px] z-[70] overflow-y-auto overscroll-contain bg-[#F6F1E7] text-[#18201D] lg:hidden">
                    <div className="mx-auto flex min-h-full max-w-2xl flex-col px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:px-7">
                        <nav className="flex-1">
                            <div className="border-b border-[#153F32]/10 py-5">
                                <Link
                                    href="/"
                                    onClick={closeNavigation}
                                    aria-current={pathname === '/' ? 'page' : undefined}
                                    className={`flex items-center justify-between rounded-xl border px-4 py-4 transition ${
                                        pathname === '/'
                                            ? 'border-[#153F32] bg-[#153F32] text-white shadow-sm'
                                            : 'border-[#153F32]/10 bg-white/50 text-[#21302A] active:bg-[#153F32]/[0.06]'
                                    }`}
                                >
                                    <span>
                                        <span className="block text-[16px] font-semibold">Beranda</span>
                                        <span className={`mt-0.5 block text-[12px] leading-5 ${pathname === '/' ? 'text-white/60' : 'text-[#78817D]'}`}>
                                            Kembali ke halaman utama Arusantara.
                                        </span>
                                    </span>
                                    <ArrowRight className={`h-4 w-4 ${pathname === '/' ? 'text-white/70' : 'text-[#153F32]/35'}`} />
                                </Link>
                            </div>

                            <MobileNavigationGroup
                                title="Platform"
                                description="Dari kebutuhan equipment sampai baseline engineering dan proses penawaran."
                                summaryLabel="Ringkasan Platform"
                                summaryHref="/platform"
                                items={platformItems}
                                onNavigate={closeNavigation}
                            />

                            <MobileNavigationGroup
                                title="Solusi"
                                description="Pilih jalur yang paling dekat dengan peran Anda di dalam project."
                                summaryLabel="Ringkasan Solusi"
                                summaryHref="/solusi"
                                items={solutionItems}
                                onNavigate={closeNavigation}
                            />

                            <MobileNavigationGroup
                                title="Informasi"
                                description="Artikel, panduan, pembelajaran, bantuan, dan informasi tentang Arusantara."
                                summaryLabel="Pusat Informasi"
                                summaryHref="/informasi"
                                items={[...informationArticleItems, ...informationGuideItems]}
                                onNavigate={closeNavigation}
                            />
                        </nav>

                        <div className="py-7">
                            <div className="rounded-2xl bg-[#153F32] p-5 text-white">
                                <p className="text-[18px] font-semibold tracking-[-0.02em]">Mulai dari kebutuhan yang Anda pahami.</p>
                                <p className="mt-2 max-w-md text-[13px] leading-6 text-white/62">Masuk ke project yang sudah ada atau mulai konfigurasi baru dari equipment yang digunakan.</p>

                                {authUser ? (
                                    <Link
                                        href={dashboard()}
                                        onClick={closeNavigation}
                                        className="mt-5 flex w-full items-center justify-between rounded-xl bg-[#C9783D] px-4 py-3.5 text-sm font-bold text-white"
                                    >
                                        Dashboard
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                ) : (
                                    <div className="mt-5 grid gap-2.5">
                                        <Link
                                            href={register()}
                                            onClick={closeNavigation}
                                            className="flex w-full items-center justify-between rounded-xl bg-[#C9783D] px-4 py-3.5 text-sm font-bold text-white"
                                        >
                                            Mulai Project
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                        <Link
                                            href={login()}
                                            onClick={closeNavigation}
                                            className="flex w-full items-center justify-between rounded-xl border border-white/14 px-4 py-3.5 text-sm font-semibold text-white/88"
                                        >
                                            Masuk
                                            <ArrowRight className="h-4 w-4 text-white/50" />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {children}

            <footer className="bg-[#0D1512] text-white">
                <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
                    <div className="grid gap-10 border-b border-white/10 py-12 lg:grid-cols-[1.45fr_0.75fr_0.75fr_0.75fr] lg:gap-12 lg:py-14">
                        <div className="max-w-[470px]">
                            <div className="flex items-center gap-3">
                                <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/8 ring-1 ring-inset ring-white/10">
                                    <img src="/images/landing/arusantara-mark.png" alt="" className="h-6 w-6 object-contain brightness-0 invert" />
                                </span>
                                <span className="text-[17px] font-bold tracking-[-0.03em]">Arusantara</span>
                            </div>
                            <p className="mt-5 max-w-[430px] text-sm leading-6 text-white/58">
                                Menghubungkan kebutuhan equipment, preliminary engineering specification, dan proses penawaran panel dalam satu alur yang lebih mudah ditelusuri.
                            </p>
                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <Link
                                    href={authUser ? dashboard() : register()}
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#F6F1E7] px-4 py-2.5 text-sm font-bold text-[#153F32] transition hover:bg-white"
                                >
                                    {authUser ? 'Buka Dashboard' : 'Mulai Project'}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                {!authUser && (
                                    <Link href={login()} className="px-2 py-2 text-sm font-semibold text-white/68 transition hover:text-white">
                                        Masuk
                                    </Link>
                                )}
                            </div>
                        </div>

                        <FooterLinks title="Platform" items={[["Ringkasan Platform", "/platform"], ["Engineering", "/engineering"], ["Cara Kerja", "/cara-kerja"], ["Permintaan Penawaran", "/permintaan-penawaran"]]} />
                        <FooterLinks title="Solusi" items={[["Ringkasan Solusi", "/solusi"], ["Pemilik Usaha", "/pemilik-usaha"], ["Panel Maker", "/panel-makers"], ["Procurement", "/procurement"]]} />
                        <FooterLinks title="Informasi" items={[["Pusat Informasi", "/informasi"], ["Blog & Insight", "/insight"], ["Pengetahuan Dasar", "/pengetahuan-dasar"], ["Tutorial", "/tutorial"], ["Tentang", "/about"], ["FAQ", "/faq"]]} />
                    </div>

                    <div className="flex flex-col gap-3 py-6 text-xs text-white/42 sm:flex-row sm:items-center sm:justify-between">
                        <p>© 2026 Arusantara. Preliminary engineering platform.</p>
                        <p className="max-w-xl sm:text-right">Final verification, compliance, dan keputusan manufaktur tetap berada pada qualified engineer atau panel maker.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function ParentNav({ label, active, open, onHover, onToggle }: { label: string; active: boolean; open: boolean; onHover: () => void; onToggle: () => void }) {
    const stateClass = open
        ? 'border-white/10 bg-white/[0.085] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]'
        : active
          ? 'border-transparent text-white after:absolute after:bottom-0.5 after:left-3 after:right-3 after:h-px after:rounded-full after:bg-white/85'
          : 'border-transparent text-white/62 hover:bg-white/[0.035] hover:text-white';

    return (
        <button
            type="button"
            onClick={onToggle}
            onMouseEnter={onHover}
            className={`relative flex items-center gap-1 rounded-md border px-3 py-2 text-[13px] font-semibold transition-colors ${stateClass}`}
            aria-haspopup="true"
            aria-expanded={open}
        >
            <span>{label}</span>
            <ChevronDown className={`h-3.5 w-3.5 text-white/62 transition-transform ${open ? 'rotate-180 text-white' : ''}`} />
        </button>
    );
}

function PlatformMegaMenu({ onNavigate }: { onNavigate: () => void }) {
    const designItems = platformItems.slice(0, 2);
    const procurementItems = platformItems.slice(2);

    return (
        <SignatureMegaMenu
            introTitle="Dari equipment sampai penawaran, dalam satu alur."
            introBody="Mulai dari kebutuhan yang dipahami pengguna, terjemahkan ke baseline engineering, lalu lanjutkan ke proses penawaran."
            overviewHref="/platform"
            overviewLabel="Jelajahi Platform"
            accent="flow"
            onNavigate={onNavigate}
        >
            <SignatureMenuSection
                title="Bangun kebutuhan teknis"
                description="Mulai dari equipment dan pahami bagaimana Arusantara membentuk preliminary engineering baseline."
                items={designItems}
                onNavigate={onNavigate}
            />
            <SignatureMenuSection
                title="Masuk ke proses penawaran"
                description="Gunakan technical baseline yang sama ketika kebutuhan siap dibawa ke panel maker."
                items={procurementItems}
                onNavigate={onNavigate}
                footerLink={{ label: 'Lihat alur lengkap', href: '/cara-kerja' }}
            />
        </SignatureMegaMenu>
    );
}

function SolutionMegaMenu({ onNavigate }: { onNavigate: () => void }) {
    return (
        <SignatureMegaMenu
            introTitle="Satu platform, sudut pandang yang berbeda."
            introBody="Setiap peran melihat konteks yang sama, tetapi mendapat jalur kerja yang sesuai dengan kebutuhannya."
            overviewHref="/solusi"
            overviewLabel="Lihat Semua Solusi"
            accent="roles"
            onNavigate={onNavigate}
        >
            <SignatureMenuSection
                title="Untuk customer nonteknis"
                description="Mulai dari equipment yang digunakan tanpa harus menerjemahkan sendiri semua istilah engineering."
                items={solutionItems.slice(0, 1)}
                onNavigate={onNavigate}
            />
            <SignatureMenuSection
                title="Untuk maker & project team"
                description="Review baseline, susun penawaran, dan jaga perubahan teknis tetap transparan sepanjang proses."
                items={solutionItems.slice(1)}
                onNavigate={onNavigate}
            />
        </SignatureMegaMenu>
    );
}

function SignatureMegaMenu(props: PropsWithChildren<{
    introTitle: string;
    introBody: string;
    overviewHref: string;
    overviewLabel: string;
    accent: 'flow' | 'roles';
    onNavigate: () => void;
}>) {
    const { accent, children } = props;
    const accentClass = accent === 'flow'
        ? 'bg-[#123A2E]'
        : 'bg-[#102F27]';

    return (
        <div className="absolute left-0 right-0 top-[76px] hidden bg-transparent lg:block">
            <div className="mx-auto max-w-[1500px] px-12 pb-5 pt-2">
                <div className={`relative overflow-hidden rounded-[14px] border border-white/10 ${accentClass} shadow-[0_18px_48px_rgba(0,0,0,0.20)]`}>
                    <div className="grid grid-cols-2">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SignatureMenuSection({
    title,
    description,
    items,
    onNavigate,
    footerLink,
}: {
    title: string;
    description: string;
    items: MegaItem[];
    onNavigate: () => void;
    footerLink?: { label: string; href: string };
}) {
    return (
        <div className="border-r border-white/10 px-6 py-6 last:border-r-0">
            <div className="mb-4 border-b border-white/10 pb-4">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <h4 className="text-[16px] font-semibold tracking-[-0.015em] text-white">{title}</h4>
                        <p className="mt-1 max-w-[330px] text-[11px] leading-5 text-white/43">{description}</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-1.5">
                {items.map((item) => (
                    <SignatureMenuLink
                        key={item.label}
                        item={item}
                        onNavigate={onNavigate}
                    />
                ))}
            </div>

            {footerLink && (
                <Link
                    href={footerLink.href}
                    onClick={onNavigate}
                    className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold text-white/58 transition hover:text-white"
                >
                    {footerLink.label} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            )}
        </div>
    );
}

function SignatureMenuLink({
    item,
    onNavigate,
}: {
    item: MegaItem;
    onNavigate: () => void;
}) {
    const Icon = item.icon;
    const currentPath = usePage().url.split(/[?#]/)[0] || '/';
    const current = currentPath === item.href;

    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            aria-current={current ? 'page' : undefined}
            className="group relative flex items-start gap-3 px-2.5 py-2.5 transition-colors hover:bg-white/[0.025]"
        >
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center text-white/68 transition-colors group-hover:text-white">
                <Icon className="h-[16px] w-[16px] stroke-[1.8]" />
            </span>
            <span className="min-w-0 pr-5">
                <span className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-white">
                    {item.label}
                </span>
                <span className="mt-1 block max-w-[340px] text-[11.5px] leading-[1.55] text-white/45">{item.description}</span>
            </span>
            <ArrowRight className={`absolute right-3 top-4 h-3.5 w-3.5 transition ${current ? 'text-white/55' : '-translate-x-1 text-white/0 group-hover:translate-x-0 group-hover:text-white'}`} />
        </Link>
    );
}

function InformationMegaMenu({ onNavigate }: { onNavigate: () => void }) {
    return (
        <div className="absolute left-0 right-0 top-[76px] hidden bg-transparent lg:block">
            <div className="mx-auto max-w-[1500px] px-12 pb-5 pt-2">
                <div className="relative overflow-hidden rounded-[18px] border border-white/10 bg-[#123A2E] shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
                    <div className="grid grid-cols-2">
                        <InformationMenuSection
                            title="Kenali Arusantara"
                            description="Informasi tentang platform, pemikiran di balik produk, dan cara menghubungi kami."
                            items={informationArticleItems}
                            onNavigate={onNavigate}
                        />

                        <InformationMenuSection
                            title="Pahami sebelum memutuskan"
                            description="Materi dasar sampai panduan penggunaan untuk membantu keputusan yang lebih terarah."
                            items={informationGuideItems}
                            onNavigate={onNavigate}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function InformationMenuSection({
    title,
    description,
    items,
    onNavigate,
}: {
    title: string;
    description: string;
    items: MegaItem[];
    onNavigate: () => void;
}) {
    return (
        <div className="border-r border-white/10 px-6 py-6 last:border-r-0">
            <div className="mb-4 border-b border-white/10 pb-4">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <h4 className="text-[16px] font-semibold tracking-[-0.015em] text-white">{title}</h4>
                        <p className="mt-1 max-w-[330px] text-[11px] leading-5 text-white/43">{description}</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-1.5">
                {items.map((item) => (
                    <InformationMenuLink
                        key={item.label}
                        item={item}
                        onNavigate={onNavigate}
                    />
                ))}
            </div>
        </div>
    );
}

function InformationMenuLink({ item, onNavigate }: { item: MegaItem; onNavigate: () => void }) {
    const Icon = item.icon;
    const currentPath = usePage().url.split(/[?#]/)[0] || '/';
    const current = currentPath === item.href;

    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            aria-current={current ? 'page' : undefined}
            className="group relative flex items-start gap-3 px-2.5 py-2.5 transition-colors hover:bg-white/[0.025]"
        >
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center text-white/68 transition-colors group-hover:text-white">
                <Icon className="h-[16px] w-[16px] stroke-[1.8]" />
            </span>
            <span className="min-w-0 pr-5">
                <span className="flex items-center gap-2 text-[13px] font-medium text-white">
                    {item.label}
                </span>
                <span className="mt-1 block max-w-[340px] text-[11.5px] leading-[1.55] text-white/45">{item.description}</span>
            </span>
            <ArrowRight className={`absolute right-3 top-4 h-3.5 w-3.5 transition ${current ? 'text-white/55' : '-translate-x-1 text-white/0 group-hover:translate-x-0 group-hover:text-white'}`} />
        </Link>
    );
}

function MobileNavigationGroup({
    title,
    description,
    summaryLabel,
    summaryHref,
    items,
    onNavigate,
}: {
    title: string;
    description: string;
    summaryLabel: string;
    summaryHref: string;
    items: MegaItem[];
    onNavigate: () => void;
}) {
    const currentPath = usePage().url.split(/[?#]/)[0] || '/';
    const summaryCurrent = currentPath === summaryHref;
    const groupCurrent = summaryCurrent || items.some((item) => item.href === currentPath);

    return (
        <section className={`border-b border-[#153F32]/10 py-7 ${groupCurrent ? 'bg-[#153F32]/[0.018]' : ''}`}>
            <div className="px-0.5">
                <h2 className={`text-[21px] font-semibold tracking-[-0.035em] ${groupCurrent ? 'text-[#153F32]' : 'text-[#14211C]'}`}>{title}</h2>
                <p className="mt-1 max-w-lg text-[12.5px] leading-5 text-[#67716D]">{description}</p>
            </div>

            <Link
                href={summaryHref}
                onClick={onNavigate}
                aria-current={summaryCurrent ? 'page' : undefined}
                className={`mt-4 flex items-center justify-between rounded-xl border px-3.5 py-3 text-[13px] font-semibold transition ${
                    summaryCurrent
                        ? 'border-[#153F32]/18 bg-[#153F32]/[0.075] text-[#153F32]'
                        : 'border-[#153F32]/10 bg-white/55 text-[#153F32] active:bg-[#153F32]/[0.05]'
                }`}
            >
                {summaryLabel}
                <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <div className="mt-2 grid gap-1.5">
                {items.map((item) => (
                    <MobileMegaLink key={item.label} item={item} onNavigate={onNavigate} />
                ))}
            </div>
        </section>
    );
}

function MobileMegaLink({ item, onNavigate }: { item: MegaItem; onNavigate: () => void }) {
    const Icon = item.icon;
    const currentPath = usePage().url.split(/[?#]/)[0] || '/';
    const current = currentPath === item.href;

    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            aria-current={current ? 'page' : undefined}
            className={`group flex items-center gap-3 rounded-xl border px-2.5 py-3 transition ${
                current
                    ? 'border-[#153F32]/12 bg-[#153F32]/[0.06]'
                    : 'border-transparent active:bg-[#153F32]/[0.05]'
            }`}
        >
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${current ? 'bg-[#153F32] text-white' : 'bg-[#153F32]/[0.07] text-[#153F32]'}`}>
                <Icon className="h-[17px] w-[17px] stroke-[1.8]" />
            </span>
            <span className="min-w-0 flex-1">
                <span className={`block text-[14px] font-semibold ${current ? 'text-[#153F32]' : 'text-[#21302A]'}`}>{item.label}</span>
                <span className="mt-0.5 block text-[11.5px] leading-[1.55] text-[#78817D]">{item.description}</span>
            </span>
            <ArrowRight className={`h-3.5 w-3.5 shrink-0 transition ${current ? 'text-[#153F32]/65' : 'text-[#153F32]/30 group-active:translate-x-0.5'}`} />
        </Link>
    );
}

function FooterLinks({ title, items }: { title: string; items: [string, string][] }) {
    return (
        <div>
            <p className="text-sm font-semibold text-white">{title}</p>
            <div className="mt-4 grid gap-2.5 text-sm">
                {items.map(([label, href]) => (
                    <Link key={href} href={href} className="w-fit text-white/58 transition hover:text-white">
                        {label}
                    </Link>
                ))}
            </div>
        </div>
    );
}

export function GradientHero({ title, body, children }: PropsWithChildren<{ eyebrow: string; title: string; body: string }>) {
    return (
        <section className="relative overflow-hidden bg-[linear-gradient(90deg,#0D1512_0%,#153F32_52%,#255947_100%)] px-5 py-18 text-white sm:px-8 lg:px-12 lg:py-28">
            <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
            <div className="relative mx-auto max-w-[1500px]">
                <div className="max-w-4xl">
                    <h1 className="max-w-4xl text-4xl font-bold leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-7xl">{title}</h1>
                    <p className="mt-6 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">{body}</p>
                    {children}
                </div>
            </div>
        </section>
    );
}
