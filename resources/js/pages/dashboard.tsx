import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, FileText, FolderKanban, Plus, Wrench } from 'lucide-react';

const customerFlow = [
    {
        title: 'Project',
        description: 'Isi informasi dasar usaha.',
        icon: FolderKanban,
    },
    {
        title: 'Equipment',
        description: 'Pilih model dan jumlah yang digunakan.',
        icon: Wrench,
    },
    {
        title: 'Engineering',
        description: 'Jalankan perhitungan dari data yang tersedia.',
        icon: FileText,
    },
];

const makerFlow = [
    {
        title: 'RFQ',
        description: 'Buka RFQ dan baca baseline teknisnya.',
        icon: FolderKanban,
    },
    {
        title: 'Quotation',
        description: 'Susun harga, lead time, dan item penawaran.',
        icon: FileText,
    },
    {
        title: 'Revision',
        description: 'Catat perubahan dan technical deviation.',
        icon: Wrench,
    },
];

export default function Dashboard() {
    const { auth } = usePage().props;
    const role = String(auth.user.role ?? 'customer');
    const isMaker = role === 'maker';
    const firstName = auth.user.name.trim().split(/\s+/)[0] || 'Pengguna';
    const flow = isMaker ? makerFlow : customerFlow;
    const primaryHref = isMaker ? '/maker/rfqs' : '/projects/create';
    const primaryLabel = isMaker ? 'Buka RFQ' : 'Buat project';
    const secondaryHref = isMaker ? '/maker/rfqs' : '/projects';
    const secondaryLabel = isMaker ? 'Lihat quotation' : 'Project saya';

    return (
        <>
            <Head title="Dashboard" />

            <main className="min-h-[calc(100vh-60px)] bg-[#f7f5ef] text-[#18201d]">
                <div className="mx-auto w-full max-w-[1220px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                    <header className="flex flex-col gap-6 border-b border-[#153f32]/10 pb-8 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-xs font-medium text-[#68736e]">
                                Dashboard
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                                Halo, {firstName}.
                            </h1>
                            <p className="mt-2 text-sm text-[#68736e]">
                                {isMaker
                                    ? 'Buka RFQ yang masuk atau lanjutkan quotation yang sedang dikerjakan.'
                                    : 'Buka project yang ada atau mulai project baru.'}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Link
                                href={secondaryHref}
                                className="inline-flex h-10 items-center justify-center rounded-lg border border-[#153f32]/15 bg-white px-4 text-sm font-medium text-[#153f32] transition hover:bg-[#f1eee6]"
                            >
                                {secondaryLabel}
                            </Link>
                            <Link
                                href={primaryHref}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#153f32] px-4 text-sm font-semibold text-white transition hover:bg-[#255947]"
                            >
                                {!isMaker && <Plus className="h-4 w-4" />}
                                {primaryLabel}
                                {isMaker && <ArrowRight className="h-4 w-4" />}
                            </Link>
                        </div>
                    </header>

                    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <section className="rounded-xl border border-[#153f32]/10 bg-white p-6 sm:p-7">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold tracking-[-0.02em]">
                                        Alur kerja
                                    </h2>
                                    <p className="mt-1 text-sm text-[#68736e]">
                                        {isMaker
                                            ? 'Urutan kerja dari RFQ sampai revisi.'
                                            : 'Urutan dasar dari project sampai hasil engineering.'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 divide-y divide-[#153f32]/10">
                                {flow.map((item, index) => {
                                    const Icon = item.icon;

                                    return (
                                        <div
                                            key={item.title}
                                            className="grid grid-cols-[34px_36px_minmax(0,1fr)] items-start gap-3 py-5"
                                        >
                                            <span className="pt-1 text-xs font-semibold text-[#c9783d] tabular-nums">
                                                0{index + 1}
                                            </span>
                                            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#153f32]/[0.06] text-[#153f32]">
                                                <Icon className="h-4 w-4" />
                                            </span>
                                            <div>
                                                <h3 className="text-sm font-semibold">
                                                    {item.title}
                                                </h3>
                                                <p className="mt-1 text-sm leading-6 text-[#68736e]">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        <aside className="rounded-xl bg-[#153f32] p-6 text-[#f6f1e7] sm:p-7">
                            <p className="text-sm font-semibold">
                                Catatan engineering
                            </p>
                            <p className="mt-3 text-sm leading-6 text-white/70">
                                Data teknis yang belum tersedia tetap ditandai
                                untuk verifikasi. Sistem tidak mengisinya dengan
                                angka perkiraan.
                            </p>
                            {!isMaker && (
                                <Link
                                    href="/projects/create"
                                    className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-[#f6f1e7] px-4 text-sm font-semibold text-[#153f32] transition hover:bg-white"
                                >
                                    Buat project
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            )}
                        </aside>
                    </div>
                </div>
            </main>
        </>
    );
}
