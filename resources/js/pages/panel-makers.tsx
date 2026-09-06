import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    ClipboardCheck,
    FileText,
    MessageSquareText,
    ShieldCheck,
    Wrench,
} from 'lucide-react';
import { GradientHero, PublicSiteShell } from '@/components/public-site-shell';
import { register } from '@/routes';

const benefits = [
    [ClipboardCheck, 'RFQ lebih terstruktur', 'Equipment context, engineering baseline, requirement, dan verification note datang dalam satu alur.'],
    [FileText, 'Quotation revision', 'Commercial response dapat direvisi tanpa menghapus quotation version sebelumnya.'],
    [MessageSquareText, 'Technical deviation', 'Perubahan terhadap requested specification dibahas sebagai object yang jelas.'],
    [ShieldCheck, 'Safety boundary terlihat', 'Preliminary result dan hal yang membutuhkan verification tetap terlihat sebelum final engineering.'],
] as const;

export default function PanelMakersPage() {
    return (
        <PublicSiteShell>
            <Head title="Panel Maker" />
            <main>
                <GradientHero
                    eyebrow="Untuk Panel Maker"
                    title="Masuk ke RFQ dengan technical context yang lebih rapi sejak awal."
                    body="Panel maker membaca frozen engineering baseline, requirement customer, verification note, lalu menyusun quotation dan technical deviation dalam workflow yang terstruktur."
                >
                    <div className="mt-8">
                        <Link href={register()} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#153F32]">
                            Daftar sebagai Panel Maker <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </GradientHero>

                <section className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {benefits.map(([Icon, title, body]) => (
                            <div key={title} className="rounded-2xl border border-[#153F32]/10 bg-white p-7">
                                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#153F32]/7 text-[#153F32]"><Icon className="h-5 w-5" /></span>
                                <h2 className="mt-8 text-2xl font-bold tracking-[-0.04em] text-[#18201D]">{title}</h2>
                                <p className="mt-3 text-sm leading-6 text-[#68736E]">{body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-[#0D1512] text-white">
                    <div className="mx-auto grid max-w-[1500px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-12 lg:py-28">
                        <div>
                            <p className="text-sm font-medium text-white/60">Maker workspace</p>
                            <h2 className="mt-4 max-w-xl text-4xl font-bold tracking-[-0.055em] sm:text-5xl">Fokus pada review, proposal, dan keputusan teknis.</h2>
                            <p className="mt-5 max-w-xl text-base leading-7 text-white/62">
                                Tidak perlu menebak ulang kebutuhan customer dari chat panjang. RFQ membawa snapshot dan requirement yang sudah terstruktur.
                            </p>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-white/12 bg-white/7">
                            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                                <div>
                                    <p className="text-[11px] font-medium text-white/48">RFQ Inbox</p>
                                    <h3 className="mt-1 text-lg font-bold">Technical procurement workspace</h3>
                                </div>
                                <span className="rounded-full bg-white/7 px-3 py-1.5 text-[10px] font-bold text-white/58">Open</span>
                            </div>

                            <div className="divide-y divide-white/10">
                                <MakerRow title="Review frozen baseline" detail="Equipment, calculation snapshot, warning, verification status" status="Ready" />
                                <MakerRow title="Susun quotation" detail="Panel items, fabrication, installation, lead time, warranty" status="Draft" />
                                <MakerRow title="Catat technical deviation" detail="Requested vs proposed specification dan impact" status="Structured" />
                                <MakerRow title="Submit revision" detail="Revision history tetap tersimpan" status="Traceable" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
                    <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
                        <div className="rounded-2xl bg-[linear-gradient(135deg,#E8E0D2,#F3DFCB)] p-8 lg:p-10">
                            <Wrench className="h-7 w-7 text-[#153F32]" />
                            <p className="mt-8 text-sm font-medium text-[#5F6B65]">Scope quotation</p>
                            <h3 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-[#18201D]">Yang ditawarkan adalah panel dan service, bukan equipment customer.</h3>
                            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#68736E]">
                                Washing machine, dryer, atau equipment lain berperan sebagai load. Maker menyusun penawaran untuk panel enclosure, protection component, fabrication, installation/service, dan kebutuhan panel terkait.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[#153F32]/10 bg-white p-8 lg:p-10">
                            <BadgeCheck className="h-7 w-7 text-[#C9783D]" />
                            <p className="mt-8 text-sm font-medium text-[#5F6B65]">Product boundary</p>
                            <h3 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-[#18201D]">Bukan ERP manufacturing panel.</h3>
                            <p className="mt-5 text-sm leading-7 text-[#68736E]">
                                Arusantara berhenti pada technical procurement dan Deal. Production planning, manufacturing execution, payment, dan final certification berada di luar MVP.
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#153F32]/10 pt-8">
                        <div>
                            <p className="text-sm font-bold text-[#18201D]">Lihat detail negosiasi teknis.</p>
                            <p className="mt-1 text-sm text-[#68736E]">Technical deviation menjadi penghubung customer dan maker.</p>
                        </div>
                        <Link href="/permintaan-penawaran" className="inline-flex items-center gap-2 rounded-xl bg-[#153F32] px-5 py-3 text-sm font-bold text-white">
                            Pelajari RFQ <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>
            </main>
        </PublicSiteShell>
    );
}

function MakerRow({ title, detail, status }: { title: string; detail: string; status: string }) {
    return (
        <div className="grid gap-3 px-6 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
                <p className="text-sm font-bold text-white/88">{title}</p>
                <p className="mt-1 text-xs leading-5 text-white/48">{detail}</p>
            </div>
            <span className="w-fit rounded-full bg-[#E7B083]/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#F0D0B2]">{status}</span>
        </div>
    );
}
