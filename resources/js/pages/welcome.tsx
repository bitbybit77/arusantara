import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Check, FileSearch, Gauge, MessagesSquare, ShieldCheck, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PublicSiteShell } from '@/components/public-site-shell';
import { dashboard, register } from '@/routes';

const steps = [
    ['01', 'Equipment', 'Masukkan perangkat usaha, jumlah, kondisi, dan pola pemakaian.'],
    ['02', 'Engineering', 'Bangun preliminary technical baseline yang explainable dan traceable.'],
    ['03', 'RFQ', 'Bawa baseline yang sama ke panel maker untuk proses penawaran.'],
    ['04', 'Negosiasi', 'Kelola deviation, revision quotation, hingga Deal secara terstruktur.'],
];

export default function Welcome() {
    const { auth } = usePage().props as { auth?: { user?: unknown | null } };
    const authUser = Boolean(auth?.user);

    return (
        <PublicSiteShell>
            <Head title="Arusantara — Dari kebutuhan usaha ke technical baseline" />
            <main>
                <section className="relative overflow-hidden bg-[linear-gradient(90deg,#0D1512_0%,#153F32_52%,#255947_100%)] text-white">
                    <div className="mx-auto min-h-[820px] max-w-[1500px] px-5 pb-0 pt-10 sm:px-8 lg:px-12 lg:pt-14">
                        <div className="mx-auto mt-8 max-w-4xl text-center lg:mt-10">
                            <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-bold leading-[1] tracking-[-0.045em] sm:text-6xl lg:text-[72px]">Dari kebutuhan usaha, menuju panel yang lebih terarah.</h1>
                            <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">Arusantara menerjemahkan data equipment menjadi preliminary engineering specification, lalu menjaga konteksnya tetap utuh sampai RFQ, quotation, negosiasi, dan Deal.</p>
                            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                <Link href={authUser ? dashboard() : register()} className="inline-flex min-w-36 items-center justify-center gap-2 rounded-xl bg-[#F6F1E7] px-6 py-3.5 text-sm font-bold text-[#153F32] shadow-[0_12px_35px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5">{authUser ? 'Buka Dashboard' : 'Mulai Project'} <ArrowRight className="h-4 w-4" /></Link>
                                <Link href="/engineering" className="inline-flex min-w-36 items-center justify-center rounded-xl border border-white/25 bg-white/8 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/12">Lihat cara kerja</Link>
                            </div>
                            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-white/58">
                                <span className="inline-flex items-center gap-2"><Check className="h-3.5 w-3.5" /> Source-backed equipment data</span>
                                <span className="inline-flex items-center gap-2"><Check className="h-3.5 w-3.5" /> Deterministic calculation</span>
                                <span className="inline-flex items-center gap-2"><Check className="h-3.5 w-3.5" /> Structured RFQ workflow</span>
                            </div>
                        </div>

                        <div className="mx-auto mt-14 grid max-w-[1240px] gap-3 md:grid-cols-2 lg:grid-cols-[1.65fr_.9fr_.9fr_.9fr]">
                            <Link href="/engineering" className="group relative min-h-[340px] overflow-hidden rounded-t-[24px] border border-white/14 bg-[#F6F1E7] text-[#18201D] shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
                                <div className="relative z-20 flex items-start justify-between gap-4 p-6 sm:p-7">
                                    <div>
                                        <span className="inline-flex rounded-full bg-[#153F32]/8 px-3 py-1 text-[11px] font-medium text-[#153F32]">Equipment → Engineering</span>
                                        <h2 className="mt-4 max-w-[320px] text-2xl font-bold tracking-[-0.04em]">Panel distribusi dimulai dari kebutuhan nyata usaha.</h2>
                                    </div>
                                    <ArrowRight className="h-5 w-5 shrink-0 text-[#C9783D] transition group-hover:translate-x-1" />
                                </div>
                                <div className="absolute inset-x-0 bottom-0 top-[124px] flex items-end justify-center">
                                    <img src="/images/landing/panel-hero.png" alt="Panel distribusi Arusantara" className="h-[94%] w-auto max-w-[72%] object-contain object-center drop-shadow-[0_28px_28px_rgba(21,63,50,0.22)] transition duration-500 group-hover:scale-[1.025]" />
                                </div>
                            </Link>

                            <PanelSliderCard
                                href="/engineering"
                                icon={Gauge}
                                label="Distribution family"
                                tone="cream"
                                panels={[
                                    { type: 'mdp', name: 'Main Distribution Panel', short: 'MDP', note: 'Distribusi utama dari incoming supply.' },
                                    { type: 'sdp', name: 'Sub Distribution Panel', short: 'SDP', note: 'Distribusi lanjutan ke area atau kelompok beban.' },
                                    { type: 'db', name: 'Distribution Board', short: 'DB', note: 'Distribusi akhir untuk kelompok circuit.' },
                                ]}
                            />
                            <PanelSliderCard
                                href="/permintaan-penawaran"
                                icon={FileSearch}
                                label="Power distribution"
                                tone="light"
                                panels={[
                                    { type: 'ats', name: 'ATS / AMF Panel', short: 'ATS', note: 'Transfer sumber normal dan backup.' },
                                    { type: 'capacitor', name: 'Capacitor Bank Panel', short: 'CAP', note: 'Kompensasi daya reaktif pada sistem distribusi.' },
                                    { type: 'metering', name: 'Metering Panel', short: 'MTR', note: 'Monitoring parameter kelistrikan distribusi.' },
                                ]}
                            />
                            <PanelSliderCard
                                href="/panel-makers"
                                icon={MessagesSquare}
                                label="Load distribution"
                                tone="dark"
                                panels={[
                                    { type: 'mcc', name: 'Motor Control Center', short: 'MCC', note: 'Distribusi dan kontrol untuk kelompok motor.' },
                                    { type: 'control', name: 'Control & Distribution', short: 'CTRL', note: 'Distribusi dengan fungsi kontrol terintegrasi.' },
                                    { type: 'sdp', name: 'Floor Distribution Panel', short: 'FDP', note: 'Distribusi per lantai atau zona fasilitas.' },
                                ]}
                            />
                        </div>
                    </div>
                </section>

                <section id="cara-kerja" className="scroll-mt-28 mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
                    <div className="grid gap-10 border-b border-[#153F32]/14 pb-12 lg:grid-cols-[.95fr_1.05fr] lg:items-end">
                        <h2 className="max-w-3xl text-4xl font-bold tracking-[-0.05em] text-[#18201D] sm:text-5xl">
                            Satu alur dari equipment sampai keputusan penawaran.
                        </h2>
                        <p className="max-w-2xl text-base leading-7 text-[#68736E]">
                            Arusantara menjaga hasil engineering tetap terhubung dengan permintaan penawaran, quotation revision,
                            technical deviation, dan Deal. Tidak ada konteks teknis yang perlu dimulai ulang di setiap tahap.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-0 md:grid-cols-2 xl:grid-cols-4">
                        {steps.map(([n, t, b], index) => (
                            <div key={n} className="relative border-b border-[#153F32]/12 px-0 py-7 md:px-6 xl:border-b-0 xl:border-r xl:first:pl-0 xl:last:border-r-0 xl:last:pr-0">
                                <div className="flex items-baseline justify-between gap-5">
                                    <span className="font-mono text-sm text-[#68736E]">{n}</span>
                                    {index < steps.length - 1 && <span className="hidden h-px flex-1 bg-[#153F32]/14 xl:block" />}
                                </div>
                                <h3 className="mt-8 text-2xl font-bold tracking-[-0.035em] text-[#18201D]">{t}</h3>
                                <p className="mt-3 max-w-[280px] text-sm leading-6 text-[#68736E]">{b}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-[#0D1512] text-white">
                    <div className="mx-auto grid max-w-[1500px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:px-12 lg:py-28">
                        <div>
                            <h2 className="max-w-xl text-4xl font-bold tracking-[-0.05em] sm:text-5xl">
                                Bukan sekadar kalkulator beban.
                            </h2>
                            <p className="mt-5 max-w-lg text-base leading-7 text-white/62">
                                Nilai Arusantara ada pada kesinambungan konteks: apa yang dipakai customer, bagaimana hasil dihitung,
                                dan apa yang akhirnya dinegosiasikan dengan panel maker.
                            </p>
                        </div>

                        <div className="border-t border-white/14">
                            <FeatureLine
                                icon={Wrench}
                                title="Mulai dari equipment"
                                body="Customer memasukkan perangkat, jumlah, kondisi, dan pola penggunaan yang benar-benar mereka pahami."
                                href="/engineering"
                            />
                            <FeatureLine
                                icon={Gauge}
                                title="Engineering yang bisa ditelusuri"
                                body="Hasil calculation membawa assumptions, warning, source, confidence, dan verification status."
                                href="/engineering"
                            />
                            <FeatureLine
                                icon={MessagesSquare}
                                title="Perubahan teknis tetap terlihat"
                                body="Requested specification dan proposed specification dipisahkan saat quotation dan technical deviation."
                                href="/permintaan-penawaran"
                            />
                        </div>
                    </div>
                </section>

                <section id="untuk-anda" className="scroll-mt-28 px-5 py-14 sm:px-8 lg:px-8 lg:py-16">
                    <div className="mx-auto grid max-w-[1200px] overflow-hidden rounded-[18px] border border-[#153F32]/12 bg-[#ECE6DA] shadow-[0_12px_28px_rgba(13,21,18,0.04)] lg:grid-cols-[.68fr_1.32fr]">
                        <div className="border-b border-[#153F32]/12 p-7 sm:p-8 lg:border-b-0 lg:border-r lg:p-8">
                            <h2 className="max-w-md text-[32px] font-bold leading-[1.08] tracking-[-0.042em] text-[#18201D] sm:text-[36px]">
                                Masuk dari peran Anda, tetap bertemu di baseline yang sama.
                            </h2>
                            <p className="mt-5 max-w-md text-sm leading-6 text-[#68736E]">
                                Customer tidak perlu berbicara seperti engineer, sementara panel maker dan procurement tetap menerima konteks
                                teknis yang cukup untuk melanjutkan proses.
                            </p>
                        </div>

                        <div className="bg-[#F9F7F2]">
                            <AudienceRow
                                href="/pemilik-usaha"
                                role="Pemilik Usaha"
                                title="Mulai dari equipment yang benar-benar dipakai."
                                body="Masukkan perangkat, jumlah, kondisi, dan pola penggunaan tanpa menentukan breaker atau parameter teknis sejak awal."
                            />
                            <AudienceRow
                                href="/panel-makers"
                                role="Panel Maker"
                                title="Terima technical baseline yang lebih terstruktur."
                                body="Review konteks engineering, susun quotation, dan nyatakan technical deviation secara eksplisit."
                            />
                            <AudienceRow
                                href="/procurement"
                                role="Procurement / Project Team"
                                title="Jaga penawaran tetap mengacu pada konteks teknis yang sama."
                                body="Spesifikasi, dampak harga, lead time, dan revision quotation tetap dapat ditelusuri sebelum Deal."
                            />
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-[1200px] px-5 pb-14 sm:px-8 lg:px-8 lg:pb-16">
                    <div className="overflow-hidden rounded-[18px] border border-[#153F32]/12 bg-white shadow-[0_12px_28px_rgba(13,21,18,0.04)]">
                        <div className="grid lg:min-h-[340px] lg:grid-cols-[.92fr_1.08fr]">
                            <div className="p-7 sm:p-8 lg:p-9 xl:p-10">
                                <Gauge className="h-7 w-7 text-[#153F32]" />
                                <h2 className="mt-5 max-w-[520px] text-[31px] font-bold leading-[1.08] tracking-[-0.04em] text-[#18201D] sm:text-[35px]">
                                    Engineering dan penawaran bukan dua proses yang terpisah.
                                </h2>
                                <p className="mt-3.5 max-w-[500px] text-sm leading-6 text-[#68736E]">
                                    Technical baseline yang terbentuk dari equipment dibawa ke proses permintaan penawaran tanpa meminta customer
                                    menyusun spesifikasi dari nol.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Link href="/engineering" className="inline-flex items-center gap-2 rounded-lg bg-[#153F32] px-4 py-2.5 text-sm font-bold text-white">
                                        Lihat Engineering <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <Link href="/permintaan-penawaran" className="inline-flex items-center gap-2 rounded-lg border border-[#153F32]/18 px-4 py-2.5 text-sm font-bold text-[#153F32]">
                                        Lihat Penawaran <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>

                            <div className="flex min-h-[340px] items-center bg-[#123A2E] p-7 text-white sm:p-8 lg:p-9 xl:p-10">
                                <div className="mx-auto grid w-full max-w-[520px] gap-5">
                                    <FlowPoint title="Equipment" body="Perangkat, jumlah, kondisi, dan pola penggunaan." />
                                    <FlowPoint title="Engineering baseline" body="Connected load, design load, calculation status, assumptions, dan warning." />
                                    <FlowPoint title="Permintaan penawaran" body="Technical baseline dibekukan dan dibawa ke panel maker." />
                                    <FlowPoint title="Quotation & deviation" body="Perubahan spesifikasi, harga, dan lead time tetap punya jejak yang jelas." />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="px-5 pb-14 sm:px-8 lg:px-8 lg:pb-16">
                    <div className="mx-auto grid max-w-[1200px] overflow-hidden rounded-[18px] bg-[#153F32] text-white shadow-[0_12px_28px_rgba(13,21,18,0.05)] lg:min-h-[340px] lg:grid-cols-[1fr_360px]">
                        <div className="px-7 py-9 sm:px-8 sm:py-10 lg:flex lg:flex-col lg:justify-center lg:px-10 lg:py-10">
                            <ShieldCheck className="h-6 w-6 text-white/68" />
                            <h2 className="mt-5 max-w-[680px] text-[31px] font-bold leading-[1.08] tracking-[-0.042em] sm:text-[35px]">
                                Buat project dari kebutuhan nyata, bukan dari asumsi engineering tersembunyi.
                            </h2>
                            <p className="mt-3.5 max-w-[610px] text-sm leading-6 text-white/66">
                                Output Arusantara adalah preliminary engineering specification. Final verification dan compliance tetap berada
                                pada qualified engineer atau panel maker.
                            </p>
                            <Link href={authUser ? dashboard() : register()} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#F6F1E7] px-4 py-2.5 text-sm font-bold text-[#153F32]">
                                {authUser ? 'Buka Dashboard' : 'Mulai Project'} <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="relative hidden min-h-[340px] items-center justify-center overflow-hidden bg-[#0D1512]/22 p-8 lg:flex">
                            <img
                                src="/images/landing/panel-hero.png"
                                alt="Panel distribusi"
                                className="max-h-[245px] max-w-[260px] object-contain opacity-95 drop-shadow-[0_14px_24px_rgba(0,0,0,0.18)]"
                            />
                        </div>
                    </div>
                </section>
            </main>
        </PublicSiteShell>
    );
}

type PanelType = 'mdp' | 'sdp' | 'db' | 'ats' | 'capacitor' | 'metering' | 'mcc' | 'control';

type PanelSlide = {
    type: PanelType;
    name: string;
    short: string;
    note: string;
};

function PanelSliderCard({ href, icon: Icon, label, panels, tone }: { href: string; icon: typeof Gauge; label: string; panels: PanelSlide[]; tone: 'cream' | 'light' | 'dark' }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = window.setInterval(() => setIndex((current) => (current + 1) % panels.length), 3200);

        return () => window.clearInterval(timer);
    }, [panels.length]);

    const panel = panels[index];
    const dark = tone === 'dark';
    const styles = dark
        ? 'border-white/12 bg-[#101B17] text-white'
        : tone === 'light'
            ? 'border-[#153F32]/10 bg-[#EEF1EB] text-[#18201D]'
            : 'border-[#153F32]/10 bg-[#F3E7D9] text-[#18201D]';

    return (
        <div className={`relative min-h-[340px] overflow-hidden rounded-t-[24px] border p-5 ${styles}`}>
            <div className="flex items-center justify-between gap-3">
                <div className={`grid h-10 w-10 place-items-center rounded-xl ${dark ? 'bg-white/8 text-[#E7B083]' : 'bg-white/70 text-[#153F32]'}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <span className={`rounded-full px-2.5 py-1 font-mono text-[9px] font-bold tracking-[0.16em] ${dark ? 'bg-white/8 text-white/58' : 'bg-[#153F32]/7 text-[#68736E]'}`}>{index + 1}/{panels.length}</span>
            </div>

            <p className={`mt-5 text-[11px] font-medium ${dark ? 'text-white/42' : 'text-[#8A7562]'}`}>{label}</p>

            <div className="mt-2 flex min-h-[145px] items-center justify-center">
                <PanelMiniature type={panel.type} dark={dark} short={panel.short} />
            </div>

            <div className="relative z-10">
                <h3 className="text-lg font-bold leading-tight tracking-[-0.035em]">{panel.name}</h3>
                <p className={`mt-2 min-h-[42px] text-xs leading-5 ${dark ? 'text-white/58' : 'text-[#68736E]'}`}>{panel.note}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex gap-1.5">
                        {panels.map((item, dotIndex) => (
                            <button
                                key={`${item.short}-${dotIndex}`}
                                type="button"
                                aria-label={`Tampilkan ${item.name}`}
                                onClick={() => setIndex(dotIndex)}
                                className={`h-1.5 rounded-full transition-all ${dotIndex === index ? `w-5 ${dark ? 'bg-[#E7B083]' : 'bg-[#C9783D]'}` : `w-1.5 ${dark ? 'bg-white/18' : 'bg-[#153F32]/18'}`}`}
                            />
                        ))}
                    </div>
                    <Link href={href} className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${dark ? 'text-[#E7B083]' : 'text-[#153F32]'}`}>
                        Lihat <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

function PanelMiniature({ type, dark, short }: { type: PanelType; dark: boolean; short: string }) {
    const shell = dark ? 'border-white/18 bg-[#E8ECE7]' : 'border-[#153F32]/16 bg-[#F7F5EF]';
    const inner = dark ? 'bg-[#CBD2CC]' : 'bg-[#DFE1DA]';
    const line = dark ? 'bg-[#8D9991]' : 'bg-[#AEB7B1]';

    return (
        <div className="relative h-[132px] w-[104px] transition-all duration-500">
            <div className="absolute inset-x-2 bottom-0 h-3 rounded-[50%] bg-black/12 blur-[6px]" />
            <div className={`absolute inset-x-2 top-0 h-[122px] rounded-[10px] border shadow-[0_16px_26px_rgba(13,21,18,0.14)] ${shell}`}>
                <div className="absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-[#153F32]/12" />
                <div className="absolute left-2.5 top-2 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C9783D]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#153F32]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D8A13D]" />
                </div>
                <span className="absolute right-2 top-2 font-mono text-[6px] font-bold tracking-[0.08em] text-[#153F32]/55">{short}</span>

                {type === 'ats' && <div className="absolute left-1/2 top-8 flex -translate-x-1/2 items-center gap-1"><span className="h-5 w-5 rounded border border-[#153F32]/20 bg-white" /><ArrowRight className="h-2.5 w-2.5 text-[#C9783D]" /><span className="h-5 w-5 rounded border border-[#153F32]/20 bg-white" /></div>}
                {type === 'capacitor' && <div className="absolute left-3 right-3 top-8 grid grid-cols-3 gap-1.5">{Array.from({ length: 6 }).map((_, i) => <span key={i} className={`h-5 rounded-sm ${inner}`} />)}</div>}
                {type === 'metering' && <div className="absolute left-3 right-3 top-8 grid grid-cols-2 gap-2"><span className="h-7 rounded border border-[#153F32]/15 bg-[#13251F]" /><span className="h-7 rounded border border-[#153F32]/15 bg-[#13251F]" /></div>}
                {type === 'mcc' && <div className="absolute left-3 right-3 top-8 grid grid-cols-2 gap-1">{Array.from({ length: 8 }).map((_, i) => <span key={i} className={`h-4 rounded-sm ${inner}`} />)}</div>}
                {type === 'control' && <div className="absolute left-3 right-3 top-8"><div className="mx-auto h-7 w-10 rounded border border-[#153F32]/15 bg-[#13251F]" /><div className="mt-2 flex justify-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#C9783D]" /><span className="h-2 w-2 rounded-full bg-[#153F32]" /><span className="h-2 w-2 rounded-full bg-[#D8A13D]" /></div></div>}
                {(type === 'mdp' || type === 'sdp' || type === 'db') && <div className="absolute left-3 right-3 top-8 grid grid-cols-2 gap-1.5">{Array.from({ length: type === 'mdp' ? 6 : type === 'sdp' ? 8 : 10 }).map((_, i) => <span key={i} className={`h-3.5 rounded-sm ${inner}`} />)}</div>}

                <div className="absolute bottom-3 left-3 right-3 grid grid-cols-5 gap-1">{Array.from({ length: 5 }).map((_, i) => <span key={i} className={`h-0.5 ${line}`} />)}</div>
            </div>
        </div>
    );
}

function FeatureLine({ icon: Icon, title, body, href }: { icon: typeof Wrench; title: string; body: string; href: string }) {
    return (
        <Link href={href} className="group grid gap-4 border-b border-white/14 py-7 last:border-b-0 sm:grid-cols-[44px_1fr_auto] sm:items-start">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/12 bg-white/[0.04] text-white/74">
                <Icon className="h-5 w-5" />
            </span>
            <span>
                <span className="block text-xl font-bold tracking-[-0.025em] text-white">{title}</span>
                <span className="mt-2 block max-w-2xl text-sm leading-6 text-white/55">{body}</span>
            </span>
            <ArrowRight className="mt-1 hidden h-4 w-4 text-white/42 transition group-hover:translate-x-1 group-hover:text-white sm:block" />
        </Link>
    );
}

function AudienceRow({ href, role, title, body }: { href: string; role: string; title: string; body: string }) {
    return (
        <Link href={href} className="group grid gap-4 border-b border-[#153F32]/12 px-7 py-5 last:border-b-0 sm:px-8 sm:py-5 lg:grid-cols-[135px_1fr_auto] lg:items-center">
            <span className="text-sm font-medium text-[#5F6B65]">{role}</span>
            <span>
                <span className="block max-w-xl text-[21px] font-bold leading-[1.2] tracking-[-0.035em] text-[#18201D] sm:text-[22px]">{title}</span>
                <span className="mt-2 block max-w-2xl text-sm leading-6 text-[#68736E]">{body}</span>
            </span>
            <ArrowRight className="h-5 w-5 text-[#153F32]/38 transition group-hover:translate-x-1 group-hover:text-[#153F32]" />
        </Link>
    );
}

function FlowPoint({ title, body }: { title: string; body: string }) {
    return (
        <div className="grid grid-cols-[20px_1fr] gap-3.5">
            <span className="flex h-7 items-center justify-center" aria-hidden="true">
                <span className="h-2 w-2 rounded-full bg-[#F6F1E7]" />
            </span>
            <div>
                <h3 className="min-h-7 text-lg font-bold leading-7 tracking-[-0.025em] sm:text-xl">{title}</h3>
                <p className="mt-1 max-w-xl text-sm leading-6 text-white/58">{body}</p>
            </div>
        </div>
    );
}
