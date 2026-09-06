import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { GradientHero, PublicSiteShell } from '@/components/public-site-shell';

const topics = [['Daya dan beban','Memahami perbedaan daya equipment, connected load, dan design load secara sederhana.'],['Satu fasa dan tiga fasa','Kapan istilah phase muncul dan kenapa karakteristik supply penting untuk equipment.'],['Panel distribusi','Peran MDP, SDP, distribution board, serta panel terkait dalam menyalurkan daya.']] as const;

export default function Page() {
    return (
        <PublicSiteShell>
            <Head title='Pengetahuan Dasar' />
            <main>
                <GradientHero eyebrow="Informasi Arusantara" title='Mulai dari konsep yang paling sering muncul dalam kebutuhan panel listrik.' body='Materi dasar dibuat untuk membantu pengguna nonteknis memahami konteks sebelum membaca hasil engineering atau berdiskusi dengan panel maker.'>
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
