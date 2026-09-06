import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { GradientHero, PublicSiteShell } from '@/components/public-site-shell';

const topics = [['Engineering translation','Menerjemahkan kebutuhan nonteknis menjadi technical baseline awal yang explainable.'],['Structured procurement','Membawa baseline yang sama ke panel maker melalui proses penawaran dan negosiasi terstruktur.'],['Safety boundary','Hasil Arusantara bukan final certified electrical design dan tetap membutuhkan final verification.']] as const;

export default function Page() {
    return (
        <PublicSiteShell>
            <Head title='Info Platform' />
            <main>
                <GradientHero eyebrow="Informasi Arusantara" title='Kenali apa yang dilakukan Arusantara dan apa yang sengaja tidak dilakukan.' body='Arusantara menghubungkan kebutuhan equipment, preliminary engineering, dan technical procurement dalam satu alur yang dapat ditelusuri.'>
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
