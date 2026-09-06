import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { GradientHero, PublicSiteShell } from '@/components/public-site-shell';

const topics = [['1. Buat project','Tentukan kebutuhan usaha dan konteks project yang akan dianalisis.'],['2. Pilih equipment','Tambahkan perangkat, jumlah, status, dan pola penggunaan.'],['3. Engineering & penawaran','Lock configuration, lihat hasil, lalu teruskan baseline ke proses quotation.']] as const;

export default function Page() {
    return (
        <PublicSiteShell>
            <Head title='Tutorial' />
            <main>
                <GradientHero eyebrow="Informasi Arusantara" title='Ikuti workflow Arusantara langkah demi langkah.' body='Tutorial difokuskan pada aktivitas yang benar-benar dilakukan pengguna, bukan sekadar penjelasan fitur.'>
                    <Link href="/informasi" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#153F32]">Kembali ke Pusat Informasi <ArrowRight className="h-4 w-4" /></Link>
                </GradientHero>
                <section className="mx-auto max-w-[1300px] px-5 py-20 sm:px-8 lg:py-28">
                    <div className="grid gap-5 lg:grid-cols-3">
                        {topics.map(([name, description]) => (
                            <article key={name} className="rounded-2xl border border-[#153F32]/10 bg-white p-8">
                                <h2 className="mt-5 text-2xl font-bold tracking-[-0.04em]">{name}</h2>
                                <p className="mt-4 text-sm leading-6 text-[#68736E]">{description}</p>
                            </article>
                        ))}
                    </div>
                </section>
            </main>
        </PublicSiteShell>
    );
}
