import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BookOpen, Gauge, GraduationCap, Headphones, Info, Megaphone, MonitorPlay, PencilLine } from 'lucide-react';
import { GradientHero, PublicSiteShell } from '@/components/public-site-shell';

const artikel = [
    [PencilLine, 'Blog & Insight', 'Artikel praktis seputar panel listrik, kebutuhan equipment, engineering awal, dan procurement teknis.', '/insight'],
    [Megaphone, 'Info Platform', 'Ringkasan kemampuan Arusantara, batas penggunaan, fitur utama, dan perkembangan platform.', '/info-platform'],
    [Info, 'Tentang Kami', 'Latar belakang, positioning, prinsip engineering, dan alasan Arusantara dibangun.', '/about'],
    [Headphones, 'Kontak', 'Jalur untuk menghubungi tim Arusantara dan mendapatkan bantuan.', '/kontak'],
] as const;

const panduan = [
    [Gauge, 'Pengetahuan Dasar', 'Konsep daya, fasa, beban, panel distribusi, dan istilah yang perlu dipahami sebelum mulai.', '/pengetahuan-dasar'],
    [BookOpen, 'Pojok Belajar', 'Materi terstruktur tentang equipment, engineering, RFQ, dan technical deviation.', '/learn'],
    [MonitorPlay, 'Tutorial', 'Panduan langkah demi langkah menggunakan Arusantara dari project sampai Deal.', '/tutorial'],
    [GraduationCap, 'Arusantara Academy', 'Materi pembelajaran yang lebih mendalam untuk customer, panel maker, dan procurement.', '/academy'],
] as const;

export default function InformasiPage() {
    return (
        <PublicSiteShell>
            <Head title="Informasi" />
            <main>
                <GradientHero
                    eyebrow="Pusat Informasi"
                    title="Belajar, memahami, lalu mengambil keputusan dengan konteks yang tepat."
                    body="Pusat Informasi Arusantara memisahkan artikel ringan dari panduan terstruktur agar pengguna nonteknis dapat belajar tanpa tersesat di istilah engineering."
                />

                <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:py-28">
                    <div className="grid gap-12 lg:grid-cols-[0.72fr_1.55fr]">
                        <div>
                            <p className="text-sm font-medium text-[#5F6B65]">Artikel</p>
                            <div className="mt-5 divide-y divide-[#153F32]/10 border-y border-[#153F32]/10">
                                {artikel.map(([Icon, title, body, href]) => (
                                    <Link key={title} href={href} className="group flex gap-4 py-6">
                                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#153F32]/6 text-[#153F32]"><Icon className="h-5 w-5" /></span>
                                        <span>
                                            <span className="text-base font-bold tracking-[-0.02em]">{title}</span>
                                            <span className="mt-1 block text-sm leading-6 text-[#68736E]">{body}</span>
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-[#5F6B65]">Panduan</p>
                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                {panduan.map(([Icon, title, body, href]) => (
                                    <Link key={title} href={href} className="group rounded-2xl border border-[#153F32]/10 bg-white p-7 transition hover:-translate-y-1 hover:border-[#153F32]/20">
                                        <Icon className="h-6 w-6 text-[#153F32]" />
                                        <h2 className="mt-8 text-2xl font-bold tracking-[-0.04em]">{title}</h2>
                                        <p className="mt-3 text-sm leading-6 text-[#68736E]">{body}</p>
                                        <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#153F32]">Buka halaman <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </PublicSiteShell>
    );
}
