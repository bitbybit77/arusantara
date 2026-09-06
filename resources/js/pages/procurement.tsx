import { Head, Link } from '@inertiajs/react';
import { ArrowRight, FileCheck2, GitCompareArrows, History, ShieldCheck } from 'lucide-react';
import { GradientHero, PublicSiteShell } from '@/components/public-site-shell';

const items = [
    [FileCheck2, 'Technical baseline', 'RFQ merujuk ke snapshot engineering yang dibekukan.'],
    [GitCompareArrows, 'Deviation terlihat', 'Requested dan proposed specification dipisahkan secara eksplisit.'],
    [History, 'Revision history', 'Quote V1 dan V2 tidak saling menimpa.'],
    [ShieldCheck, 'Accepted terms', 'Deal membekukan technical dan commercial terms yang diterima.'],
] as const;

export default function ProcurementPage() {
    return (
        <PublicSiteShell>
            <Head title="Untuk Procurement" />
            <main>
                <GradientHero
                    eyebrow="Untuk Procurement / Project Team"
                    title="Bandingkan penawaran tanpa kehilangan konteks spesifikasi."
                    body="Arusantara menjaga baseline, deviation, revision, dan acceptance tetap terhubung sehingga perubahan tidak hanya hidup di chat atau spreadsheet terpisah."
                />
                <section className="mx-auto max-w-[1300px] px-5 py-20 sm:px-8 lg:py-28">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {items.map(([Icon, title, body]) => (
                            <div key={title} className="rounded-2xl border border-[#153F32]/10 bg-white p-7">
                                <Icon className="h-6 w-6 text-[#153F32]" />
                                <h2 className="mt-7 text-2xl font-bold">{title}</h2>
                                <p className="mt-3 text-sm leading-6 text-[#68736E]">{body}</p>
                            </div>
                        ))}
                    </div>
                    <Link
                        href="/permintaan-penawaran"
                        className="mt-10 inline-flex items-center gap-2 rounded-xl bg-[#153F32] px-5 py-3 text-sm font-bold text-white"
                    >
                        Lihat alur penawaran <ArrowRight className="h-4 w-4" />
                    </Link>
                </section>
            </main>
        </PublicSiteShell>
    );
}
