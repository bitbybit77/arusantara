import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    Check,
    CircleAlert,
    Database,
    FileCheck2,
    Gauge,
    ShieldCheck,
} from 'lucide-react';
import { GradientHero, PublicSiteShell } from '@/components/public-site-shell';
import { register } from '@/routes';

const flow = [
    {
        no: '01',
        title: 'Mulai dari equipment',
        body: 'Customer memilih perangkat yang digunakan, jumlah unit, status, dan pola pemakaian tanpa harus mengetahui breaker atau design current.',
    },
    {
        no: '02',
        title: 'Baca karakteristik listrik',
        body: 'Arusantara mengambil karakteristik yang tersedia dari katalog equipment dan menjaga sumber serta provenance datanya.',
    },
    {
        no: '03',
        title: 'Hitung secara deterministik',
        body: 'Connected load, design load, dan design current hanya dihitung ketika input yang dibutuhkan benar-benar tersedia.',
    },
    {
        no: '04',
        title: 'Bangun technical baseline',
        body: 'Result, assumption, warning, confidence, dan verification status disusun menjadi preliminary engineering specification.',
    },
];

export default function EngineeringPage() {
    return (
        <PublicSiteShell>
            <Head title="Engineering" />
            <main>
                <GradientHero
                    eyebrow="Preliminary Engineering"
                    title="Engineering dimulai dari kebutuhan yang dipahami customer."
                    body="Arusantara menerjemahkan equipment dan pola penggunaan menjadi preliminary engineering specification yang dapat ditelusuri, dijelaskan, dan dibawa ke proses RFQ."
                >
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link href={register()} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#153F32]">
                            Mulai konfigurasi <ArrowRight className="h-4 w-4" />
                        </Link>
                        <a href="#alur" className="rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white">
                            Lihat cara kerjanya
                        </a>
                    </div>
                </GradientHero>

                <section id="alur" className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
                    <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                        <div className="lg:sticky lg:top-28">
                            <p className="text-sm font-medium text-[#5F6B65]">Alur engineering</p>
                            <h2 className="mt-4 max-w-xl text-4xl font-bold tracking-[-0.055em] text-[#18201D] sm:text-5xl">
                                Dari data equipment menuju hasil yang bisa dijelaskan.
                            </h2>
                            <p className="mt-5 max-w-lg text-base leading-7 text-[#68736E]">
                                Bukan kotak hitam. Setiap tahap tetap menyimpan konteks dari input awal sampai technical baseline.
                            </p>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-[#153F32]/10 bg-white shadow-[0_24px_70px_rgba(24,32,29,0.06)]">
                            {flow.map((item, index) => (
                                <div key={item.no} className={`grid gap-4 p-7 sm:grid-cols-[90px_1fr] lg:p-9 ${index ? 'border-t border-[#153F32]/10' : ''}`}>
                                    <span className="font-mono text-xs font-bold tracking-[0.16em] text-[#C9783D]">{item.no}</span>
                                    <div>
                                        <h3 className="text-2xl font-bold tracking-[-0.04em] text-[#18201D]">{item.title}</h3>
                                        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#68736E]">{item.body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-[#0D1512] text-white">
                    <div className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
                        <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
                            <div>
                                <p className="text-sm font-medium text-white/60">Result experience</p>
                                <h2 className="mt-4 max-w-xl text-4xl font-bold tracking-[-0.055em] sm:text-5xl">
                                    Hasil engineering tidak berhenti di angka.
                                </h2>
                                <p className="mt-5 max-w-xl text-base leading-7 text-white/62">
                                    User melihat apa yang dapat dihitung, apa yang belum diketahui, alasan di balik hasil, dan apa yang harus diverifikasi sebelum final engineering.
                                </p>
                                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                    <Point icon={Gauge} title="Calculation" text="Nilai yang memang dapat dihitung dari input tersedia." />
                                    <Point icon={Database} title="Source" text="Konteks data equipment dan provenance." />
                                    <Point icon={CircleAlert} title="Warnings" text="Parameter yang masih membutuhkan verifikasi." />
                                    <Point icon={FileCheck2} title="Frozen baseline" text="Technical reference yang dibawa ke RFQ." />
                                </div>
                            </div>

                            <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-white/7 p-5 sm:p-7">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
                                    <div>
                                        <p className="text-[11px] font-medium text-white/42">Contoh struktur hasil</p>
                                        <h3 className="mt-2 text-xl font-bold">Preliminary Engineering Result</h3>
                                    </div>
                                    <span className="rounded-full bg-[#E7B083]/12 px-3 py-1.5 text-[11px] font-medium text-[#F2D6BD]">
                                        Requires verification
                                    </span>
                                </div>

                                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                    <Metric label="Connected load" value="Dihitung dari equipment" />
                                    <Metric label="Design load" value="Mengikuti usage assumption" />
                                    <Metric label="Design current" value="Hanya jika input cukup" />
                                    <Metric label="Supply" value="Preliminary recommendation" />
                                </div>

                                <div className="mt-5 rounded-2xl border border-[#E7B083]/18 bg-[#E7B083]/8 p-5">
                                    <div className="flex items-start gap-3">
                                        <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#E7B083]" />
                                        <div>
                                            <p className="text-sm font-bold">Unknown tetap unknown</p>
                                            <p className="mt-2 text-xs leading-5 text-white/58">
                                                Jika parameter seperti power factor tidak tersedia, Arusantara tidak mengarang nilai hanya agar calculation terlihat lengkap.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                    <Mini label="Inputs" value="Captured" />
                                    <Mini label="Assumptions" value="Visible" />
                                    <Mini label="Version" value="Traceable" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="rounded-2xl bg-[linear-gradient(135deg,#E8E0D2,#F3DFCB)] p-8 lg:p-10">
                            <BadgeCheck className="h-7 w-7 text-[#153F32]" />
                            <p className="mt-8 text-sm font-medium text-[#5F6B65]">Arusantara membantu</p>
                            <h3 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-[#18201D]">Menyusun technical baseline awal.</h3>
                            <ul className="mt-6 space-y-3 text-sm leading-6 text-[#68736E]">
                                {[
                                    'Mengambil konteks dari equipment dan penggunaan.',
                                    'Menghitung hanya ketika data mencukupi.',
                                    'Menjelaskan assumption, warning, dan verification status.',
                                    'Membekukan hasil yang dipakai sebagai baseline RFQ.',
                                ].map((item) => (
                                    <li key={item} className="flex gap-3"><Check className="mt-1 h-4 w-4 shrink-0 text-[#C9783D]" />{item}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="rounded-2xl border border-[#DED7C8] bg-white p-8 lg:p-10">
                            <ShieldCheck className="h-7 w-7 text-[#C9783D]" />
                            <p className="mt-8 text-sm font-medium text-[#5F6B65]">Safety boundary</p>
                            <h3 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-[#18201D]">Bukan final certified electrical design.</h3>
                            <p className="mt-5 text-sm leading-7 text-[#68736E]">
                                Final verification, compliance, final sizing, protection selection, manufacturing decision, dan site-specific engineering tetap menjadi tanggung jawab qualified engineer atau panel maker.
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#153F32]/10 pt-8">
                        <div>
                            <p className="text-sm font-bold text-[#18201D]">Engineering result siap dibawa ke procurement.</p>
                            <p className="mt-1 text-sm text-[#68736E]">Langkah berikutnya: frozen baseline masuk ke RFQ.</p>
                        </div>
                        <Link href="/permintaan-penawaran" className="inline-flex items-center gap-2 rounded-xl bg-[#153F32] px-5 py-3 text-sm font-bold text-white">
                            Lihat alur RFQ <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>
            </main>
        </PublicSiteShell>
    );
}

function Point({ icon: Icon, title, text }: { icon: typeof Gauge; title: string; text: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <Icon className="h-5 w-5 text-[#E7B083]" />
            <p className="mt-4 text-sm font-bold">{title}</p>
            <p className="mt-1 text-xs leading-5 text-white/52">{text}</p>
        </div>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-[#0D1512]/34 p-5">
            <p className="text-[11px] font-medium text-white/48">{label}</p>
            <p className="mt-3 text-sm font-bold text-white/88">{value}</p>
        </div>
    );
}

function Mini({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-white/35">{label}</p>
            <p className="mt-1 text-xs font-bold text-white/76">{value}</p>
        </div>
    );
}
