import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Check, Compass, Link2, ShieldCheck, Workflow } from 'lucide-react';
import { GradientHero, PublicSiteShell } from '@/components/public-site-shell';
import { register } from '@/routes';

export default function AboutPage() {
    return (
        <PublicSiteShell>
            <Head title="Tentang Arusantara" />
            <main>
                <GradientHero
                    eyebrow="Tentang Arusantara"
                    title="Menjembatani bahasa kebutuhan usaha dan bahasa engineering panel."
                    body="Customer memahami equipment yang digunakan. Panel maker membutuhkan technical specification. Arusantara dibangun untuk menerjemahkan gap tersebut menjadi preliminary engineering baseline dan procurement workflow yang lebih terstruktur."
                >
                    <div className="mt-8">
                        <Link href={register()} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#153F32]">
                            Mulai Project <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </GradientHero>

                <section className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
                    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                        <div className="rounded-2xl bg-[#153F32] p-8 text-white lg:p-10">
                            <p className="text-sm font-medium text-white/60">Masalah</p>
                            <h2 className="mt-4 text-4xl font-bold tracking-[-0.055em]">Customer tidak seharusnya harus menjadi engineer sebelum bisa meminta panel.</h2>
                            <p className="mt-5 text-sm leading-7 text-white/62">
                                Input teknis seperti breaker, design current, atau power factor sering bukan informasi yang diketahui user nonteknis sejak awal.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[#153F32]/10 bg-white p-8 lg:p-10">
                            <p className="text-sm font-medium text-[#5F6B65]">Solusi</p>
                            <h2 className="mt-4 text-4xl font-bold tracking-[-0.055em] text-[#18201D]">Mulai dari equipment. Terjemahkan menjadi technical baseline. Bawa ke RFQ.</h2>
                            <p className="mt-5 text-sm leading-7 text-[#68736E]">
                                Arusantara menghubungkan kebutuhan operasional customer dengan proses engineering awal dan procurement tanpa menyembunyikan uncertainty.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="bg-[#0D1512] text-white">
                    <div className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
                        <div className="max-w-4xl">
                            <p className="text-sm font-medium text-white/60">Positioning</p>
                            <h2 className="mt-4 text-4xl font-bold tracking-[-0.055em] sm:text-5xl">
                                Engineering Translation Platform + Preliminary Engineering Configuration + Technical Procurement Workflow.
                            </h2>
                        </div>

                        <div className="mt-12 grid gap-4 md:grid-cols-3">
                            <Value icon={Compass} title="User-first" body="Input dimulai dari equipment dan kebutuhan yang memang diketahui customer." />
                            <Value icon={Link2} title="Traceable" body="Konteks engineering tetap terhubung sampai RFQ, quotation, revision, dan Deal." />
                            <Value icon={ShieldCheck} title="Safety-aware" body="Unknown tidak dipalsukan dan final engineering tetap membutuhkan professional verification." />
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
                    <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
                        <div className="rounded-2xl bg-[linear-gradient(135deg,#E8E0D2,#F3DFCB)] p-8 lg:p-10">
                            <Workflow className="h-7 w-7 text-[#153F32]" />
                            <p className="mt-8 text-sm font-medium text-[#5F6B65]">Core journey</p>
                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                {['Equipment', 'Engineering', 'RFQ', 'Quotation', 'Technical Deviation', 'Deal'].map((item, index) => (
                                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-[#153F32]/10 bg-white/65 p-4">
                                        <span className="font-mono text-[10px] font-bold text-[#C9783D]">0{index + 1}</span>
                                        <span className="text-sm font-bold text-[#18201D]">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[#153F32]/10 bg-white p-8 lg:p-10">
                            <p className="text-sm font-medium text-[#5F6B65]">Bukan ini</p>
                            <div className="mt-6 space-y-4">
                                {[
                                    'Bukan final certified electrical design.',
                                    'Bukan marketplace elektronik.',
                                    'Bukan AI yang membuat keputusan safety-critical.',
                                    'Bukan ERP manufacturing panel maker.',
                                    'Bukan payment atau escrow platform.',
                                ].map((item) => (
                                    <div key={item} className="flex gap-3 border-b border-[#153F32]/8 pb-4 last:border-0 last:pb-0">
                                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#C9783D]" />
                                        <p className="text-sm font-semibold leading-6 text-[#68736E]">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#153F32]/10 pt-8">
                        <div>
                            <p className="text-sm font-bold text-[#18201D]">Lihat bagaimana kebutuhan diterjemahkan.</p>
                            <p className="mt-1 text-sm text-[#68736E]">Mulai dari halaman Engineering.</p>
                        </div>
                        <Link href="/engineering" className="inline-flex items-center gap-2 rounded-xl bg-[#153F32] px-5 py-3 text-sm font-bold text-white">
                            Pelajari Engineering <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>
            </main>
        </PublicSiteShell>
    );
}

function Value({ icon: Icon, title, body }: { icon: typeof Compass; title: string; body: string }) {
    return (
        <div className="rounded-2xl border border-white/12 bg-white/6 p-7">
            <Icon className="h-6 w-6 text-[#E7B083]" />
            <h3 className="mt-8 text-2xl font-bold tracking-[-0.04em]">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-white/58">{body}</p>
        </div>
    );
}
