import { Head, Link } from '@inertiajs/react';
import { ArrowRight, FileText, Gauge, Workflow } from 'lucide-react';
import { GradientHero, PublicSiteShell } from '@/components/public-site-shell';

const items = [
    [Gauge, 'Engineering', 'Mulai dari equipment dan ubah kebutuhan operasional menjadi preliminary engineering specification.', '/engineering'],
    [Workflow, 'Cara Kerja', 'Pahami hubungan antara konfigurasi, engineering, penawaran, negosiasi, dan Deal.', '/cara-kerja'],
    [FileText, 'Permintaan Penawaran', 'Bawa technical baseline yang sama ke panel maker tanpa mengulang spesifikasi dari awal.', '/permintaan-penawaran'],
] as const;

export default function PlatformPage() {
    return <PublicSiteShell><Head title="Platform" /><main>
        <GradientHero eyebrow="Platform Arusantara" title="Satu alur untuk menerjemahkan kebutuhan usaha menjadi technical baseline yang siap dibawa ke proses penawaran." body="Platform Arusantara menghubungkan equipment, preliminary engineering, dan technical procurement dalam satu konteks yang tetap traceable.">
            <div className="mt-8"><Link href="/cara-kerja" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#153F32]">Lihat cara kerja <ArrowRight className="h-4 w-4" /></Link></div>
        </GradientHero>
        <section className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
            <div className="max-w-3xl"><p className="text-sm font-medium text-[#5F6B65]">Tiga lapisan utama</p><h2 className="mt-4 text-4xl font-bold tracking-[-0.055em] sm:text-5xl">Setiap bagian punya fungsi sendiri, tetapi tetap memakai konteks yang sama.</h2></div>
            <div className="mt-12 grid gap-4 lg:grid-cols-3">{items.map(([Icon,title,body,href]) => <Link key={title} href={href} className="group rounded-2xl border border-[#153F32]/10 bg-white p-8 transition hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(24,32,29,0.08)]"><span className="grid h-12 w-12 place-items-center rounded-xl bg-[#153F32]/8 text-[#153F32]"><Icon className="h-5 w-5" /></span><h3 className="mt-8 text-2xl font-bold tracking-[-0.04em]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#68736E]">{body}</p><span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#153F32]">Buka halaman <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></Link>)}</div>
        </section>
    </main></PublicSiteShell>;
}
