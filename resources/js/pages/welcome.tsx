import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    Building2,
    Check,
    ChevronDown,
    Clock3,
    Coffee,
    Download,
    FileText,
    Menu,
    MessageSquare,
    Send,
    Settings,
    ShieldCheck,
    Users,
    Wrench,
    X,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            <Head title="Arusantara — Engineering Translation Platform" />

            <div className="min-h-screen bg-[#f4f0e7] text-[#12231d] antialiased selection:bg-[#b97645]/20">
                <SiteHeader authUser={Boolean(auth.user)} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

                <main>
                    <Hero authUser={Boolean(auth.user)} />
                    <BenefitStrip />
                    <ProblemSection />
                    <SolutionSection />
                    <MobileShowcase />
                    <AudienceSection />
                    <ValuesSection />
                    <ProcessSection />
                    <FaqSection />
                    <EngineeringShowcase />
                    <RfqSection />
                    <WorkflowSection />
                    <ScenarioSection />
                    <EducationSection />
                    <FinalCta authUser={Boolean(auth.user)} />
                </main>

                <SiteFooter />
            </div>
        </>
    );
}

function SiteHeader({
    authUser,
    menuOpen,
    setMenuOpen,
}: {
    authUser: boolean;
    menuOpen: boolean;
    setMenuOpen: (value: boolean) => void;
}) {
    const links = [
        ['Produk', '#produk'],
        ['Solusi', '#solusi'],
        ['Cara Kerja', '#cara-kerja'],
        ['Sumber Daya', '#edukasi'],
    ];

    return (
        <header className="sticky top-0 z-50 border-b border-[#173b32]/10 bg-[#f4f0e7]/95 backdrop-blur-md">
            <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
                <a href="#top" className="flex items-center gap-3" aria-label="Arusantara home">
                    <ArusantaraMark className="h-8 w-8" />
                    <span className="text-[15px] font-semibold tracking-[0.12em] uppercase">Arusantara</span>
                </a>

                <nav className="hidden items-center gap-8 lg:flex">
                    {links.map(([label, href]) => (
                        <a
                            key={label}
                            href={href}
                            className="text-[12px] font-medium text-[#12231d]/70 transition-colors hover:text-[#12231d]"
                        >
                            {label}
                        </a>
                    ))}
                </nav>

                <div className="hidden items-center gap-3 lg:flex">
                    {authUser ? (
                        <Link href={dashboard()} className="inline-flex items-center gap-2 rounded-md bg-[#173b32] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#102e27]">
                            Dashboard <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    ) : (
                        <>
                            <Link href={login()} className="inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-xs font-semibold text-[#12231d] transition-colors hover:bg-[#173b32]/5">
                                Masuk
                            </Link>
                            <Link href={register()} className="inline-flex items-center gap-2 rounded-md bg-[#173b32] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#102e27]">
                                Buat Project <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="grid h-10 w-10 place-items-center rounded-full border border-[#173b32]/15 bg-[#fbfaf6] lg:hidden"
                    aria-label="Toggle navigation"
                >
                    {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </button>
            </div>

            {menuOpen && (
                <div className="border-t border-[#173b32]/10 bg-[#f4f0e7] px-5 py-5 lg:hidden">
                    <div className="flex flex-col gap-1">
                        {links.map(([label, href]) => (
                            <a
                                key={label}
                                href={href}
                                onClick={() => setMenuOpen(false)}
                                className="rounded-xl px-3 py-3 text-sm font-medium hover:bg-[#173b32]/5"
                            >
                                {label}
                            </a>
                        ))}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {authUser ? (
                            <Link href={dashboard()} className="col-span-2 inline-flex items-center justify-center gap-2 rounded-md bg-[#173b32] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#102e27]">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={login()} className="inline-flex items-center justify-center gap-2 rounded-md border border-[#173b32]/20 bg-transparent px-4 py-2.5 text-xs font-semibold text-[#12231d] transition-colors hover:bg-[#173b32]/5">
                                    Masuk
                                </Link>
                                <Link href={register()} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#173b32] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#102e27]">
                                    Buat Project
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}

function Hero({ authUser }: { authUser: boolean }) {
    return (
        <section id="top" className="relative overflow-hidden bg-[#f4f0e7]">
            <div className="mx-auto grid min-h-[670px] max-w-[1440px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-12 lg:py-24">
                <div className="relative z-10 max-w-[650px]">
                    <p className="text-[10px] font-semibold tracking-[0.16em] text-[#b97645] uppercase">Engineering translation platform</p>
                    <h1 className="mt-6 max-w-[610px] font-serif text-[clamp(3rem,6vw,6.1rem)] leading-[0.93] tracking-[-0.055em] text-[#12231d]">
                        Dari kebutuhan peralatan menjadi kebutuhan kelistrikan.
                    </h1>
                    <p className="mt-8 max-w-[570px] text-[15px] leading-7 text-[#12231d]/68 sm:text-[16px]">
                        Arusantara membantu siapa pun, tanpa latar belakang teknik, merancang kebutuhan panel listrik dari daftar peralatan lalu mengirimkan RFQ yang jelas ke panel maker.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Link href={authUser ? dashboard() : register()} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#173b32] px-5 py-3 text-xs font-semibold text-white transition-colors hover:bg-[#102e27] sm:justify-start">
                            {authUser ? 'Buka Dashboard' : 'Buat Project'} <ArrowRight className="h-4 w-4" />
                        </Link>
                        <a href="#cara-kerja" className="inline-flex items-center justify-center gap-2 rounded-md border border-[#173b32]/20 bg-transparent px-5 py-3 text-xs font-semibold text-[#12231d] transition-colors hover:bg-[#173b32]/5 sm:justify-start">
                            Pelajari Cara Kerja
                        </a>
                    </div>
                </div>

                <div className="relative min-h-[470px] lg:min-h-[560px]">
                    <div className="absolute inset-x-0 bottom-0 top-8 rounded-[34px] border border-[#173b32]/10 bg-[#eee8dd]" />
                    <div className="absolute left-[8%] top-[5%] h-[78%] w-[72%] rotate-[-1.5deg]">
                        <PanelCabinetVisual />
                    </div>
                    <div className="absolute bottom-[4%] right-[1%] w-[260px] rounded-[18px] border border-[#173b32]/10 bg-[#fbfaf6] p-4 shadow-[0_22px_55px_rgba(18,35,29,0.14)] sm:w-[300px]">
                        <p className="text-[10px] font-semibold tracking-[0.13em] text-[#b97645] uppercase">Output package</p>
                        <div className="mt-4 space-y-3">
                            {['Engineering Result', 'Single Line Diagram', 'BOM & Specification', 'RFQ Package'].map((item) => (
                                <div key={item} className="flex items-center gap-3 border-b border-[#173b32]/10 pb-3 last:border-0 last:pb-0">
                                    <span className="grid h-6 w-6 place-items-center rounded-full border border-[#173b32]/15 bg-[#f4f0e7]">
                                        <Check className="h-3 w-3" />
                                    </span>
                                    <span className="text-[12px] font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function BenefitStrip() {
    const items = [
        ['Dirancang untuk non-teknisi', ShieldCheck],
        ['Hasil teknik terstruktur', FileText],
        ['RFQ jelas untuk panel maker', Send],
        ['Hemat waktu, kurangi revisi', Clock3],
    ];

    return (
        <section className="border-y border-[#173b32]/10 bg-[#fbfaf6]">
            <div className="mx-auto grid max-w-[1440px] gap-2 px-5 py-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-12">
                {items.map(([label, Icon]) => (
                    <div key={String(label)} className="flex items-center gap-3 px-2 py-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full border border-[#173b32]/10 bg-[#f4f0e7]">
                            <Icon className="h-4 w-4" />
                        </span>
                        <span className="text-[12px] font-medium text-[#12231d]/75">{String(label)}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

function ProblemSection() {
    const cards = [
        ['Sulit dijelaskan', 'Kebutuhan peralatan sulit diterjemahkan menjadi spesifikasi kelistrikan.', Zap],
        ['Risiko salah desain', 'Salah hitung beban atau proteksi berakibat biaya dan waktu membengkak.', ShieldCheck],
        ['Revisi berulang', 'Informasi tidak lengkap membuat proses penawaran dan revisi berjalan terlalu lama.', MessageSquare],
        ['Proses tidak efisien', 'Dokumen tersebar di banyak tempat dan sulit dilacak dari awal sampai deal.', Clock3],
    ];

    return (
        <section id="produk" className="bg-[#fbfaf6] py-20 sm:py-28">
            <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
                <p className="text-[10px] font-semibold tracking-[0.16em] text-[#b97645] uppercase">Tantangan yang sering dihadapi</p>
                <h2 className="mt-5 max-w-[720px] font-serif text-[clamp(2.4rem,4.2vw,4.5rem)] leading-[0.98] tracking-[-0.045em]">Kebutuhan ada, tapi menerjemahkan ke kelistrikan terasa sulit.</h2>

                <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {cards.map(([title, body, Icon]) => (
                        <article key={String(title)} className="min-h-[220px] rounded-[18px] border border-[#173b32]/12 bg-[#f8f5ee] p-5 sm:p-6">
                            <span className="grid h-10 w-10 place-items-center rounded-full border border-[#b97645]/30 text-[#b97645]">
                                <Icon className="h-[18px] w-[18px]" />
                            </span>
                            <h3 className="mt-8 text-[15px] font-semibold">{String(title)}</h3>
                            <p className="mt-3 text-[13px] leading-6 text-[#12231d]/60">{String(body)}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function SolutionSection() {
    return (
        <section id="solusi" className="bg-[#fbfaf6] pb-24 sm:pb-32">
            <div className="mx-auto grid max-w-[1440px] gap-12 border-t border-[#173b32]/10 px-5 pt-20 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12">
                <div>
                    <p className="text-[10px] font-semibold tracking-[0.16em] text-[#b97645] uppercase">Arusantara adalah solusinya</p>
                    <h2 className="mt-5 max-w-[650px] font-serif text-[clamp(2.4rem,4.2vw,4.5rem)] leading-[0.98] tracking-[-0.045em]">Terjemahkan kebutuhan Anda menjadi spesifikasi kelistrikan yang siap diproduksi.</h2>
                    <div className="mt-8 space-y-4">
                        {[
                            'Configurator sederhana, hasil teknik yang dapat dijelaskan.',
                            'Dokumen lengkap dan terstruktur untuk RFQ ke banyak vendor.',
                            'Komunikasi lebih jelas, keputusan lebih cepat, riwayat tetap terlacak.',
                        ].map((text) => (
                            <div key={text} className="flex items-start gap-3">
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#173b32]" />
                                <p className="text-[14px] leading-6 text-[#12231d]/68">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <TechnicalSketch />
            </div>
        </section>
    );
}

function MobileShowcase() {
    return (
        <section className="relative overflow-hidden bg-[#102e27] text-[#f7f1e7]">
            <CopperOrbit className="absolute -bottom-32 left-[15%] h-[560px] w-[560px] opacity-65" />
            <div className="relative mx-auto grid min-h-[560px] max-w-[1440px] items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-12 lg:py-20">
                <div className="max-w-[460px]">
                    <h2 className="font-serif text-[clamp(2.6rem,5vw,4.8rem)] leading-[0.95] tracking-[-0.04em]">Semua yang Anda butuhkan, dalam genggaman.</h2>
                    <p className="mt-6 max-w-[420px] text-sm leading-7 text-white/64">
                        Kelola project, lihat hasil engineering, simpan dokumen, dan kirim RFQ kapan pun — tanpa kehilangan konteks teknisnya.
                    </p>
                    <a href="#cara-kerja" className="mt-8 inline-flex items-center gap-2 rounded-md border border-white/20 px-4 py-2.5 text-xs font-semibold hover:bg-white/5">
                        Lihat Alur Produk <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                </div>
                <div className="relative flex min-h-[410px] items-end justify-center lg:justify-end">
                    <PhoneMockup />
                </div>
            </div>
        </section>
    );
}

function AudienceSection() {
    const items = [
        ['Laundry', 'Kebutuhan mesin cuci, pengering, setrika uap, dan utilitas pendukung.', Zap],
        ['Workshop', 'Mesin produksi, kompresor, las, dan peralatan kerja lainnya.', Wrench],
        ['Café & Restoran', 'Peralatan dapur, pendingin, AC, dan sistem pendukung operasional.', Coffee],
        ['UMKM', 'Berbagai kebutuhan peralatan listrik untuk usaha yang sedang berkembang.', Building2],
    ];

    return (
        <section className="bg-[#fbfaf6] py-20 sm:py-28">
            <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
                <div className="max-w-[700px]">
                    <p className="text-[10px] font-semibold tracking-[0.16em] text-[#b97645] uppercase">Tentang platform</p>
                    <h2 className="mt-5 font-serif text-[clamp(2.4rem,4.2vw,4.5rem)] leading-[0.98] tracking-[-0.045em]">Dibuat untuk kebutuhan nyata di lapangan.</h2>
                    <p className="mt-5 max-w-[580px] text-sm leading-7 text-[#12231d]/62">
                        Arusantara dirancang untuk pemilik usaha, facility team, dan pengguna non-teknis di berbagai industri — dimulai dari vertical MVP Laundry.
                    </p>
                </div>

                <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map(([title, body, Icon], index) => (
                        <article key={String(title)} className="group overflow-hidden rounded-[18px] border border-[#173b32]/12 bg-[#f4f0e7]">
                            <div className="relative h-[170px] overflow-hidden bg-[#173b32] p-5 text-[#f7f1e7]">
                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle at ${20 + index * 16}% 20%, #b97645 0 2px, transparent 3px), linear-gradient(135deg, transparent 0 45%, rgba(255,255,255,.1) 45% 46%, transparent 46%)`, backgroundSize: '34px 34px, 100% 100%' }} />
                                <Icon className="relative h-10 w-10 stroke-[1.3]" />
                                <div className="absolute bottom-5 right-5 text-[54px] font-serif leading-none text-white/10">0{index + 1}</div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-serif text-2xl tracking-[-0.03em]">{String(title)}</h3>
                                <p className="mt-3 text-[13px] leading-6 text-[#12231d]/58">{String(body)}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ValuesSection() {
    const values = [
        ['Transparan', 'Anda tahu asumsi, standar, dan perhitungan yang digunakan.', ShieldCheck],
        ['Explainable', 'Hasil teknik mudah dipahami, bukan hanya angka dan simbol.', BookOpen],
        ['Terstruktur', 'Output rapi dan lengkap untuk memudahkan proses pengadaan.', FileText],
    ];

    return (
        <section className="bg-[#fbfaf6] pb-24">
            <div className="mx-auto max-w-[1440px] border-t border-[#173b32]/10 px-5 pt-16 sm:px-8 lg:px-12">
                <p className="text-[10px] font-semibold tracking-[0.16em] text-[#b97645] uppercase">Nilai utama kami</p>
                <div className="mt-8 grid gap-4 md:grid-cols-3">
                    {values.map(([title, body, Icon]) => (
                        <div key={String(title)} className="rounded-[18px] bg-[#f4f0e7] p-6 sm:p-8">
                            <Icon className="h-6 w-6 stroke-[1.4]" />
                            <h3 className="mt-10 font-serif text-3xl tracking-[-0.03em]">{String(title)}</h3>
                            <p className="mt-4 max-w-[290px] text-[13px] leading-6 text-[#12231d]/60">{String(body)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ProcessSection() {
    const steps = [
        ['1', 'Input Kebutuhan', 'Pilih peralatan & isi detail kebutuhan Anda lewat configurator.', Settings],
        ['2', 'Hasil Engineering', 'Dapatkan preliminary engineering result, diagram, dan spesifikasi.', Zap],
        ['3', 'Review & Sesuaikan', 'Tinjau hasil, lakukan revisi bila dibutuhkan, lalu kunci baseline.', FileText],
        ['4', 'Kirim RFQ', 'Ekspor dokumen RFQ dan kirim ke panel maker terpercaya.', Send],
    ];

    return (
        <section id="cara-kerja" className="bg-[#fbfaf6] py-20 sm:py-28">
            <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
                <p className="text-[10px] font-semibold tracking-[0.16em] text-[#b97645] uppercase">Cara kerja</p>
                <h2 className="mt-5 font-serif text-[clamp(2.4rem,4.2vw,4.5rem)] leading-[0.98] tracking-[-0.045em]">Dari kebutuhan hingga RFQ, dalam 4 langkah.</h2>

                <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {steps.map(([number, title, body, Icon]) => (
                        <article key={String(number)} className="rounded-[18px] border border-[#173b32]/12 p-6">
                            <Icon className="h-7 w-7 stroke-[1.35]" />
                            <p className="mt-8 font-serif text-4xl leading-none text-[#b97645]">{String(number)}</p>
                            <h3 className="mt-5 text-[15px] font-semibold">{String(title)}</h3>
                            <p className="mt-3 text-[13px] leading-6 text-[#12231d]/58">{String(body)}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FaqSection() {
    const faqs = [
        ['Apakah saya harus memiliki latar belakang teknik?', 'Tidak. Arusantara dirancang agar pengguna memulai dari peralatan dan kebutuhan operasional yang mereka pahami.'],
        ['Output apa saja yang saya dapatkan?', 'Preliminary engineering result, technical baseline, dokumentasi pendukung, dan paket RFQ yang dapat dibawa ke panel maker.'],
        ['Bisakah saya mengirim RFQ ke banyak panel maker?', 'Ya. RFQ dibuat dari baseline teknis yang sama agar quotation dari beberapa maker lebih mudah dibandingkan.'],
        ['Apakah hasil Arusantara menggantikan engineering final?', 'Tidak. Hasil Arusantara adalah preliminary specification dan tetap memerlukan verifikasi profesional sebelum fabrikasi.'],
    ];

    return (
        <section className="bg-[#fbfaf6] pb-24 sm:pb-32">
            <div className="mx-auto max-w-[900px] px-5 sm:px-8">
                <p className="text-[10px] font-semibold tracking-[0.16em] text-[#b97645] uppercase">Pertanyaan umum</p>
                <div className="mt-8 divide-y divide-[#173b32]/10 border-y border-[#173b32]/10">
                    {faqs.map(([question, answer]) => (
                        <details key={question} className="group py-5">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
                                {question}
                                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                            </summary>
                            <p className="max-w-[760px] pt-4 text-[13px] leading-6 text-[#12231d]/60">{answer}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}

function EngineeringShowcase() {
    return (
        <section className="relative overflow-hidden bg-[#102e27] text-[#f7f1e7]">
            <CopperOrbit className="absolute -bottom-40 right-[12%] h-[620px] w-[620px] opacity-60" />
            <div className="relative mx-auto grid min-h-[560px] max-w-[1440px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:py-20">
                <div>
                    <p className="text-[10px] font-semibold tracking-[0.16em] text-[#d69a70] uppercase">Engineering result</p>
                    <h2 className="mt-5 max-w-[560px] font-serif text-[clamp(2.6rem,5vw,5rem)] leading-[0.94] tracking-[-0.045em]">Engineering yang jelas. Keputusan yang lebih yakin.</h2>
                    <ul className="mt-8 space-y-4 text-sm text-white/68">
                        {['Kurangi risiko salah desain', 'Hemat waktu komunikasi', 'Dapatkan penawaran terbaik'].map((text) => (
                            <li key={text} className="flex items-center gap-3">
                                <Check className="h-4 w-4 text-[#d69a70]" /> {text}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex justify-center lg:justify-end">
                    <PhoneEngineering />
                </div>
            </div>
        </section>
    );
}

function RfqSection() {
    const features = [
        ['Dokumen Terstandar', 'Format RFQ yang konsisten mengurangi salah interpretasi.', FileText],
        ['Multi Vendor', 'Kirim ke banyak panel maker, bandingkan lebih mudah.', Users],
        ['Aman & Terkontrol', 'Data project tetap dalam konteks yang jelas.', ShieldCheck],
        ['Jejak Revisi', 'Semua perubahan technical baseline dapat dilacak.', Clock3],
    ];

    return (
        <section className="bg-[#102e27] pb-20 text-[#f7f1e7] sm:pb-28">
            <div className="mx-auto grid max-w-[1440px] gap-12 border-t border-white/10 px-5 pt-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
                <div className="max-w-[540px]">
                    <p className="text-[10px] font-semibold tracking-[0.16em] text-[#d69a70] uppercase">Request for quotation</p>
                    <h2 className="mt-5 font-serif text-[clamp(2.7rem,5vw,5.1rem)] leading-[0.95] tracking-[-0.045em]">RFQ terstruktur, aman, dan siap diproduksi.</h2>
                    <p className="mt-6 text-sm leading-7 text-white/62">
                        Dokumen lengkap dan konsisten membantu panel maker memberikan penawaran yang akurat dan dapat dibandingkan.
                    </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    {features.map(([title, body, Icon]) => (
                        <article key={String(title)} className="rounded-[16px] border border-white/10 bg-white/[0.045] p-5 sm:p-6">
                            <Icon className="h-5 w-5 text-[#d69a70]" />
                            <h3 className="mt-8 text-[14px] font-semibold">{String(title)}</h3>
                            <p className="mt-3 text-[12px] leading-5 text-white/56">{String(body)}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function WorkflowSection() {
    return (
        <section className="bg-[#fbfaf6] py-20 sm:py-28">
            <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
                <p className="text-[10px] font-semibold tracking-[0.16em] text-[#b97645] uppercase">Lihat cara kerja Arusantara</p>
                <h2 className="mt-5 font-serif text-[clamp(2.4rem,4.2vw,4.5rem)] leading-[0.98] tracking-[-0.045em]">Bagaimana Arusantara bekerja untuk Anda.</h2>

                <div className="mt-12 grid gap-10 lg:grid-cols-[0.65fr_1.35fr]">
                    <div className="space-y-8">
                        {['Rancang Kebutuhan', 'Hasilkan Engineering', 'Kirim RFQ', 'Terima Penawaran'].map((step, index) => (
                            <div key={step} className="flex gap-6">
                                <span className="font-serif text-3xl text-[#b97645]">0{index + 1}</span>
                                <div>
                                    <p className="text-[14px] font-semibold">{step}</p>
                                    <p className="mt-2 text-[12px] leading-5 text-[#12231d]/54">
                                        {index === 0 && 'Masukkan kebutuhan dalam bahasa yang Anda pahami.'}
                                        {index === 1 && 'Sistem menyusun preliminary engineering baseline.'}
                                        {index === 2 && 'Kunci hasil lalu buat paket RFQ yang konsisten.'}
                                        {index === 3 && 'Bandingkan quotation dan technical deviation.'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <ConfiguratorPreview />
                </div>
            </div>
        </section>
    );
}

function ScenarioSection() {
    const cards = [
        ['Laundry', 'Owner laundry menambah mesin baru dan ingin memahami kebutuhan panel tanpa menyusun perhitungan dari nol.', '01'],
        ['Café', 'Pemilik café merencanakan ekspansi dapur dan membutuhkan baseline kelistrikan yang lebih jelas.', '02'],
        ['Workshop', 'Facility manager ingin membandingkan proposal beberapa panel maker pada baseline teknis yang sama.', '03'],
    ];

    return (
        <section className="bg-[#f4f0e7] py-20 sm:py-28">
            <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
                <p className="text-[10px] font-semibold tracking-[0.16em] text-[#b97645] uppercase">Skenario penggunaan</p>
                <h2 className="mt-5 font-serif text-[clamp(2.4rem,4.2vw,4.5rem)] leading-[0.98] tracking-[-0.045em]">Tiga situasi nyata yang bisa dijembatani Arusantara.</h2>
                <div className="mt-12 grid gap-4 md:grid-cols-3">
                    {cards.map(([title, body, no]) => (
                        <article key={title} className="overflow-hidden rounded-[18px] border border-[#173b32]/10 bg-[#fbfaf6]">
                            <div className="flex h-[150px] items-end justify-between bg-[#173b32] p-5 text-[#f7f1e7]">
                                <div className="text-[12px] font-semibold tracking-[0.13em] uppercase">Case / {no}</div>
                                <div className="font-serif text-5xl text-white/12">{no}</div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-serif text-3xl tracking-[-0.03em]">{title}</h3>
                                <p className="mt-4 text-[13px] leading-6 text-[#12231d]/58">{body}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function EducationSection() {
    const articles = [
        ['Apa itu Single Line Diagram dan kenapa penting?', 'Dasar kelistrikan', 'SLD'],
        ['Cara menghitung beban listrik untuk usaha Anda', 'Beban listrik', 'kW'],
        ['Checklist sebelum mengirim RFQ ke panel maker', 'Procurement', 'RFQ'],
    ];

    return (
        <section id="edukasi" className="bg-[#fbfaf6] py-20 sm:py-28">
            <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
                <p className="text-[10px] font-semibold tracking-[0.16em] text-[#b97645] uppercase">Edukasi & insight</p>
                <h2 className="mt-5 font-serif text-[clamp(2.4rem,4.2vw,4.5rem)] leading-[0.98] tracking-[-0.045em]">Belajar kelistrikan, lebih mudah.</h2>
                <div className="mt-12 grid gap-4 md:grid-cols-3">
                    {articles.map(([title, category, symbol]) => (
                        <article key={title} className="group rounded-[18px] border border-[#173b32]/10 bg-[#f4f0e7] p-5">
                            <div className="grid h-[170px] place-items-center rounded-[12px] bg-[#102e27] text-[#f7f1e7]">
                                <span className="font-serif text-5xl text-[#d69a70]">{symbol}</span>
                            </div>
                            <p className="mt-5 text-[10px] font-semibold tracking-[0.13em] text-[#b97645] uppercase">{category}</p>
                            <h3 className="mt-3 max-w-[330px] font-serif text-2xl leading-[1.05] tracking-[-0.03em]">{title}</h3>
                            <span className="mt-6 inline-flex items-center gap-2 text-[12px] font-semibold">Baca artikel <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FinalCta({ authUser }: { authUser: boolean }) {
    return (
        <section className="relative overflow-hidden bg-[#102e27] text-[#f7f1e7]">
            <CopperOrbit className="absolute -right-40 -bottom-40 h-[620px] w-[620px] opacity-50" />
            <div className="relative mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_auto] lg:px-12 lg:py-20">
                <div>
                    <p className="text-[10px] font-semibold tracking-[0.16em] text-[#d69a70] uppercase">Mulai dari kebutuhan Anda</p>
                    <h2 className="mt-5 max-w-[760px] font-serif text-[clamp(2.6rem,5vw,5rem)] leading-[0.95] tracking-[-0.045em]">Bangun dengan percaya diri. Arusantara mendampingi setiap langkah Anda.</h2>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                    <Link href={authUser ? dashboard() : register()} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#f7f1e7] px-5 py-3 text-xs font-semibold text-[#102e27]">
                        {authUser ? 'Buka Dashboard' : 'Buat Project Gratis'} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <a href="#cara-kerja" className="inline-flex items-center justify-center rounded-md border border-white/20 px-5 py-3 text-xs font-semibold text-white">Jelajahi Demo</a>
                </div>
            </div>
        </section>
    );
}

function SiteFooter() {
    return (
        <footer className="bg-[#102e27] text-[#f7f1e7]">
            <div className="mx-auto grid max-w-[1440px] gap-10 border-t border-white/10 px-5 py-10 sm:px-8 lg:grid-cols-[1.2fr_2fr] lg:px-12">
                <div>
                    <div className="flex items-center gap-3">
                        <ArusantaraMark className="h-7 w-7 text-[#d69a70]" />
                        <span className="text-[14px] font-semibold tracking-[0.12em] uppercase">Arusantara</span>
                    </div>
                    <p className="mt-4 max-w-[330px] text-[12px] leading-5 text-white/50">Engineering Translation Platform untuk kebutuhan panel listrik yang lebih terstruktur dan dapat diverifikasi.</p>
                </div>
                <div className="grid gap-8 sm:grid-cols-3">
                    <FooterColumn title="Produk" items={['Configurator', 'Engineering Result', 'RFQ']} />
                    <FooterColumn title="Perusahaan" items={['Tentang Kami', 'Karier', 'Kontak']} />
                    <FooterColumn title="Sumber Daya" items={['Education', 'FAQ', 'Panduan']} />
                </div>
            </div>
            <div className="mx-auto flex max-w-[1440px] flex-col gap-3 border-t border-white/10 px-5 py-6 text-[10px] text-white/38 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
                <p>© 2026 Arusantara. Hak cipta dilindungi.</p>
                <p>Preliminary engineering results require professional verification.</p>
            </div>
        </footer>
    );
}

function PanelCabinetVisual() {
    return (
        <div className="relative h-full w-full">
            <div className="absolute inset-x-[8%] bottom-[4%] h-[9%] rounded-full bg-[#12231d]/12 blur-2xl" />
            <div className="absolute inset-0 grid grid-cols-[1fr_1.25fr_0.9fr] gap-2 rounded-[10px] border border-[#12231d]/20 bg-[#d9d8d0] p-3 shadow-[0_28px_60px_rgba(18,35,29,0.18)]">
                {[0, 1, 2].map((column) => (
                    <div key={column} className="relative overflow-hidden rounded-[6px] border border-[#12231d]/20 bg-[#ecebe5] p-3">
                        <div className="flex items-center justify-between">
                            <span className="h-2 w-10 rounded-full bg-[#12231d]/18" />
                            <span className="h-2 w-2 rounded-full bg-[#b97645]" />
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-2">
                            {Array.from({ length: column === 1 ? 8 : 6 }).map((_, i) => (
                                <div key={i} className="rounded-[4px] border border-[#12231d]/18 bg-[#12231d] p-1.5">
                                    <div className="h-1.5 rounded-full bg-white/50" />
                                    <div className="mt-1 grid grid-cols-3 gap-0.5">
                                        <span className="h-1 rounded-full bg-[#b97645]" />
                                        <span className="h-1 rounded-full bg-white/22" />
                                        <span className="h-1 rounded-full bg-white/22" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="absolute inset-x-3 bottom-3 rounded-[4px] border border-[#12231d]/15 bg-[#d6d5cf] p-2">
                            <div className="h-1 w-2/3 rounded-full bg-[#12231d]/28" />
                            <div className="mt-2 h-1 w-1/2 rounded-full bg-[#12231d]/16" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TechnicalSketch() {
    return (
        <div className="relative min-h-[360px] overflow-hidden rounded-[24px] border border-[#173b32]/10 bg-[#f4f0e7] p-6 sm:p-8">
            <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(#173b3212 1px, transparent 1px), linear-gradient(90deg, #173b3212 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
            <div className="relative mx-auto max-w-[540px]">
                <p className="font-mono text-[10px] tracking-[0.12em] text-[#b97645] uppercase">technical baseline / preview</p>
                <svg viewBox="0 0 600 300" className="mt-7 w-full text-[#173b32]" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M300 12V58M300 58H150M300 58H450M150 58V110M450 58V110M150 110H70M150 110H230M450 110H370M450 110H530" stroke="currentColor" strokeWidth="2" />
                    {[70, 230, 370, 530].map((x) => (
                        <g key={x}>
                            <rect x={x - 28} y="110" width="56" height="38" rx="4" stroke="currentColor" strokeWidth="2" />
                            <path d={`M${x} 148V200`} stroke="currentColor" strokeWidth="2" />
                            <circle cx={x} cy="218" r="18" stroke="currentColor" strokeWidth="2" />
                        </g>
                    ))}
                    <rect x="265" y="12" width="70" height="26" rx="4" fill="#173b32" />
                    <text x="300" y="29" textAnchor="middle" fill="#f4f0e7" fontSize="10">MAIN</text>
                    <text x="70" y="255" textAnchor="middle" fill="#173b32" fontSize="11">WM</text>
                    <text x="230" y="255" textAnchor="middle" fill="#173b32" fontSize="11">DRYER</text>
                    <text x="370" y="255" textAnchor="middle" fill="#173b32" fontSize="11">AC</text>
                    <text x="530" y="255" textAnchor="middle" fill="#173b32" fontSize="11">PUMP</text>
                </svg>
            </div>
        </div>
    );
}

function PhoneMockup() {
    return (
        <div className="relative w-[280px] rotate-[7deg] rounded-[38px] border-[7px] border-[#0b1814] bg-[#0b1814] p-1 shadow-[0_28px_70px_rgba(0,0,0,0.35)] sm:w-[320px]">
            <div className="overflow-hidden rounded-[30px] bg-[#fbfaf6] text-[#12231d]">
                <div className="flex items-center justify-between bg-[#102e27] px-5 py-4 text-white">
                    <span className="text-[10px]">9:41</span>
                    <span className="text-[10px]">● ●●</span>
                </div>
                <div className="p-5">
                    <p className="text-[10px] font-semibold tracking-[0.12em] text-[#b97645] uppercase">Project</p>
                    <h3 className="mt-2 font-serif text-2xl">Laundry Citra</h3>
                    <div className="mt-6 space-y-2">
                        {['Engineering result', 'Single Line Diagram', 'BOM & Specification', 'Quotation / RFQ'].map((item, index) => (
                            <div key={item} className="flex items-center justify-between rounded-[10px] border border-[#173b32]/10 bg-white p-3">
                                <div className="flex items-center gap-3">
                                    <span className="grid h-7 w-7 place-items-center rounded-full bg-[#f4f0e7] text-[10px]">0{index + 1}</span>
                                    <span className="text-[11px] font-medium">{item}</span>
                                </div>
                                <Check className="h-3.5 w-3.5" />
                            </div>
                        ))}
                    </div>
                    <button type="button" className="mt-5 w-full rounded-[9px] bg-[#173b32] py-3 text-[11px] font-semibold text-white">Lihat Project</button>
                </div>
                <div className="grid grid-cols-3 border-t border-[#173b32]/10 bg-[#f4f0e7] px-4 py-3 text-center text-[9px] text-[#12231d]/60">
                    <span>Project</span><span>RFQ</span><span>Akun</span>
                </div>
            </div>
        </div>
    );
}

function PhoneEngineering() {
    return (
        <div className="relative w-[280px] rounded-[38px] border-[7px] border-[#0b1814] bg-[#0b1814] p-1 shadow-[0_28px_70px_rgba(0,0,0,0.35)] sm:w-[320px]">
            <div className="overflow-hidden rounded-[30px] bg-[#fbfaf6] text-[#12231d]">
                <div className="bg-[#102e27] px-5 pb-4 pt-5 text-white">
                    <div className="flex justify-between text-[9px] text-white/70"><span>9:41</span><span>● ●●</span></div>
                    <h3 className="mt-5 font-serif text-xl">Engineering Result</h3>
                </div>
                <div className="p-5">
                    <div className="grid grid-cols-2 gap-2">
                        <Metric label="Connected Load" value="24.8 kW" />
                        <Metric label="Design Load" value="19.6 kW" />
                        <Metric label="Design Current" value="31.4 A" />
                        <Metric label="Supply" value="3 Phase" />
                    </div>
                    <div className="mt-4 rounded-[12px] border border-[#173b32]/10 bg-[#f4f0e7] p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em]">Single Line</p>
                        <div className="mt-4 flex justify-center">
                            <svg viewBox="0 0 180 140" className="h-[140px] w-full" fill="none"><path d="M90 5V35M90 35H30M90 35H150M30 35V85M90 35V85M150 35V85" stroke="#173b32" strokeWidth="1.5"/><rect x="15" y="85" width="30" height="22" rx="3" stroke="#173b32"/><rect x="75" y="85" width="30" height="22" rx="3" stroke="#173b32"/><rect x="135" y="85" width="30" height="22" rx="3" stroke="#173b32"/></svg>
                        </div>
                    </div>
                    <button type="button" className="mt-4 flex w-full items-center justify-center gap-2 rounded-[9px] bg-[#173b32] py-3 text-[11px] font-semibold text-white"><Download className="h-3.5 w-3.5" /> Unduh Dokumen</button>
                </div>
            </div>
        </div>
    );
}

function ConfiguratorPreview() {
    return (
        <div className="rounded-[20px] border border-[#173b32]/12 bg-[#f4f0e7] p-4 sm:p-6">
            <div className="rounded-[14px] border border-[#173b32]/10 bg-[#fbfaf6] p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-4 border-b border-[#173b32]/10 pb-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-[10px] font-semibold tracking-[0.13em] text-[#b97645] uppercase">Project Laundry Citra</p>
                        <h3 className="mt-2 font-serif text-2xl">Configuration Review</h3>
                    </div>
                    <div className="flex gap-1 text-[9px]">
                        {['Configurator', 'Engineering Result', 'RFQ'].map((tab, index) => (
                            <span key={tab} className={`rounded-full px-3 py-1.5 ${index === 0 ? 'bg-[#173b32] text-white' : 'bg-[#f4f0e7]'}`}>{tab}</span>
                        ))}
                    </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                        ['Peralatan', '6 washing machine · 4 dryer'],
                        ['Beban & Proteksi', 'Preliminary baseline ready'],
                        ['Skema & Diagram', 'Generated from locked snapshot'],
                        ['Spesifikasi Komponen', 'Prepared for RFQ package'],
                    ].map(([title, body]) => (
                        <div key={title} className="flex items-center justify-between rounded-[10px] border border-[#173b32]/10 bg-[#f8f5ee] p-4">
                            <div><p className="text-[11px] font-semibold">{title}</p><p className="mt-1 text-[9px] text-[#12231d]/50">{body}</p></div>
                            <Check className="h-4 w-4" />
                        </div>
                    ))}
                </div>
                <button type="button" className="mt-5 flex w-full items-center justify-center gap-2 rounded-[9px] bg-[#173b32] px-4 py-3 text-[11px] font-semibold text-white">Lanjut ke Engineering Output <ArrowRight className="h-3.5 w-3.5" /></button>
            </div>
        </div>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return <div className="rounded-[10px] border border-[#173b32]/10 bg-white p-3"><p className="text-[8px] uppercase tracking-[0.08em] text-[#12231d]/45">{label}</p><p className="mt-1 text-[14px] font-semibold">{value}</p></div>;
}

function FooterColumn({ title, items }: { title: string; items: string[] }) {
    return <div><p className="text-[10px] font-semibold tracking-[0.14em] text-[#d69a70] uppercase">{title}</p><div className="mt-4 space-y-3">{items.map((item) => <p key={item} className="text-[12px] text-white/52">{item}</p>)}</div></div>;
}

function ArusantaraMark({ className = '' }: { className?: string }) {
    return (
        <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 5L6 39H14.2L24 21.3L33.8 39H42L24 5Z" fill="currentColor" />
            <path d="M24 13.5L19.1 23H28.9L24 13.5Z" fill="#b97645" />
            <path d="M15.5 33H32.5" stroke="#b97645" strokeWidth="2.4" />
        </svg>
    );
}

function CopperOrbit({ className = '' }: { className?: string }) {
    return (
        <svg viewBox="0 0 500 500" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="250" cy="250" rx="220" ry="82" transform="rotate(-20 250 250)" stroke="#b97645" strokeWidth="1.2" />
            <ellipse cx="250" cy="250" rx="170" ry="58" transform="rotate(-20 250 250)" stroke="#b97645" strokeWidth="0.8" opacity="0.75" />
        </svg>
    );
}

// Tailwind utility aliases kept inside the page to make the replacement self-contained.
// These class names are expanded below through normal class strings, so no extra CSS file is required.

