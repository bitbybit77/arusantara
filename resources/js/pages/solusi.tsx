import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BriefcaseBusiness, Building2, Store } from 'lucide-react';
import { GradientHero, PublicSiteShell } from '@/components/public-site-shell';

const audiences = [
    [Building2, 'Pemilik Usaha', 'Mulai dari equipment yang Anda pahami, bukan dari breaker atau istilah teknis.', '/pemilik-usaha'],
    [Store, 'Panel Maker', 'Terima technical baseline yang lebih rapi sebelum menyusun quotation.', '/panel-makers'],
    [BriefcaseBusiness, 'Procurement / Project Team', 'Jaga spesifikasi, quotation, dan perubahan teknis tetap traceable.', '/procurement'],
] as const;

export default function SolusiPage() {
    return (
        <PublicSiteShell>
            <Head title="Solusi" />
            <main>
                <GradientHero
                    eyebrow="Solusi Arusantara"
                    title="Satu platform, kebutuhan yang berbeda untuk setiap peran."
                    body="Customer, panel maker, dan procurement tidak membutuhkan tampilan atau keputusan yang sama. Arusantara menjaga konteksnya tetap satu, lalu menyajikan workflow sesuai peran."
                />
                <section className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
                    <div className="grid gap-5 lg:grid-cols-3">
                        {audiences.map(([Icon, title, body, href]) => (
                            <Link
                                key={title}
                                href={href}
                                className="group rounded-2xl border border-[#153F32]/10 bg-white p-8"
                            >
                                <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#153F32]/8 text-[#153F32]">
                                    <Icon className="h-5 w-5" />
                                </span>
                                <h2 className="mt-8 text-3xl font-bold tracking-[-0.045em]">{title}</h2>
                                <p className="mt-4 text-sm leading-6 text-[#68736E]">{body}</p>
                                <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#153F32]">
                                    Lihat solusi
                                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>
        </PublicSiteShell>
    );
}
