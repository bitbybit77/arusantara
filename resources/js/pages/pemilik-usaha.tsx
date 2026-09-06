import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Check, Gauge, ShoppingBag, Wrench } from 'lucide-react';
import { GradientHero, PublicSiteShell } from '@/components/public-site-shell';
import { register } from '@/routes';

const principles = [
    'Parameter yang belum tersedia tetap ditandai unknown.',
    'Hasil bersifat preliminary dan membutuhkan final verification.',
    'Customer tidak dipaksa mengisi data teknis yang tidak diketahui.',
    'Setiap warning dan assumption tetap terlihat.',
];

export default function PemilikUsahaPage() {
    return (
        <PublicSiteShell>
            <Head title="Untuk Pemilik Usaha" />
            <main>
                <GradientHero
                    eyebrow="Untuk Pemilik Usaha"
                    title="Mulai dari mesin dan perangkat yang Anda gunakan. Arusantara menerjemahkan sisanya."
                    body="Anda tidak perlu memulai dari breaker, design current, atau spesifikasi panel. Masukkan konteks usaha dan equipment, lalu Arusantara membangun preliminary engineering baseline dari data yang tersedia."
                >
                    <div className="mt-8">
                        <Link
                            href={register()}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#153F32]"
                        >
                            Mulai Project <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </GradientHero>

                <section className="mx-auto max-w-[1300px] px-5 py-20 sm:px-8 lg:py-28">
                    <div className="grid gap-5 md:grid-cols-3">
                        <Card
                            icon={ShoppingBag}
                            title="Pilih equipment"
                            body="Pilih perangkat berdasarkan model dan kebutuhan operasional yang dipahami."
                        />
                        <Card
                            icon={Gauge}
                            title="Lihat hasil awal"
                            body="Connected load, status verification, dan preliminary recommendation dijelaskan secara bertahap."
                        />
                        <Card
                            icon={Wrench}
                            title="Bawa ke panel maker"
                            body="Technical baseline yang sama diteruskan ke proses permintaan penawaran."
                        />
                    </div>

                    <div className="mt-10 rounded-2xl bg-[#153F32] p-8 text-white">
                        <h2 className="text-3xl font-bold tracking-[-0.045em]">Yang tidak diketahui tidak akan dipalsukan.</h2>
                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            {principles.map((principle) => (
                                <p key={principle} className="flex gap-3 text-sm leading-6 text-white/70">
                                    <Check className="mt-1 h-4 w-4 shrink-0 text-[#E7B083]" />
                                    {principle}
                                </p>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </PublicSiteShell>
    );
}

function Card({ icon: Icon, title, body }: { icon: typeof Gauge; title: string; body: string }) {
    return (
        <div className="rounded-2xl border border-[#153F32]/10 bg-white p-7">
            <Icon className="h-6 w-6 text-[#153F32]" />
            <h2 className="mt-7 text-2xl font-bold">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#68736E]">{body}</p>
        </div>
    );
}
