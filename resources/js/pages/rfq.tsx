import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    CheckCircle2,
    FileSearch,
    GitBranch,
    MessagesSquare,
    RefreshCw,
    Scale,
    ShieldCheck,
} from 'lucide-react';
import { GradientHero, PublicSiteShell } from '@/components/public-site-shell';
import { register } from '@/routes';

const lifecycle = [
    ['01', 'Frozen baseline', 'Engineering result yang dipilih dibekukan sebagai referensi technical procurement.', FileSearch],
    ['02', 'Publish RFQ', 'Customer mengirim kebutuhan dengan technical context yang sama kepada panel maker.', GitBranch],
    ['03', 'Quotation', 'Maker menyusun panel, service, lead time, warranty, dan commercial response.', Scale],
    ['04', 'Technical deviation', 'Perubahan terhadap baseline dicatat secara eksplisit dan bisa didiskusikan.', MessagesSquare],
    ['05', 'Revision', 'Quote V1 dan V2 tetap memiliki riwayat yang tidak saling menimpa.', RefreshCw],
    ['06', 'Deal', 'Accepted technical dan commercial terms dibekukan menjadi Deal.', BadgeCheck],
] as const;

export default function RfqPage() {
    return (
        <PublicSiteShell>
            <Head title="RFQ & Negosiasi" />
            <main>
                <GradientHero
                    eyebrow="Technical Procurement"
                    title="RFQ yang membawa konteks engineering sampai ke panel maker."
                    body="Arusantara menjaga preliminary engineering baseline tetap utuh ketika customer masuk ke quotation, technical deviation, revision, hingga Deal."
                >
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link href={register()} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-[#153F32]">
                            Mulai Project <ArrowRight className="h-4 w-4" />
                        </Link>
                        <a href="#lifecycle" className="rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white">
                            Lihat procurement flow
                        </a>
                    </div>
                </GradientHero>

                <section id="lifecycle" className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
                    <div className="max-w-4xl">
                        <p className="text-xs font-black uppercase tracking-[0.17em] text-[#C9783D]">Procurement lifecycle</p>
                        <h2 className="mt-4 text-4xl font-black tracking-[-0.055em] text-[#18201D] sm:text-5xl">
                            Satu technical baseline. Banyak keputusan. Semua tetap tercatat.
                        </h2>
                    </div>

                    <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {lifecycle.map(([no, title, body, Icon]) => (
                            <div key={no} className="rounded-[26px] border border-[#153F32]/10 bg-white p-7 transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(24,32,29,0.07)]">
                                <div className="flex items-center justify-between">
                                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#153F32]/7 text-[#153F32]"><Icon className="h-5 w-5" /></span>
                                    <span className="font-mono text-[10px] font-black tracking-[0.15em] text-[#8A7562]">{no}</span>
                                </div>
                                <h3 className="mt-8 text-2xl font-black tracking-[-0.04em] text-[#18201D]">{title}</h3>
                                <p className="mt-3 text-sm leading-6 text-[#68736E]">{body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-[#0D1512] text-white">
                    <div className="mx-auto grid max-w-[1500px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:px-12 lg:py-28">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.17em] text-[#E7B083]">Technical deviation</p>
                            <h2 className="mt-4 max-w-xl text-4xl font-black tracking-[-0.055em] sm:text-5xl">
                                Jangan sembunyikan perubahan teknis di catatan bebas.
                            </h2>
                            <p className="mt-5 max-w-xl text-base leading-7 text-white/62">
                                Ketika maker mengusulkan spesifikasi berbeda, customer melihat apa yang diminta, apa yang diusulkan, alasannya, serta dampak harga dan lead time.
                            </p>
                        </div>

                        <div className="overflow-hidden rounded-[30px] border border-white/12 bg-white/7">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-5">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/38">Technical Deviation</p>
                                    <h3 className="mt-1 text-lg font-black">TD-01</h3>
                                </div>
                                <span className="rounded-full bg-[#E7B083]/12 px-3 py-1.5 text-[10px] font-black text-[#F2D6BD]">Discuss</span>
                            </div>

                            <div className="grid gap-0 sm:grid-cols-2">
                                <Spec label="Requested specification" value="Final protection selection mengacu pada verified engineering data." />
                                <Spec label="Proposed specification" value="Nameplate dan site verification dilakukan sebelum final panel engineering." border />
                            </div>

                            <div className="grid gap-3 border-t border-white/10 p-6 sm:grid-cols-3">
                                <Meta label="Reason" value="Parameter perlu verification" />
                                <Meta label="Price impact" value="Dicatat eksplisit" />
                                <Meta label="Lead time" value="Dicatat eksplisit" />
                            </div>

                            <div className="flex flex-wrap gap-2 border-t border-white/10 p-6">
                                <button type="button" className="rounded-xl bg-white px-4 py-2.5 text-xs font-black text-[#153F32]">Accept</button>
                                <button type="button" className="rounded-xl border border-white/16 bg-white/7 px-4 py-2.5 text-xs font-black text-white">Discuss</button>
                                <button type="button" className="rounded-xl border border-white/16 bg-transparent px-4 py-2.5 text-xs font-black text-white/70">Reject</button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
                    <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
                        <div className="rounded-[30px] bg-[linear-gradient(135deg,#E8E0D2,#F3DFCB)] p-8 lg:p-10">
                            <RefreshCw className="h-7 w-7 text-[#153F32]" />
                            <p className="mt-8 text-xs font-black uppercase tracking-[0.15em] text-[#8A7562]">Quotation revision</p>
                            <h3 className="mt-3 max-w-2xl text-4xl font-black tracking-[-0.055em] text-[#18201D]">Quote V1 tidak hilang ketika V2 dibuat.</h3>
                            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#68736E]">
                                Riwayat revision menjaga proses procurement tetap dapat ditelusuri. Customer dan maker bisa melihat perubahan apa yang terjadi sepanjang negosiasi.
                            </p>
                            <div className="mt-8 grid gap-3 sm:grid-cols-3">
                                <Revision no="V1" status="Submitted" />
                                <Revision no="Discussion" status="Recorded" />
                                <Revision no="V2" status="Current" active />
                            </div>
                        </div>

                        <div className="rounded-[30px] border border-[#153F32]/10 bg-white p-8 lg:p-10">
                            <ShieldCheck className="h-7 w-7 text-[#C9783D]" />
                            <p className="mt-8 text-xs font-black uppercase tracking-[0.15em] text-[#8A7562]">Accepted terms</p>
                            <h3 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#18201D]">Deal membekukan hasil yang disepakati.</h3>
                            <div className="mt-6 space-y-3 text-sm text-[#68736E]">
                                <Line>Accepted quotation revision</Line>
                                <Line>Technical snapshot</Line>
                                <Line>Commercial snapshot</Line>
                                <Line>Agreed value</Line>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#153F32]/10 pt-8">
                        <div>
                            <p className="text-sm font-black text-[#18201D]">Panel maker menerima konteks yang sama.</p>
                            <p className="mt-1 text-sm text-[#68736E]">Lihat bagaimana maker menangani RFQ dan quotation.</p>
                        </div>
                        <Link href="/panel-makers" className="inline-flex items-center gap-2 rounded-xl bg-[#153F32] px-5 py-3 text-sm font-black text-white">
                            Halaman Panel Maker <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>
            </main>
        </PublicSiteShell>
    );
}

function Spec({ label, value, border = false }: { label: string; value: string; border?: boolean }) {
    return (
        <div className={`p-6 ${border ? 'border-t border-white/10 sm:border-l sm:border-t-0' : ''}`}>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/38">{label}</p>
            <p className="mt-3 text-sm font-semibold leading-6 text-white/82">{value}</p>
        </div>
    );
}

function Meta({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/32">{label}</p>
            <p className="mt-2 text-xs font-bold text-white/75">{value}</p>
        </div>
    );
}

function Revision({ no, status, active = false }: { no: string; status: string; active?: boolean }) {
    return (
        <div className={`rounded-2xl border p-4 ${active ? 'border-[#153F32] bg-[#153F32] text-white' : 'border-[#153F32]/10 bg-white/62 text-[#18201D]'}`}>
            <p className="text-xs font-black">{no}</p>
            <p className={`mt-1 text-[10px] font-bold ${active ? 'text-white/58' : 'text-[#68736E]'}`}>{status}</p>
        </div>
    );
}

function Line({ children }: { children: string }) {
    return <div className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 shrink-0 text-[#C9783D]" /><span>{children}</span></div>;
}
