import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, FileText, Gauge, Settings2, Store } from 'lucide-react';
import { GradientHero, PublicSiteShell } from '@/components/public-site-shell';
import { register } from '@/routes';

const steps = [
    ['01', Settings2, 'Masukkan kebutuhan equipment', 'Customer memilih perangkat, jumlah, status, dan pola pemakaian.'],
    ['02', Gauge, 'Bangun preliminary engineering', 'Sistem menghitung hanya dari data yang tersedia dan menandai parameter yang perlu verification.'],
    ['03', FileText, 'Buat permintaan penawaran', 'Engineering snapshot dibawa menjadi technical baseline pada RFQ.'],
    ['04', Store, 'Panel maker merespons', 'Maker menyusun quotation dan technical deviation terhadap baseline yang sama.'],
    ['05', BadgeCheck, 'Negosiasi hingga Deal', 'Revision dan keputusan diteruskan sampai technical dan commercial terms diterima.'],
] as const;

export default function CaraKerjaPage() {
    return <PublicSiteShell><Head title="Cara Kerja" /><main>
        <GradientHero eyebrow="Cara Kerja" title="Dari equipment sampai Deal, tanpa kehilangan konteks teknis di tengah jalan." body="Arusantara dirancang sebagai workflow berurutan. Setiap tahap mewarisi technical context dari tahap sebelumnya sehingga customer dan maker membahas kebutuhan yang sama.">
            <div className="mt-8"><Link href={register()} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#153F32]">Mulai Project <ArrowRight className="h-4 w-4" /></Link></div>
        </GradientHero>
        <section className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:py-28">
            <div className="overflow-hidden rounded-2xl border border-[#153F32]/10 bg-white">{steps.map(([no,Icon,title,body],i)=><div key={no} className={`grid gap-5 p-7 sm:grid-cols-[80px_54px_1fr] sm:items-start lg:p-9 ${i?'border-t border-[#153F32]/10':''}`}><span className="font-mono text-xs font-bold tracking-[0.16em] text-[#C9783D]">{no}</span><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#153F32]/8 text-[#153F32]"><Icon className="h-5 w-5" /></span><div><h2 className="text-2xl font-bold tracking-[-0.04em]">{title}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#68736E]">{body}</p></div></div>)}</div>
        </section>
    </main></PublicSiteShell>;
}
