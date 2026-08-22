import { Head, Link } from '@inertiajs/react';
import { dashboard } from '@/routes';

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />
            <div className="min-h-full bg-[#f3efe4] p-5 text-[#16241f] md:p-8">
                <div className="mx-auto max-w-6xl">
                    <div className="border-b border-[#16241f]/15 pb-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a56539]">
                            Arusantara workspace
                        </p>
                        <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight md:text-6xl">
                            Mulai dari kebutuhan peralatan, bukan istilah kelistrikan.
                        </h1>
                        <p className="mt-5 max-w-2xl text-sm leading-7 text-[#52615b] md:text-base">
                            Buat project, pilih equipment yang digunakan, lalu Arusantara membekukan spesifikasi dan menjalankan preliminary engineering secara transparan.
                        </p>
                    </div>

                    <div className="grid gap-4 py-8 md:grid-cols-[1.4fr_0.6fr]">
                        <Link
                            href="/projects"
                            className="group min-h-72 rounded-[2rem] bg-[#173a32] p-7 text-[#f5f0e4] transition-transform duration-200 hover:-translate-y-1 md:p-9"
                        >
                            <p className="text-xs uppercase tracking-[0.2em] text-[#d8c8aa]">Core workflow</p>
                            <h2 className="mt-6 max-w-xl font-serif text-4xl md:text-5xl">My Projects</h2>
                            <p className="mt-4 max-w-lg leading-7 text-[#dbe2dd]">
                                Buat project Laundry MVP, pilih equipment source-backed, dan lihat hasil engineering yang dapat ditelusuri.
                            </p>
                            <div className="mt-12 flex items-center justify-between border-t border-white/20 pt-5 text-sm">
                                <span>Buka workspace</span>
                                <span className="transition-transform group-hover:translate-x-1">→</span>
                            </div>
                        </Link>

                        <div className="rounded-[2rem] border border-[#16241f]/15 bg-[#ebe3d2] p-7 md:p-9">
                            <p className="text-xs uppercase tracking-[0.2em] text-[#7a6d5c]">MVP status</p>
                            <p className="mt-8 font-serif text-3xl">Laundry</p>
                            <p className="mt-3 text-sm leading-6 text-[#5d665f]">
                                Use case pertama untuk membuktikan engine end-to-end. Arsitektur project tetap generik untuk kategori usaha lain.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
