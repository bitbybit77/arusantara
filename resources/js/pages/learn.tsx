import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BookOpen, Cable, CircleHelp, FileSearch, Gauge, Layers3, ShieldAlert, Zap } from 'lucide-react';
import { PublicSiteShell, GradientHero } from '@/components/public-site-shell';

const topics = [
    [Zap, 'Dasar listrik usaha', 'Memahami kW, voltage, phase, dan kenapa data nameplate equipment penting.'],
    [Gauge, 'Connected vs design load', 'Kenapa total nameplate load tidak selalu identik dengan kebutuhan desain final.'],
    [Cable, 'Power factor & unknown data', 'Apa yang terjadi ketika datasheet tidak mempublikasikan parameter tertentu.'],
    [ShieldAlert, 'Preliminary vs final design', 'Memahami batas antara konfigurasi awal dan final certified engineering.'],
    [FileSearch, 'RFQ engineering', 'Kenapa engineering baseline perlu dibekukan sebelum meminta quotation.'],
    [Layers3, 'Technical deviation', 'Cara membaca requested specification, proposed specification, reason, dan impact.'],
] as const;

export default function LearnPage() {
    return (
        <PublicSiteShell>
            <Head title="Belajar" />
            <main>
                <GradientHero
                    eyebrow="Learning Center"
                    title="Belajar kelistrikan tanpa harus menjadi engineer lebih dulu."
                    body="Arusantara menjelaskan istilah yang muncul selama configuration, engineering, dan procurement agar customer memahami konteks sebelum mengambil keputusan."
                />

                <section className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
                    <div className="max-w-3xl">
                        <p className="text-sm font-medium text-[#5F6B65]">Topik utama</p>
                        <h2 className="mt-4 text-4xl font-bold tracking-[-0.055em] text-[#18201D] sm:text-5xl">Mulai dari istilah yang muncul di workflow nyata.</h2>
                    </div>

                    <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {topics.map(([Icon, title, body]) => (
                            <article key={title} className="group rounded-2xl border border-[#153F32]/10 bg-white p-7 transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(24,32,29,0.07)]">
                                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#153F32]/7 text-[#153F32]"><Icon className="h-5 w-5" /></span>
                                <h3 className="mt-8 text-2xl font-bold tracking-[-0.04em] text-[#18201D]">{title}</h3>
                                <p className="mt-3 text-sm leading-6 text-[#68736E]">{body}</p>
                                <span className="mt-8 inline-flex items-center gap-2 text-xs font-bold text-[#8A7562]">Materi ringkas <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="bg-[#0D1512] text-white">
                    <div className="mx-auto grid max-w-[1500px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:px-12 lg:py-28">
                        <div>
                            <CircleHelp className="h-8 w-8 text-[#E7B083]" />
                            <p className="mt-8 text-sm font-medium text-white/60">Contextual education</p>
                            <h2 className="mt-4 max-w-xl text-4xl font-bold tracking-[-0.055em] sm:text-5xl">Penjelasan muncul saat memang dibutuhkan.</h2>
                            <p className="mt-5 max-w-xl text-base leading-7 text-white/62">
                                Learning Center bukan satu-satunya tempat belajar. Penjelasan juga harus hadir dekat dengan input, warning, dan recommendation di dalam aplikasi.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {[
                                ['Mengapa kami menanyakan ini?', 'Konteks input customer.'],
                                ['Apa arti tiga fasa?', 'Istilah yang muncul di equipment dan supply.'],
                                ['Mengapa membutuhkan verifikasi?', 'Alasan hasil belum boleh dianggap final.'],
                                ['Apa fungsi MCCB?', 'Istilah teknis yang muncul saat procurement.'],
                            ].map(([title, body]) => (
                                <div key={title} className="rounded-xl border border-white/12 bg-white/6 p-6">
                                    <BookOpen className="h-5 w-5 text-[#E7B083]" />
                                    <h3 className="mt-6 text-lg font-bold">{title}</h3>
                                    <p className="mt-2 text-xs leading-5 text-white/52">{body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
                    <div className="rounded-2xl bg-[linear-gradient(135deg,#E8E0D2,#F3DFCB)] p-8 lg:p-12">
                        <ShieldAlert className="h-7 w-7 text-[#153F32]" />
                        <h2 className="mt-6 max-w-3xl text-4xl font-bold tracking-[-0.055em] text-[#18201D]">Materi edukasi membantu memahami hasil, bukan menggantikan engineer.</h2>
                        <p className="mt-5 max-w-2xl text-sm leading-7 text-[#68736E]">
                            Arusantara tidak menggunakan materi edukasi untuk membuat keputusan final safety-critical secara otomatis. Final verification tetap membutuhkan professional review.
                        </p>
                        <Link href="/engineering" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#153F32]">
                            Lihat bagaimana Engineering bekerja <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>
            </main>
        </PublicSiteShell>
    );
}
